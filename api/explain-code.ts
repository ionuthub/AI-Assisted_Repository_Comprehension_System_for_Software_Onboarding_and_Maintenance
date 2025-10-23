// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
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
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(JSON.stringify({}), { status: 200, headers: { ...corsHeaders } });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders } });
  }

  // Rate limiting
  const rateLimitKey = getRateLimitKey(req.headers);
  const { allowed, remaining } = checkRateLimit(rateLimitKey);

  const baseHeaders: HeadersInit = {
    ...corsHeaders,
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

    // Skill-based prompts
    const skillPrompts: Record<string, string> = {
      beginner: "Explain this code in simple terms that a beginner can understand. Use everyday analogies and avoid jargon. Focus on WHAT it does and WHY it's useful.",
      intermediate: "Explain this code for someone with programming experience. Use proper technical terms, discuss patterns, and mention best practices.",
      advanced: "Provide an in-depth technical analysis. Discuss architectural decisions, performance implications, trade-offs, and potential improvements."
    };

    const prompt = `${skillPrompts[skillLevel] || skillPrompts.beginner}\n\nCode to explain:\n\`\`\`\n${code}\n\`\`\``;

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Gemini API error:', response.status, error);
      return new Response(JSON.stringify({ error: 'AI service error' }), { status: response.status, headers: baseHeaders });
    }

    const data = await response.json();
    const explanation = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No explanation generated';

    return new Response(JSON.stringify({ explanation }), { status: 200, headers: baseHeaders });

  } catch (error) {
    console.error('Error in explain-code:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

export const config = {
  runtime: 'edge',
};
