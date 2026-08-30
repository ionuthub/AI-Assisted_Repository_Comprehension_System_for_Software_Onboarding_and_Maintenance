import { useMemo } from "react";
import { FileCode2 } from "lucide-react";
import { tokenize, type SearchResult } from "@/lib/semanticSearch";
import type { ProjectFile } from "@/types/project";

interface WorkspaceSearchViewProps {
  query: string;
  results: SearchResult[];
  projectFiles: ProjectFile[];
  indexedFileCount?: number;
  totalFileCount?: number;
  onBackToOverview: () => void;
  onFileSelect?: (path: string) => void;
}

interface ResultDetail {
  path: string;
  totalLines: number;
  matchCount: number;
  matchedTerms: string[];
  snippet: string;
  snippetStartLine: number;
}

export default function WorkspaceSearchView({
  query,
  results,
  projectFiles,
  indexedFileCount,
  totalFileCount,
  onBackToOverview,
  onFileSelect,
}: WorkspaceSearchViewProps) {
  const fileByPath = useMemo(() => {
    const map = new Map<string, ProjectFile>();
    for (const file of projectFiles) map.set(file.path, file);
    return map;
  }, [projectFiles]);

  const queryTerms = useMemo(() => tokenize(query), [query]);

  const details: ResultDetail[] = useMemo(
    () =>
      results.map((result) => {
        const file = fileByPath.get(result.path);
        const content = file?.content ?? "";
        const lines = content.split(/\r?\n/);

        const matchedTerms = new Set<string>();
        let matchCount = 0;
        let bestLine = -1;

        for (let i = 0; i < lines.length; i++) {
          const lineTokens = new Set(tokenize(lines[i]));
          let lineHits = 0;
          for (const term of queryTerms) {
            if (lineTokens.has(term)) {
              matchedTerms.add(term);
              lineHits += 1;
            }
          }
          matchCount += lineHits;
          if (lineHits > 0 && bestLine === -1) bestLine = i;
        }

        const start = bestLine >= 0 ? Math.max(0, bestLine - 1) : 0;
        const end = Math.min(lines.length, start + 5);

        return {
          path: result.path,
          totalLines: lines.length,
          matchCount,
          matchedTerms: [...matchedTerms],
          snippet: lines.slice(start, end).join("\n"),
          snippetStartLine: start + 1,
        };
      }),
    [results, fileByPath, queryTerms]
  );

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-border shrink-0">
        <h1 className="text-view text-foreground">Search results</h1>
        <button
          type="button"
          onClick={onBackToOverview}
          className="focus-ring rounded-sm text-ui text-muted-foreground hover:text-foreground underline underline-offset-2"
        >
          ← Back to overview
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-5">
          <div className="flex items-baseline justify-between gap-4 flex-wrap border-b border-border pb-3">
            <p className="text-ui text-foreground">
              {results.length === 0
                ? `No files match “${query}”`
                : `${results.length} file${results.length === 1 ? "" : "s"} match “${query}”, best first`}
            </p>
            {indexedFileCount !== undefined && totalFileCount !== undefined && (
              <p className="text-meta text-muted-foreground">
                Searched {indexedFileCount} of {totalFileCount} files
              </p>
            )}
          </div>

          {results.length === 0 ? (
            <p className="text-body text-muted-foreground max-w-[60ch]">
              Nothing in the indexed files matched those terms. Only {indexedFileCount ?? "the indexed"} files
              can be searched, so the answer may still exist in a part of the repository that was
              not indexed.
            </p>
          ) : (
            <ol className="space-y-5">
              {details.map((detail) => (
                <li key={detail.path} className="space-y-2">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <button
                      type="button"
                      onClick={() => onFileSelect?.(detail.path)}
                      className="focus-ring rounded-sm inline-flex items-center gap-2 text-path font-mono text-foreground hover:text-primary underline underline-offset-2"
                    >
                      <FileCode2 className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
                      {detail.path}
                    </button>
                    <span className="text-meta text-muted-foreground">
                      {detail.totalLines} lines
                      {detail.matchCount > 0 && ` · ${detail.matchCount} match${detail.matchCount === 1 ? "" : "es"}`}
                    </span>
                  </div>

                  {detail.matchedTerms.length > 0 && (
                    <p className="text-ui text-foreground-secondary">
                      Matched {detail.matchedTerms.join(" and ")} in the code.
                    </p>
                  )}

                  {detail.snippet && (
                    <pre className="text-code font-mono text-foreground/90 bg-code-bg border border-border rounded-md p-3 overflow-x-auto">
                      {detail.snippet}
                    </pre>
                  )}
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
