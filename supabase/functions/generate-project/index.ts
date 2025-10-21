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
    const { projectIdea, skillLevel } = await req.json();

    if (!projectIdea) {
      throw new Error('Project idea is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log(`Generating project for idea: "${projectIdea}" at ${skillLevel} level`);

    // Call Lovable AI to generate project structure and code
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a code generation assistant. Generate a simple but complete project structure with example code based on the user's idea. Include file paths and code snippets. Tailor the complexity to the ${skillLevel} skill level.`
          },
          {
            role: 'user',
            content: `Generate a project structure and sample code for: ${projectIdea}`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error('Failed to generate project with AI');
    }

    const aiData = await response.json();
    const generatedContent = aiData.choices[0].message.content;

    // Parse the generated content to extract project structure
    const project = {
      idea: projectIdea,
      skillLevel,
      generatedContent,
      files: [
        {
          path: 'src/main.tsx',
          language: 'typescript',
          content: '// Generated code based on your idea\n' + generatedContent.substring(0, 500)
        }
      ]
    };

    console.log('Project generation complete');

    return new Response(JSON.stringify(project), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-project function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }), 
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
