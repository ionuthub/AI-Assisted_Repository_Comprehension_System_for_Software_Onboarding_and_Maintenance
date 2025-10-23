import type { VercelRequest, VercelResponse } from '@vercel/node';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, skillLevel } = req.body;

    if (!code || !skillLevel) {
      return res.status(400).json({ error: 'Missing required fields: code, skillLevel' });
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
