import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, skillLevel, lineNumber } = await req.json();
    console.log('Received request:', { skillLevel, lineNumber, codeLength: code?.length });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Define system prompts for different skill levels
    const systemPrompts = {
      beginner: `You are a friendly coding tutor explaining code to absolute beginners. Use simple language, avoid jargon, and relate concepts to everyday things. Focus on WHAT the code does and WHY it's useful. Keep explanations conversational and encouraging.`,
      
      intermediate: `You are a coding mentor for developers with some experience. Explain the code with proper technical terms, discuss best practices, and mention common patterns. Focus on HOW things work and WHEN to use certain approaches. Include practical tips.`,
      
      advanced: `You are a senior software architect providing in-depth technical analysis. Discuss architectural decisions, performance implications, edge cases, and potential improvements. Focus on WHY specific patterns were chosen, trade-offs, and production considerations.`
    };

    const systemPrompt = systemPrompts[skillLevel as keyof typeof systemPrompts] || systemPrompts.beginner;

    let userPrompt = `Explain this code:\n\n${code}`;
    if (lineNumber !== undefined) {
      userPrompt += `\n\nFocus especially on line ${lineNumber}.`;
    }

    console.log('Calling Lovable AI with model: google/gemini-2.5-flash');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI Gateway error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('AI response received successfully');

    const explanation = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ explanation }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in explain-code function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
