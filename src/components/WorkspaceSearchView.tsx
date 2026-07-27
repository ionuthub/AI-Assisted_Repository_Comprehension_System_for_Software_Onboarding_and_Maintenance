import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, FileCode2 } from "lucide-react";
import type { SearchResult } from "@/lib/semanticSearch";
import type { ProjectFile } from "@/types/project";

interface WorkspaceSearchViewProps {
  query: string;
  results: SearchResult[];
  projectFiles: ProjectFile[];
  onBackToOverview: () => void;
  onFileSelect?: (path: string) => void;
}

export default function WorkspaceSearchView({
  query,
  results,
  projectFiles,
  onBackToOverview,
  onFileSelect
}: WorkspaceSearchViewProps) {
  // Helper to extract a 5-line snippet containing the query terms
  const extractSnippet = (filePath: string): string => {
    const file = projectFiles.find(f => f.path === filePath);
    if (!file || !file.content) return "";

    const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    if (terms.length === 0) return file.content.slice(0, 180) + "...";

    const lines = file.content.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const lineLower = lines[i].toLowerCase();
      if (terms.some(term => lineLower.includes(term))) {
        const start = Math.max(0, i - 1);
        const end = Math.min(lines.length, i + 4);
        return lines.slice(start, end).join("\n") + (end < lines.length ? "\n..." : "");
      }
    }
    return file.content.slice(0, 180) + "...";
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-code-bg">
      {/* VS Code style editor tab */}
      <div className="bg-secondary/40 border-b border-border/80 h-9 flex items-center justify-between shrink-0 select-none px-1">
        <div className="flex h-full items-center">
          <div className="bg-code-bg text-foreground border-r border-border/80 h-full px-3.5 flex items-center gap-2 text-sm border-t-2 border-t-primary font-mono font-semibold">
            <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span>search-results.txt</span>
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 hover:bg-secondary/60 text-muted-foreground mr-2 rounded-[2px]"
          onClick={onBackToOverview}
        >
          ✕
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="bg-secondary/15 p-4 rounded-[4px] border border-border">
          <span className="text-xs font-bold tracking-wider font-mono text-muted-foreground block mb-1">Search Query</span>
          <p className="text-xs font-mono font-semibold text-foreground leading-snug">"{query}"</p>
        </div>

        {results.length > 0 ? (
          <div className="space-y-4 font-mono">
            {results.map((res) => {
              const snippet = extractSnippet(res.path);
              return (
                <div
                  key={res.path}
                  className="p-4 rounded-[4px] border border-border bg-secondary/5 hover:border-primary/30 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileCode2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="text-xs font-mono font-bold text-foreground truncate" title={res.path}>
                        {res.path}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="border border-border text-primary font-mono text-[9px] px-2 py-0.5 rounded">
                        {(res.score * 100).toFixed(0)}% Match
                      </span>
                      {onFileSelect && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs font-mono border-border hover:border-accent hover:bg-secondary/20 hover:text-foreground bg-background rounded-[4px]"
                          onClick={() => onFileSelect(res.path)}
                        >
                          Open File
                        </Button>
                      )}
                    </div>
                  </div>

                  {snippet && (
                    <div className="bg-background border border-border p-3 rounded-[4px] overflow-x-auto">
                      <pre className="text-xs font-mono leading-relaxed text-foreground/90 whitespace-pre-wrap">
                        <code>{snippet}</code>
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-border rounded-[4px] bg-secondary/5 font-mono">
            <p className="text-xs text-muted-foreground italic">No matching code files found for "{query}". Try different terms.</p>
          </div>
        )}
      </div>
    </div>
  );
}
