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

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('LOVABLE_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    console.log(`Generating project for idea: "${projectIdea}" at ${skillLevel} level`);

    // Call Google Gemini API directly
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + GEMINI_API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a code generation assistant. Generate a simple but complete project structure with example code based on the user's idea. Include file paths and code snippets. Tailor the complexity to the ${skillLevel} skill level.
            
User Request: Generate a project structure and sample code for: ${projectIdea}`
          }]
        }]
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
