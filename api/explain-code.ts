// Security headers
const getSecurityHeaders = (origin?: string) => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'];
  const isAllowed = origin && allowedOrigins.some(allowed => origin.includes(allowed.trim()));
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self'",
  };
};

// Simple in-memory rate limiting (resets on cold start)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10; // 10 requests per minute per IP

function getRateLimitKey(headers: Headers): string {
  // Use IP address or forwarded IP
  const xff = headers.get('x-forwarded-for') || '';
  const realIp = headers.get('x-real-ip') || '';
  const ip = (xff.split(',')[0] || realIp || 'unknown').trim();
  return ip;
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    // New window
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1 };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - record.count };
}

export default async function handler(req: Request): Promise<Response> {
  // Get origin for CORS validation
  const origin = req.headers.get('origin') || undefined;
  const securityHeaders = getSecurityHeaders(origin);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(JSON.stringify({}), { status: 200, headers: securityHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: securityHeaders });
  }

  // Rate limiting
  const rateLimitKey = getRateLimitKey(req.headers);
  const { allowed, remaining } = checkRateLimit(rateLimitKey);

  const baseHeaders: HeadersInit = {
    ...securityHeaders,
    'X-RateLimit-Limit': MAX_REQUESTS_PER_WINDOW.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'Content-Type': 'application/json',
  };

  if (!allowed) {
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded. Please try again in a minute.', retryAfter: 60 }),
      { status: 429, headers: baseHeaders }
    );
  }

  try {
    const body = await req.json().catch(() => ({} as any));
    const { code, skillLevel } = body as { code?: string; skillLevel?: string };

    // Input validation
    if (!code || !skillLevel) {
      return new Response(JSON.stringify({ error: 'Missing required fields: code, skillLevel' }), { status: 400, headers: baseHeaders });
    }

    // Validate skillLevel
    const validSkillLevels = ['beginner', 'intermediate', 'advanced'];
    if (!validSkillLevels.includes(skillLevel)) {
      return new Response(JSON.stringify({ error: 'Invalid skill level' }), { status: 400, headers: baseHeaders });
    }

    // Validate code length (prevent abuse)
    if (typeof code !== 'string' || code.length > 10000) {
      return new Response(JSON.stringify({ error: 'Code must be a string with max 10,000 characters' }), { status: 400, headers: baseHeaders });
    }

    if (code.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Code cannot be empty' }), { status: 400, headers: baseHeaders });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not configured');
      return new Response(JSON.stringify({ error: 'API key not configured' }), { status: 500, headers: baseHeaders });
    }
    
    console.log('GEMINI_API_KEY is set, making request to Gemini API');

    // Enhanced skill-based prompts with structured output
    const skillPrompts: Record<string, string> = {
      beginner: `You are a friendly coding tutor explaining code to a beginner. Structure your explanation as follows:

**What it does:**
Explain in simple, everyday language what this code accomplishes.

**How it works:**
Break down the logic step-by-step using analogies (like recipes, instructions, or everyday tasks).

**Key concepts:**
List 2-3 programming concepts used here (like variables, functions, loops) with brief, jargon-free explanations.

**Real-world example:**
Give a relatable example of where this pattern is used in real applications.`,

      intermediate: `You are an experienced developer explaining code to an intermediate programmer. Structure your explanation as follows:

**Purpose:**
Clearly state what this code does and its role in the larger system.

**Implementation:**
Explain the approach, patterns, and techniques used.

**Best practices:**
Highlight any design patterns, coding standards, or best practices demonstrated.

**Things to note:**
Point out important details, edge cases, or potential gotchas.

**Related concepts:**
Mention related programming concepts or patterns they should know.`,

      advanced: `You are a senior architect reviewing code. Provide a technical analysis structured as follows:

**Architecture & Design:**
Analyze the design decisions, patterns, and architectural implications.

**Performance & Optimization:**
Discuss time/space complexity, performance characteristics, and optimization opportunities.

**Trade-offs:**
Explain the trade-offs made in this implementation and alternative approaches.

**Production considerations:**
Cover scalability, maintainability, testing, and potential issues in production.

**Improvements:**
Suggest specific refactoring or enhancement opportunities.`
    };

    const prompt = `${skillPrompts[skillLevel] || skillPrompts.beginner}\n\nCode to explain:\n\`\`\`\n${code}\n\`\`\`\n\nProvide a clear, well-structured explanation following the format above.`;
 
    // Call Gemini API with increased token limit
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1200,
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Gemini API error:', response.status, error);
      // Return 503 if Gemini API fails to indicate service unavailable
      return new Response(JSON.stringify({ error: 'AI service error', details: error }), { status: 503, headers: baseHeaders });
    }

    const data = await response.json();
    console.log('Gemini API response:', JSON.stringify(data).substring(0, 200));
    const explanation = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No explanation generated';
    
    if (!explanation || explanation === 'No explanation generated') {
      console.warn('No explanation in Gemini response:', data);
    }

    return new Response(JSON.stringify({ explanation }), { status: 200, headers: baseHeaders });

  } catch (error) {
    console.error('Error in explain-code:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: baseHeaders }
    );
  }
}

export const config = {
  runtime: 'edge',
};
