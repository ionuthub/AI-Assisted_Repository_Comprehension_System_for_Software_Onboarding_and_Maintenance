import type { VercelRequest, VercelResponse } from '@vercel/node';

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

function getRateLimitKey(req: VercelRequest): string {
  // Use IP address or forwarded IP
  return req.headers['x-forwarded-for']?.toString().split(',')[0] || 
         req.headers['x-real-ip']?.toString() || 
         'unknown';
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
  const rateLimitKey = getRateLimitKey(req);
  const { allowed, remaining } = checkRateLimit(rateLimitKey);

  // Add rate limit headers
  res.setHeader('X-RateLimit-Limit', MAX_REQUESTS_PER_WINDOW.toString());
  res.setHeader('X-RateLimit-Remaining', remaining.toString());

  if (!allowed) {
    return res.status(429).json({ 
      error: 'Rate limit exceeded. Please try again in a minute.',
      retryAfter: 60 
    });
  }

  try {
    const { code, skillLevel } = req.body;

    // Input validation
    if (!code || !skillLevel) {
      return res.status(400).json({ error: 'Missing required fields: code, skillLevel' });
    }

    // Validate skillLevel
    const validSkillLevels = ['beginner', 'intermediate', 'advanced'];
    if (!validSkillLevels.includes(skillLevel)) {
      return res.status(400).json({ error: 'Invalid skill level' });
    }

    // Validate code length (prevent abuse)
    if (typeof code !== 'string' || code.length > 10000) {
      return res.status(400).json({ error: 'Code must be a string with max 10,000 characters' });
    }

    if (code.trim().length === 0) {
      return res.status(400).json({ error: 'Code cannot be empty' });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not configured');
      return res.status(500).json({ error: 'API key not configured' });
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
      return res.status(response.status).json({ error: 'AI service error' });
    }

    const data = await response.json();
    const explanation = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No explanation generated';

    return res.status(200).json({ explanation });

  } catch (error) {
    console.error('Error in explain-code:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}

export const config = {
  runtime: 'edge',
};
