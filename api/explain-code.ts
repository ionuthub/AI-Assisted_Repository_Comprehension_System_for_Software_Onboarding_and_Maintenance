import { Redis } from '@upstash/redis';

// Security headers
const getSecurityHeaders = (origin?: string) => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000', 'https://aicodetutor.vercel.app'];
  const isAllowed = origin && allowedOrigins.some(allowed => origin.includes(allowed.trim()));

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
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

  const baseHeaders: HeadersInit = {
    ...securityHeaders,
    'Content-Type': 'application/json',
  };

  try {
    const body = await req.json();
    const { messages, skillLevel, systemContext } = body as {
      messages: Message[];
      skillLevel: string;
      systemContext?: string;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Missing messages' }), { status: 400, headers: baseHeaders });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), { status: 500, headers: baseHeaders });
    }

    // Semantic Cache Check
    const lastUserMessage = messages[messages.length - 1].content;
    const cacheKey = `explanation:${skillLevel}:${Buffer.from(lastUserMessage).toString('base64').substring(0, 50)}`;

    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return new Response(JSON.stringify({ explanation: cached, cached: true }), { status: 200, headers: baseHeaders });
      }
    }

    const skillPrompts: Record<string, string> = {
      beginner: "Explain like a friendly tutor for a primary student. Use analogies.",
      intermediate: "Explain for a junior developer. Focus on patterns and 'why'.",
      advanced: "Act as a senior architect. Focus on performance, trade-offs, and scalability."
    };

    const systemPrompt = `You are a Code Tutor. Level: ${skillLevel}. 
${skillPrompts[skillLevel] || skillPrompts.beginner}
${systemContext ? `Project Context:\n${systemContext}` : ''}
Always structure your first response with markdown headers.`;

    const geminiPayload = {
      contents: messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      })),
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1500,
      }
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiPayload)
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return new Response(JSON.stringify({ error: 'AI Error', details: error }), { status: 502, headers: baseHeaders });
    }

    const data = await response.json();
    const explanation = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';

    // Cache the result
    if (redis && explanation !== 'No response generated') {
      await redis.set(cacheKey, explanation, { ex: 3600 * 24 }); // Cache for 24h
    }

    return new Response(JSON.stringify({ explanation }), { status: 200, headers: baseHeaders });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Server Error' }), { status: 500, headers: baseHeaders });
  }
}

export const config = {
  runtime: 'edge',
};
