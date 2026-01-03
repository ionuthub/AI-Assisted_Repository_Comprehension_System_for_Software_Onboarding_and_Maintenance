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
    const { repoUrl, skillLevel, userId } = await req.json();

    if (!repoUrl) {
      throw new Error('Repository URL is required');
    }

    // Extract owner and repo from GitHub URL
    const match = repoUrl.match(new RegExp('github\\.com/([^/]+)/([^/]+)'));
    if (!match) {
      throw new Error('Invalid GitHub repository URL');
    }

    const [, owner, repo] = match;
    const cleanRepo = repo.replace('.git', '');

    console.log(`Analyzing repository: ${owner}/${cleanRepo} for skill level: ${skillLevel}`);

    // Get GitHub token if userId is provided
    let githubToken = null;
    if (userId) {
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.75.0');
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: profile } = await supabase
        .from('profiles')
        .select('github_access_token')
        .eq('id', userId)
        .single();

      githubToken = profile?.github_access_token;
    }

    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'AI-Code-Tutor'
    };

    if (githubToken) {
      headers['Authorization'] = `token ${githubToken}`;
    }

    // Fetch repository information from GitHub API
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}`, { headers });

    if (!repoResponse.ok) {
      throw new Error('Failed to fetch repository information');
    }

    const repoData = await repoResponse.json();

    // Fetch main file tree
    const treeResponse = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}/git/trees/${repoData.default_branch}?recursive=1`, { headers });

    if (!treeResponse.ok) {
      throw new Error('Failed to fetch repository file tree');
    }

    const treeData = await treeResponse.json();

    // Find interesting files (limit to code files)
    const codeFiles = treeData.tree
      .filter((item: any) =>
        item.type === 'blob' &&
        /\.(js|ts|tsx|jsx|py|java|cpp|c|go|rs|rb)$/.test(item.path)
      )
      .slice(0, 10); // Limit to first 10 files

    const analysis = {
      repository: {
        name: repoData.name,
        description: repoData.description,
        language: repoData.language,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count
      },
      files: codeFiles.map((file: any) => ({
        path: file.path,
        url: file.url
      })),
      skillLevel
    };

    console.log('Repository analysis complete:', analysis);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-repo function:', error);
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
