import { Redis } from '@upstash/redis';
import {
  encodeGenerationEvent,
  extractJsonObjects,
  GENERATION_CONFIG,
  successfulFinishReason,
  type GenerationUsageMetadata,
} from '../src/lib/generationProtocol';
import {
  buildSystemPrompt,
  clampSystemContext,
  systemContextFitsBudget,
} from '../src/lib/promptBuilder';

const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:8080',
  'http://localhost:5173',
  'http://localhost:3000',
  'https://repo-comprehension-system.vercel.app',
];

const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash';
const MAX_REQUEST_BODY_CHARS = 100_000;

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

export default async function handler(req: Request): Promise<Response> {
  const origin = req.headers.get('origin') || undefined;
  const securityHeaders = getSecurityHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: securityHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: securityHeaders });
  }

  if (!isOriginAllowed(normalizeOrigin(origin))) {
    return new Response(JSON.stringify({ error: 'Origin not allowed' }), { status: 403, headers: securityHeaders });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous';
  if (redis) {
    const rateLimitKey = `ratelimit:${ip}`;
    const count = await redis.incr(rateLimitKey);
    if (count === 1) await redis.expire(rateLimitKey, 60);
    if (count > 15) {
      return new Response(JSON.stringify({ error: 'Too many requests' }), { status: 429, headers: securityHeaders });
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
      return new Response(JSON.stringify({ error: 'messages must be a non-empty array' }), { status: 400, headers: securityHeaders });
    }
    if (messages.length > 25) {
      return new Response(JSON.stringify({ error: 'Too many messages in a single request' }), { status: 400, headers: securityHeaders });
    }
    for (const message of messages) {
      if (!message || (message.role !== 'user' && message.role !== 'model') || typeof message.content !== 'string') {
        return new Response(JSON.stringify({ error: 'Invalid message format' }), { status: 400, headers: securityHeaders });
      }
      if (message.content.length > 10000) {
        return new Response(JSON.stringify({ error: 'Message content exceeds 10,000 characters' }), { status: 400, headers: securityHeaders });
      }
    }

    if (!systemContextFitsBudget(systemContext)) {
      return new Response(JSON.stringify({ error: 'Repository context exceeds the server context budget' }), {
        status: 413,
        headers: securityHeaders,
      });
    }
    const normalizedSystemContext = clampSystemContext(systemContext);

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: 'Key not set' }), { status: 500, headers: securityHeaders });
    }

    const systemPrompt = buildSystemPrompt(normalizedSystemContext);
    const endpoint = stream ? 'streamGenerateContent' : 'generateContent';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${getGeminiModel()}:${endpoint}?key=${GEMINI_API_KEY}`;

    const geminiPayload = {
      contents: messages.map((m: Message) => ({
        role: m.role,
        parts: [{ text: m.content }]
      })),
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: GENERATION_CONFIG,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiPayload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        return new Response(await response.text(), { status: response.status, headers: securityHeaders });
      }

      if (!stream) {
        const data = await response.json();
        const candidate = data.candidates?.[0];
        const explanation = candidate?.content?.parts
          ?.map((part: { text?: string }) => part.text || '')
          .join('');
        const finishReason = candidate?.finishReason;
        const usageMetadata = data.usageMetadata;

        if (!explanation || !successfulFinishReason(finishReason)) {
          return new Response(
            JSON.stringify({
              error: explanation
                ? 'Generation ended before completion'
                : 'Generation returned no answer',
              finishReason,
              usageMetadata,
            }),
            { status: 502, headers: { ...securityHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(JSON.stringify({ explanation, finishReason, usageMetadata }), {
          status: 200,
          headers: { ...securityHeaders, 'Content-Type': 'application/json' },
        });
      }

      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();

      (async () => {
        const reader = response.body?.getReader();
        let buffer = '';
        let finishReason: string | undefined;
        let usageMetadata: GenerationUsageMetadata | undefined;

        const emit = (event: Parameters<typeof encodeGenerationEvent>[0]) =>
          writer.write(encoder.encode(encodeGenerationEvent(event)));

        const consumeObjects = async (objects: unknown[]) => {
          for (const raw of objects) {
            const data = raw as {
              candidates?: Array<{
                content?: { parts?: Array<{ text?: string }> };
                finishReason?: string;
              }>;
              usageMetadata?: GenerationUsageMetadata;
            };
            const candidate = data.candidates?.[0];
            const text = candidate?.content?.parts
              ?.map((part) => part.text || '')
              .join('');
            if (text) await emit({ type: 'text', text });
            if (candidate?.finishReason) finishReason = candidate.finishReason;
            if (data.usageMetadata) usageMetadata = data.usageMetadata;
          }
        };

        try {
          if (!reader) throw new Error('Gemini response body was empty');

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const parsedChunk = extractJsonObjects(buffer);
            buffer = parsedChunk.rest;
            await consumeObjects(parsedChunk.objects);
          }

          buffer += decoder.decode();
          const parsedChunk = extractJsonObjects(buffer);
          buffer = parsedChunk.rest;
          await consumeObjects(parsedChunk.objects);

          if (buffer.replace(/\s/g, '').replaceAll(',', '').replaceAll('[', '').replaceAll(']', '')) {
            throw new Error('Gemini stream ended with incomplete JSON');
          }

          if (!successfulFinishReason(finishReason)) {
            await emit({
              type: 'error',
              error: finishReason
                ? 'Generation ended before completion'
                : 'Generation ended without a finish reason',
              finishReason,
              usageMetadata,
            });
          } else {
            await emit({ type: 'complete', finishReason, usageMetadata });
          }
        } catch (error) {
          await emit({
            type: 'error',
            error: error instanceof Error ? error.message : 'Generation stream failed',
            finishReason,
            usageMetadata,
          }).catch(() => undefined);
        } finally {
          await writer.close().catch(() => undefined);
        }
      })();

      return new Response(readable, {
        headers: {
          ...securityHeaders,
          'Content-Type': 'application/x-ndjson; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });

    } catch (e: unknown) {
      clearTimeout(timeoutId);
      if (e instanceof Error && e.name === 'AbortError') {
        return new Response(JSON.stringify({ error: 'Request timeout' }), { status: 504, headers: securityHeaders });
      }
      throw e;
    }

  } catch {
    return new Response(JSON.stringify({ error: 'Server Error' }), { status: 500, headers: securityHeaders });
  }
}

export const config = {
  runtime: 'edge',
};
