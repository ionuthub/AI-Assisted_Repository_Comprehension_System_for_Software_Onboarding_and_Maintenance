import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Star, GitFork, Github, FolderOpen, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGitHubAuth } from "@/hooks/useGitHubAuth";

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

const REPOS_PER_PAGE = 50;

const RepoSelector = ({ onRepoSelect }: RepoSelectorProps) => {
  const { toast } = useToast();
  const { hasGitHubToken, githubToken, isLoadingAuth } = useGitHubAuth();

  const [repos, setRepos] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (githubToken) {
      // Reset when token is newly available
      setRepos([]);
      setPage(1);
      setHasMore(true);
      fetchUserRepos(1, githubToken);
    }
  }, [githubToken]);

  const fetchUserRepos = async (pageToFetch: number, token: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`https://api.github.com/user/repos?sort=updated&per_page=${REPOS_PER_PAGE}&page=${pageToFetch}`, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (response.status === 401) {
        throw new Error('GitHub authorization expired. Please reconnect your account.');
      }

      if (!response.ok) {
        throw new Error('Failed to fetch repositories');
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Unexpected response from GitHub');
      }

      if (data.length < REPOS_PER_PAGE) {
        setHasMore(false);
      }

      setRepos(prev => pageToFetch === 1 ? data : [...prev, ...data]);
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

  const handleLoadMore = () => {
    if (!hasMore || isLoading || !githubToken) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchUserRepos(nextPage, githubToken);
  };

  // Memoize filtered results to improve performance with large lists
  const filteredRepos = useMemo(() => {
    if (searchQuery.trim() === "") return repos;
    return repos.filter(repo =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [repos, searchQuery]);

  const handleRepoClick = (repo: Repository) => {
    onRepoSelect(repo.html_url);
  };

  if (isLoadingAuth) {
    return <Card className="p-6"><Skeleton className="h-20 w-full" /></Card>;
  }

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

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {repos.length === 0 && isLoading ? (
          [...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))
        ) : filteredRepos.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FolderOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No repositories found</p>
          </div>
        ) : (
          <>
            {filteredRepos.map((repo) => (
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
            ))}

            {hasMore && searchQuery === "" && (
              <Button
                variant="ghost"
                className="w-full mt-2"
                onClick={handleLoadMore}
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-2" />
                    Load More
                  </>
                )}
              </Button>
            )}
          </>
        )}
      </div>
    </Card>
  );
};

export default RepoSelector;
