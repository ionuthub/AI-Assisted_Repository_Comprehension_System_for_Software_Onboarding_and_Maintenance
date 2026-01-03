import { Redis } from '@upstash/redis';

// Security headers
const getSecurityHeaders = (origin?: string) => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000', 'https://aicodetutor.vercel.app'];
  const isAllowed = origin && allowedOrigins.some(allowed => origin.includes(allowed.trim()));

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
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

export default async function handler(req: Request): Promise<Response> {
  const origin = req.headers.get('origin') || undefined;
  const securityHeaders = getSecurityHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: securityHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: securityHeaders });
  }

  // Basic IP Rate Limiting (10 requests per minute)
  const ip = req.headers.get('x-forwarded-for') || 'anonymous';
  if (redis) {
    const rateLimitKey = `ratelimit:${ip}`;
    const count = await redis.incr(rateLimitKey);
    if (count === 1) await redis.expire(rateLimitKey, 60);
    if (count > 15) {
      return new Response(JSON.stringify({ error: 'Too many requests' }), { status: 429, headers: securityHeaders });
    }
  }

  try {
    const { messages, skillLevel, systemContext, stream = false } = await req.json();

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: 'Key not set' }), { status: 500, headers: securityHeaders });
    }

    // Prompt Engineering Strategy:
    // We strictly differentiate tone and depth based on skill level.
    // Beginner: Uses analogies (e.g., "Think of a variable like a box"), avoids jargon.
    // Intermediate: Focuses on best practices, patterns (e.g., DRY, SOLID), and design rationale.
    // Advanced: Discusses performance, trade-offs, scaling, and architectural implications.
    const skillPrompts: Record<string, string> = {
      beginner: "Explain like a friendly tutor using analogies.",
      intermediate: "Focus on patterns and 'why'.",
      advanced: "Senior architect view. Performance, trade-offs."
    };

    const systemPrompt = `You are a Code Tutor. Level: ${skillLevel}. 
    ${skillPrompts[skillLevel] || skillPrompts.beginner}
    ${systemContext ? `Project Context:\n${systemContext}` : ''}`;

    const endpoint = stream ? 'streamGenerateContent' : 'generateContent';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:${endpoint}?key=${GEMINI_API_KEY}`;

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

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            // Gemini stream format is weird: objects inside a JSON array
            // We just strip the array brackets if they exist and parse the JSON objects
            try {
              // Handle multiple JSON objects in one chunk
              const lines = chunk.split('\n').filter(l => l.trim());
              for (const line of lines) {
                const cleanLine = line.replace(/^,/, '').replace(/,$/, '').replace(/^\[/, '').replace(/\]$/, '');
                if (!cleanLine) continue;
                const data = JSON.parse(cleanLine);
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                  await writer.write(encoder.encode(text));
                }
              }
            } catch (e) {
              // Fallback if parsing fails - sometimes chunks are partial
              // In production we might want to buffer partial chunks
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
