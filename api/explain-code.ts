import { Redis } from '@upstash/redis';
import {
  DEFAULT_GEMINI_MODEL,
  encodeGenerationEvent,
  GENERATION_CONFIG,
  MODEL_RETRY_DELAYS_MS,
  shouldRetryModelResponse,
  successfulFinishReason,
  type GenerationUsageMetadata,
} from '../src/lib/generationProtocol';
import {
  buildSystemPrompt,
  clampSystemContext,
  systemContextFitsBudget,
} from '../src/lib/promptBuilder';
import {
  buildAnswerAuditPrompt,
  buildAnswerRepairPrompt,
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
  checkedInputTokens: number;
}

const toGeminiContents = (messages: Message[]) =>
  messages.map((message) => ({
    role: message.role,
    parts: [{ text: message.content }],
  }));

const addUsage = (aggregate: AggregateUsage, usage?: GenerationUsageMetadata) => {
  aggregate.promptTokenCount += usage?.promptTokenCount ?? 0;
  aggregate.candidatesTokenCount += usage?.candidatesTokenCount ?? 0;
  aggregate.totalTokenCount += usage?.totalTokenCount ?? 0;
  aggregate.modelCalls += 1;
};

const toUsageMetadata = (usage: AggregateUsage): GenerationUsageMetadata => ({
  model: getGeminiModel(),
  promptTokenCount: usage.promptTokenCount,
  candidatesTokenCount: usage.candidatesTokenCount,
  totalTokenCount: usage.totalTokenCount,
  modelCalls: usage.modelCalls,
  checkedInputTokens: usage.checkedInputTokens,
  verifiedBeforeRelease: true,
});

const classifyGenerationError = (error: unknown) => {
  const isTimeout = error instanceof Error && error.name === 'AbortError';
  const message = error instanceof Error ? error.message : 'Generation failed';
  const inputBudgetExceeded = message.startsWith('INPUT_BUDGET_EXCEEDED:');
  return {
    status: inputBudgetExceeded ? 413 : isTimeout ? 504 : 502,
    message: inputBudgetExceeded
      ? 'Repository context exceeds the model input-token budget'
      : isTimeout
        ? 'Request timeout'
        : message,
  };
};

const waitForRetry = (delayMs: number, signal: AbortSignal): Promise<void> =>
  new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('The operation was aborted', 'AbortError'));
      return;
    }

    const timeoutId = setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, delayMs);
    const onAbort = () => {
      clearTimeout(timeoutId);
      reject(new DOMException('The operation was aborted', 'AbortError'));
    };
    signal.addEventListener('abort', onAbort, { once: true });
  });

async function fetchGeminiWithRetry(
  url: string,
  init: RequestInit,
  signal: AbortSignal,
  operation: string
): Promise<Response> {
  for (let attempt = 0; attempt <= MODEL_RETRY_DELAYS_MS.length; attempt += 1) {
    let response: Response;
    try {
      response = await fetch(url, { ...init, signal });
    } catch (error) {
      if (signal.aborted || attempt === MODEL_RETRY_DELAYS_MS.length) throw error;
      await waitForRetry(MODEL_RETRY_DELAYS_MS[attempt], signal);
      continue;
    }

    if (response.ok) return response;

    const detail = await response.text();
    if (
      attempt === MODEL_RETRY_DELAYS_MS.length ||
      !shouldRetryModelResponse(response.status, detail)
    ) {
      throw new Error(`${operation} failed (${response.status}): ${detail}`);
    }
    await waitForRetry(MODEL_RETRY_DELAYS_MS[attempt], signal);
  }

  throw new Error(`${operation} failed after retry exhaustion`);
}

async function countInputTokens(
  messages: Message[],
  systemPrompt: string,
  apiKey: string,
  signal: AbortSignal
): Promise<number> {
  const model = getGeminiModel();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:countTokens?key=${apiKey}`;
  const response = await fetchGeminiWithRetry(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      generateContentRequest: {
        model: `models/${model}`,
        contents: toGeminiContents(messages),
        systemInstruction: { parts: [{ text: systemPrompt }] },
      },
    }),
  }, signal, 'Token count request');

  const data = await response.json() as { totalTokens?: number };
  if (!Number.isFinite(data.totalTokens)) {
    throw new Error('Token count request returned no usable total');
  }
  return data.totalTokens as number;
}

async function callGemini(
  messages: Message[],
  systemPrompt: string,
  apiKey: string,
  signal: AbortSignal
): Promise<GeminiResult> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${getGeminiModel()}:generateContent?key=${apiKey}`;
  const response = await fetchGeminiWithRetry(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: toGeminiContents(messages),
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: GENERATION_CONFIG,
    }),
  }, signal, 'Model request');

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
  const checkedInputTokens = await countInputTokens(messages, systemPrompt, apiKey, signal);

  if (checkedInputTokens > MODEL_BUDGET.MAX_INPUT_TOKENS) {
    throw new Error(
      `INPUT_BUDGET_EXCEEDED:${checkedInputTokens}:${MODEL_BUDGET.MAX_INPUT_TOKENS}`
    );
  }

  const usage: AggregateUsage = {
    promptTokenCount: 0,
    candidatesTokenCount: 0,
    totalTokenCount: 0,
    modelCalls: 0,
    checkedInputTokens,
  };

  const draft = await callGemini(messages, systemPrompt, apiKey, signal);
  addUsage(usage, draft.usageMetadata);

  let reviewed = await callGemini(
    [{ role: 'user', content: buildAnswerAuditPrompt(question, draft.text) }],
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

function streamVerifiedAnswer(
  messages: Message[],
  systemContext: string,
  apiKey: string,
  abortController: AbortController,
  timeoutId: ReturnType<typeof setTimeout>,
  securityHeaders: Record<string, string>
): Response {
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    start(streamController) {
      // Send one ignorable newline immediately. The client already ignores blank NDJSON lines.
      // This commits the response before Vercel Edge's initial-response deadline while keeping
      // every unverified model token private until exhaustive generation and evidence checks pass.
      streamController.enqueue(encoder.encode('\n'));

      void (async () => {
        try {
          const verified = await generateVerifiedAnswer(
            messages,
            systemContext,
            apiKey,
            abortController.signal
          );
          clearTimeout(timeoutId);
          const usageMetadata = toUsageMetadata(verified.usage);
          streamController.enqueue(encoder.encode(
            encodeGenerationEvent({ type: 'text', text: verified.answer })
          ));
          streamController.enqueue(encoder.encode(
            encodeGenerationEvent({ type: 'complete', finishReason: 'STOP', usageMetadata })
          ));
        } catch (error) {
          clearTimeout(timeoutId);
          const failure = classifyGenerationError(error);
          streamController.enqueue(encoder.encode(
            encodeGenerationEvent({ type: 'error', error: failure.message })
          ));
        } finally {
          streamController.close();
        }
      })();
    },
    cancel() {
      clearTimeout(timeoutId);
      abortController.abort();
    },
  });

  return new Response(body, {
    status: 200,
    headers: {
      ...securityHeaders,
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Connection': 'keep-alive',
    },
  });
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
    if (rawBody.length > MODEL_BUDGET.MAX_REQUEST_BODY_CHARS) {
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
    const timeoutId = setTimeout(
      () => controller.abort(),
      MODEL_BUDGET.MAX_REQUEST_DURATION_MS
    );

    if (stream) {
      return streamVerifiedAnswer(
        messages,
        normalizedSystemContext,
        apiKey,
        controller,
        timeoutId,
        securityHeaders
      );
    }

    try {
      const verified = await generateVerifiedAnswer(
        messages,
        normalizedSystemContext,
        apiKey,
        controller.signal
      );
      clearTimeout(timeoutId);
      const usageMetadata = toUsageMetadata(verified.usage);

      return new Response(JSON.stringify({
        explanation: verified.answer,
        finishReason: 'STOP',
        usageMetadata,
      }), {
        status: 200,
        headers: { ...securityHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      clearTimeout(timeoutId);
      const failure = classifyGenerationError(error);
      return new Response(JSON.stringify({ error: failure.message }), {
        status: failure.status,
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
