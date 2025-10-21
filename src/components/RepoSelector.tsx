import { useState, useEffect } from "react";
import type { Session } from "@supabase/supabase-js";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Star, GitFork, Github } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
}

interface RepoSelectorProps {
  onRepoSelect: (repoUrl: string) => void;
}

const RepoSelector = ({ onRepoSelect }: RepoSelectorProps) => {
  const { toast } = useToast();
  const [repos, setRepos] = useState<Repository[]>([]);
  const [filteredRepos, setFilteredRepos] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasGitHubToken, setHasGitHubToken] = useState(false);

  useEffect(() => {
    fetchUserRepos();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredRepos(repos);
    } else {
      const filtered = repos.filter(repo =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRepos(filtered);
    }
  }, [searchQuery, repos]);

  const fetchUserRepos = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setHasGitHubToken(false);
        setRepos([]);
        setFilteredRepos([]);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('github_access_token')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profileError) {
        throw profileError;
      }

      let githubToken = profile?.github_access_token ?? null;

      if (!githubToken) {
        const { provider_token: providerToken } = session as Session & { provider_token?: string };
        if (providerToken) {
          const { data: updatedProfile, error: upsertError } = await supabase
            .from('profiles')
            .upsert({
              id: session.user.id,
              email: session.user.email,
              github_access_token: providerToken,
            }, { onConflict: 'id' })
            .select('github_access_token')
            .single();

          if (upsertError) {
            throw upsertError;
          }

          githubToken = updatedProfile?.github_access_token ?? providerToken;
        }
      }

      if (!githubToken) {
        setHasGitHubToken(false);
        setRepos([]);
        setFilteredRepos([]);
        return;
      }

      setHasGitHubToken(true);

      const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (response.status === 401) {
        setHasGitHubToken(false);
        throw new Error('GitHub authorization expired. Please reconnect your account.');
      }

      if (!response.ok) {
        throw new Error('Failed to fetch repositories');
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Unexpected response from GitHub');
      }

      setRepos(data);
      setFilteredRepos(data);
    } catch (error: any) {
      console.error('Error fetching repos:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load your repositories",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRepoClick = (repo: Repository) => {
    onRepoSelect(repo.html_url);
  };

  if (!hasGitHubToken) {
    return (
      <Card className="p-6 text-center">
        <Github className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Connect GitHub</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Sign in with GitHub to browse your repositories
        </p>
        <Button onClick={() => window.location.href = '/auth'}>
          <Github className="w-4 h-4 mr-2" />
          Sign in with GitHub
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-4 md:p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-4">Select a Repository</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search repositories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {isLoading ? (
          [...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))
        ) : filteredRepos.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No repositories found</p>
          </div>
        ) : (
          filteredRepos.map((repo) => (
            <button
              key={repo.id}
              onClick={() => handleRepoClick(repo)}
              className="w-full text-left p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-all group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm md:text-base truncate group-hover:text-primary transition-colors">
                    {repo.name}
                  </h4>
                  {repo.description && (
                    <p className="text-xs md:text-sm text-muted-foreground mt-1 line-clamp-2">
                      {repo.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    {repo.language && (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                        {repo.language}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {repo.stargazers_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitFork className="w-3 h-3" />
                      {repo.forks_count}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </Card>
  );
};

export default RepoSelector;
