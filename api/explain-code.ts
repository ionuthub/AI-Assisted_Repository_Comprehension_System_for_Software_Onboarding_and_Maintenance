import { Redis } from '@upstash/redis';

// Allowed origins are configured via ALLOWED_ORIGINS (comma-separated); the list below is
// the fallback for local development plus this project's production Vercel domain.
const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:8080',
  'http://localhost:5173',
  'http://localhost:3000',
  'https://repo-comprehension-system.vercel.app',
];

// The generation model is pinned here and overridable via GEMINI_MODEL so a Google-side
// model retirement can be handled with a configuration change rather than a code change.
// Record the exact value used when reporting results: outputs are model-dependent.
const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash';

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

// Membership of ALLOWED_ORIGINS is the only test. A prefix pattern over *.vercel.app was
// tried and removed: any account can register a project whose subdomain shares the prefix,
// which would have had the function reflect an attacker-controlled origin. Preview
// deployments are supported by adding their URL to ALLOWED_ORIGINS for that environment.
const isOriginAllowed = (normalizedOrigin?: string): boolean =>
  Boolean(normalizedOrigin) && getAllowedOrigins().includes(normalizedOrigin as string);

// Security headers
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
  skillLevel?: 'beginner' | 'intermediate' | 'advanced';
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

  // Browsers always send Origin on a POST, so a request without one is not from the
  // application. Previously the check was skipped when the header was absent, which left
  // the endpoint — and the API key it holds — reachable by any non-browser client.
  if (!isOriginAllowed(normalizeOrigin(origin))) {
    return new Response(JSON.stringify({ error: 'Origin not allowed' }), { status: 403, headers: securityHeaders });
  }

  // Basic IP rate limiting (15 requests per minute)
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
    const { messages, skillLevel, systemContext, stream = false } = await req.json() as ExplainCodeRequest;

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

    const normalizedSkillLevel = skillLevel && ['beginner', 'intermediate', 'advanced'].includes(skillLevel)
      ? skillLevel
      : 'advanced';
    const normalizedSystemContext = typeof systemContext === 'string' ? systemContext.slice(0, 12000) : '';

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: 'Key not set' }), { status: 500, headers: securityHeaders });
    }

    // Prompt Engineering Strategy:
    // Depth and register vary by skill level; the grounding and citation rules do not.
    // Beginner: Uses analogies (e.g., "Think of a variable like a box"), avoids jargon.
    // Intermediate: Focuses on best practices, patterns (e.g., DRY, SOLID), and design rationale.
    // Advanced (default): Discusses performance, trade-offs, and architectural implications.
    const skillPrompts: Record<string, string> = {
      beginner: "Explain like a friendly tutor using analogies.",
      intermediate: "Focus on patterns and design rationale — the 'why' behind the code.",
      advanced: "Respond as an experienced engineer to an experienced engineer: precise and technical, covering structure, control flow, trade-offs and maintenance impact. Do not use analogies or introductory framing."
    };

    // The grounding rules are constant across skill levels: the artefact's claim is
    // retrieval-augmented, file-cited answers, and the study measures whether participants
    // detect inaccurate ones. Hedging honestly when the evidence is absent is required.
    const systemPrompt = `You are a repository comprehension assistant. You help developers onboard to and maintain an unfamiliar codebase. Level: ${normalizedSkillLevel}.
    ${skillPrompts[normalizedSkillLevel]}
    Ground every claim in the provided repository context and cite the file paths you relied on. If the context does not contain the answer, say so plainly rather than guessing, and never invent file paths, functions or behaviour.
    ${normalizedSystemContext ? `Project Context:\n${normalizedSystemContext}` : ''}`;

    const endpoint = stream ? 'streamGenerateContent' : 'generateContent';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${getGeminiModel()}:${endpoint}?key=${GEMINI_API_KEY}`;

    const geminiPayload = {
      contents: messages.map((m: Message) => ({
        role: m.role,
        parts: [{ text: m.content }]
      })),
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: { temperature: 0.7, maxOutputTokens: 2000 }
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

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
        const explanation = data.candidates?.[0]?.content?.parts?.[0]?.text;
        return new Response(JSON.stringify({ explanation }), { status: 200, headers: { ...securityHeaders, 'Content-Type': 'application/json' } });
      }

      // Handle Streaming
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();

      (async () => {
        const reader = response.body?.getReader();
        if (!reader) return writer.close();

        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            while (true) {
              let openBraces = 0;
              let inString = false;
              let escape = false;
              let startIndex = -1;
              let endIndex = -1;

              for (let i = 0; i < buffer.length; i++) {
                const char = buffer[i];
                if (escape) {
                  escape = false;
                  continue;
                }
                if (char === '\\') {
                  escape = true;
                  continue;
                }
                if (char === '"') {
                  inString = !inString;
                  continue;
                }
                if (inString) continue;

                if (char === '{') {
                  if (openBraces === 0) startIndex = i;
                  openBraces++;
                } else if (char === '}') {
                  openBraces--;
                  if (openBraces === 0 && startIndex !== -1) {
                    endIndex = i;
                    break;
                  }
                }
              }

              if (endIndex !== -1) {
                const jsonStr = buffer.substring(startIndex, endIndex + 1);
                buffer = buffer.substring(endIndex + 1);

                try {
                  const data = JSON.parse(jsonStr);
                  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (text) {
                    await writer.write(encoder.encode(text));
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              } else {
                break;
              }
            }
          }
        } finally {
          writer.close();
        }
      })();

      return new Response(readable, {
        headers: {
          ...securityHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });

    } catch (e: unknown) {
      if (e instanceof Error && e.name === 'AbortError') {
        return new Response(JSON.stringify({ error: 'Request timeout' }), { status: 504, headers: securityHeaders });
      }
      throw e;
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Server Error' }), { status: 500, headers: securityHeaders });
  }
}

export const config = {
  runtime: 'edge',
};
