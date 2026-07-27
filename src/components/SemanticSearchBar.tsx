import { useState, useMemo } from "react";
import { Search, FileCode2, CornerDownRight, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProjectStore } from "@/store/useProjectStore";
import { searchRepository, SearchResult } from "@/lib/semanticSearch";

interface SemanticSearchBarProps {
  onFileSelect: (path: string) => void;
}

export const SemanticSearchBar = ({ onFileSelect }: SemanticSearchBarProps) => {
  const { project, searchIndex } = useProjectStore();
  const [query, setQuery] = useState("");

  const searchResults = useMemo((): SearchResult[] => {
    if (!query.trim() || !project || !searchIndex) return [];
    return searchRepository(query, searchIndex, project.files, 6);
  }, [query, project, searchIndex]);

  const clearQuery = () => {
    setQuery("");
  };

  return (
    <Card className="p-4 bg-card border-border shadow-md">
      <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
        <Search className="w-4 h-4 text-primary" /> Semantic Repository Search
      </h3>
      <p className="text-xs text-muted-foreground mb-3">
        Query concepts like "authentication", "routing", or "schema" to find relevant code assets.
      </p>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search repository codebases..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 pr-8 text-xs bg-secondary/25"
        />
        {query && (
          <button
            onClick={clearQuery}
            className="absolute right-2.5 top-2.5 hover:text-foreground text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {query.trim() && (
        <div className="mt-3 space-y-2 border-t border-border pt-3 animate-fade-in max-h-[250px] overflow-y-auto pr-1">
          {searchResults.length > 0 ? (
            searchResults.map((result) => (
              <button
                key={result.path}
                onClick={() => onFileSelect(result.path)}
                className="w-full flex items-center justify-between p-2 rounded-lg border border-border/50 bg-secondary/5 hover:bg-secondary/15 transition-all text-left group"
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <FileCode2 className="w-4 h-4 text-sky-500 shrink-0" />
                  <div className="flex flex-col truncate">
                    <span className="text-sm font-semibold text-foreground truncate">
                      {result.path.split("/").pop()}
                    </span>
                    <span className="text-[9px] text-muted-foreground truncate">
                      {result.path}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {result.language && (
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0.5 bg-background font-mono">
                      {result.language}
                    </Badge>
                  )}
                  <Badge className="bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400 border-none font-bold text-xs">
                    {(result.score * 100).toFixed(0)}% match
                  </Badge>
                </div>
              </button>
            ))
          ) : (
            <p className="text-xs text-muted-foreground italic text-center py-2">
              No matching files found for "{query}"
            </p>
          )}
        </div>
      )}
    </Card>
  );
};

export default SemanticSearchBar;
