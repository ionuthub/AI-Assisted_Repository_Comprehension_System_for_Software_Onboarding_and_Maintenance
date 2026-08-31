import { Redis } from '@upstash/redis';
import {
  encodeGenerationEvent,
  GENERATION_CONFIG,
  successfulFinishReason,
  type GenerationUsageMetadata,
} from '../src/lib/generationProtocol';
import {
  buildSystemPrompt,
  clampSystemContext,
  systemContextFitsBudget,
} from '../src/lib/promptBuilder';
import {
  buildAnswerRepairPrompt,
  buildAnswerReviewPrompt,
  extractEvidencePathsFromContext,
  verifyGeneratedAnswer,
} from '../src/lib/answerVerification';
import { MODEL_BUDGET } from '../src/constants/appConstants';

const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:8080',
  'http://localhost:5173',
  'http://localhost:3000',
  'https://repo-comprehension-system.vercel.app',
];

const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash';
const MAX_REQUEST_BODY_CHARS = 100_000;
const REQUEST_TIMEOUT_MS = 58_000;

const getGeminiModel = (): string => process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;

const getAllowedOrigins = (): string[] =>
  (process.env.ALLOWED_ORIGINS?.split(',') || DEFAULT_ALLOWED_ORIGINS)
    .map((value) => value.trim())
    .filter(Boolean);

const normalizeOrigin = (origin?: string): string | undefined => {
  if (!origin) return undefined;
  try {
    return new URL(origin).origin;
  } catch {
    return undefined;
  }
};

const isOriginAllowed = (normalizedOrigin?: string): boolean =>
  Boolean(normalizedOrigin) && getAllowedOrigins().includes(normalizedOrigin as string);

const getSecurityHeaders = (origin?: string) => {
  const allowedOrigins = getAllowedOrigins();
  const normalizedOrigin = normalizeOrigin(origin);
  const isAllowed = isOriginAllowed(normalizedOrigin);

  return {
    'Access-Control-Allow-Origin': isAllowed && normalizedOrigin ? normalizedOrigin : allowedOrigins[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Vary': 'Origin',
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'no-store',
  };
};

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
  : null;

interface Message {
  role: 'user' | 'model';
  content: string;
}

interface ExplainCodeRequest {
  messages?: Message[];
  systemContext?: string;
  stream?: boolean;
}

interface GeminiResult {
  text: string;
  finishReason: string;
  usageMetadata?: GenerationUsageMetadata;
}

interface AggregateUsage {
  promptTokenCount: number;
  candidatesTokenCount: number;
  totalTokenCount: number;
  modelCalls: number;
}

const addUsage = (aggregate: AggregateUsage, usage?: GenerationUsageMetadata) => {
  aggregate.promptTokenCount += usage?.promptTokenCount ?? 0;
  aggregate.candidatesTokenCount += usage?.candidatesTokenCount ?? 0;
  aggregate.totalTokenCount += usage?.totalTokenCount ?? 0;
  aggregate.modelCalls += 1;
};

async function callGemini(
  messages: Message[],
  systemPrompt: string,
  apiKey: string,
  signal: AbortSignal
): Promise<GeminiResult> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${getGeminiModel()}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: messages.map((message) => ({
        role: message.role,
        parts: [{ text: message.content }],
      })),
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: GENERATION_CONFIG,
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Model request failed (${response.status}): ${await response.text()}`);
  }

  const data = await response.json() as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
      finishReason?: string;
    }>;
    usageMetadata?: GenerationUsageMetadata;
  };

  const candidate = data.candidates?.[0];
  const text = candidate?.content?.parts?.map((part) => part.text || '').join('').trim() ?? '';
  const finishReason = candidate?.finishReason;

  if (!text || !successfulFinishReason(finishReason)) {
    throw new Error(
      text
        ? `Generation ended before completion (${finishReason ?? 'unknown'})`
        : 'Generation returned no answer'
    );
  }

  return {
    text,
    finishReason,
    usageMetadata: data.usageMetadata,
  };
}

async function generateVerifiedAnswer(
  messages: Message[],
  systemContext: string,
  apiKey: string,
  signal: AbortSignal
): Promise<{ answer: string; usage: AggregateUsage }> {
  const systemPrompt = buildSystemPrompt(systemContext);
  const evidencePaths = extractEvidencePathsFromContext(systemContext);
  const evidence = evidencePaths.map((path) => ({ path }));
  const question = [...messages].reverse().find((message) => message.role === 'user')?.content ?? '';
  const usage: AggregateUsage = {
    promptTokenCount: 0,
    candidatesTokenCount: 0,
    totalTokenCount: 0,
    modelCalls: 0,
  };

  const draft = await callGemini(messages, systemPrompt, apiKey, signal);
  addUsage(usage, draft.usageMetadata);

  let reviewed = await callGemini(
    [{ role: 'user', content: buildAnswerReviewPrompt(question, draft.text) }],
    systemPrompt,
    apiKey,
    signal
  );
  addUsage(usage, reviewed.usageMetadata);

  let verification = verifyGeneratedAnswer(reviewed.text, evidence);

  for (
    let attempt = 0;
    !verification.passed && attempt < MODEL_BUDGET.MAX_VERIFICATION_ATTEMPTS;
    attempt += 1
  ) {
    reviewed = await callGemini(
      [{
        role: 'user',
        content: buildAnswerRepairPrompt(question, reviewed.text, verification.reasons),
      }],
      systemPrompt,
      apiKey,
      signal
    );
    addUsage(usage, reviewed.usageMetadata);
    verification = verifyGeneratedAnswer(reviewed.text, evidence);
  }

  if (!verification.passed) {
    throw new Error(`Answer withheld by evidence gate: ${verification.reasons.join(' ')}`);
  }

  return { answer: reviewed.text, usage };
}

export default async function handler(req: Request): Promise<Response> {
  const origin = req.headers.get('origin') || undefined;
  const securityHeaders = getSecurityHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: securityHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: securityHeaders,
    });
  }

  if (!isOriginAllowed(normalizeOrigin(origin))) {
    return new Response(JSON.stringify({ error: 'Origin not allowed' }), {
      status: 403,
      headers: securityHeaders,
    });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous';
  if (redis) {
    const rateLimitKey = `ratelimit:${ip}`;
    const count = await redis.incr(rateLimitKey);
    if (count === 1) await redis.expire(rateLimitKey, 60);
    if (count > 15) {
      return new Response(JSON.stringify({ error: 'Too many requests' }), {
        status: 429,
        headers: securityHeaders,
      });
    }
  }

  try {
    const rawBody = await req.text();
    if (rawBody.length > MAX_REQUEST_BODY_CHARS) {
      return new Response(JSON.stringify({ error: 'Request exceeds the Q&A size budget' }), {
        status: 413,
        headers: securityHeaders,
      });
    }

    let parsed: ExplainCodeRequest;
    try {
      parsed = JSON.parse(rawBody) as ExplainCodeRequest;
    } catch {
      return new Response(JSON.stringify({ error: 'Request body must be valid JSON' }), {
        status: 400,
        headers: securityHeaders,
      });
    }

    const { messages, systemContext, stream = false } = parsed;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'messages must be a non-empty array' }), {
        status: 400,
        headers: securityHeaders,
      });
    }
    if (messages.length > 25) {
      return new Response(JSON.stringify({ error: 'Too many messages in a single request' }), {
        status: 400,
        headers: securityHeaders,
      });
    }
    for (const message of messages) {
      if (!message || (message.role !== 'user' && message.role !== 'model') || typeof message.content !== 'string') {
        return new Response(JSON.stringify({ error: 'Invalid message format' }), {
          status: 400,
          headers: securityHeaders,
        });
      }
      if (message.content.length > 10_000) {
        return new Response(JSON.stringify({ error: 'Message content exceeds 10,000 characters' }), {
          status: 400,
          headers: securityHeaders,
        });
      }
    }

    if (!systemContextFitsBudget(systemContext)) {
      return new Response(JSON.stringify({ error: 'Repository context exceeds the server context budget' }), {
        status: 413,
        headers: securityHeaders,
      });
    }
    const normalizedSystemContext = clampSystemContext(systemContext);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Key not set' }), {
        status: 500,
        headers: securityHeaders,
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const verified = await generateVerifiedAnswer(
        messages,
        normalizedSystemContext,
        apiKey,
        controller.signal
      );
      clearTimeout(timeoutId);

      const usageMetadata: GenerationUsageMetadata = {
        promptTokenCount: verified.usage.promptTokenCount,
        candidatesTokenCount: verified.usage.candidatesTokenCount,
        totalTokenCount: verified.usage.totalTokenCount,
        modelCalls: verified.usage.modelCalls,
        verifiedBeforeRelease: true,
      };

      if (!stream) {
        return new Response(JSON.stringify({
          explanation: verified.answer,
          finishReason: 'STOP',
          usageMetadata,
        }), {
          status: 200,
          headers: { ...securityHeaders, 'Content-Type': 'application/json' },
        });
      }

      const body =
        encodeGenerationEvent({ type: 'text', text: verified.answer }) +
        encodeGenerationEvent({ type: 'complete', finishReason: 'STOP', usageMetadata });

      return new Response(body, {
        status: 200,
        headers: {
          ...securityHeaders,
          'Content-Type': 'application/x-ndjson; charset=utf-8',
          'Connection': 'keep-alive',
        },
      });
    } catch (error) {
      clearTimeout(timeoutId);
      const isTimeout = error instanceof Error && error.name === 'AbortError';
      const message = error instanceof Error ? error.message : 'Generation failed';
      return new Response(JSON.stringify({ error: isTimeout ? 'Request timeout' : message }), {
        status: isTimeout ? 504 : 502,
        headers: { ...securityHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch {
    return new Response(JSON.stringify({ error: 'Server Error' }), {
      status: 500,
      headers: securityHeaders,
    });
  }
}

export const config = {
  runtime: 'edge',
};
