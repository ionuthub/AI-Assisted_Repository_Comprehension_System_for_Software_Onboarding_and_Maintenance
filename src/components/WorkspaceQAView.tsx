import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, FileCode2, HelpCircle } from "lucide-react";

interface WorkspaceQAViewProps {
  question: string;
  answer: string;
  isLoading: boolean;
  onBackToOverview: () => void;
  onFileSelect?: (path: string) => void;
}

export default function WorkspaceQAView({
  question,
  answer,
  isLoading,
  onBackToOverview,
  onFileSelect
}: WorkspaceQAViewProps) {
  // Extract file paths from the answer to show as cited files
  // e.g. "src/App.tsx" or "lib/utils.ts"
  const extractCitedFiles = (text: string): string[] => {
    const fileRegex = new RegExp('(?:src|components|lib|api|pages)/[a-zA-Z0-9_\\-/]+\\.(?:ts|tsx|js|jsx|css|json)', 'g');
    const matches = text.match(fileRegex) || [];
    return Array.from(new Set(matches));
  };

  const citedFiles = extractCitedFiles(answer);

  const renderContent = (content: string) => {
    return content.split("\n").map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        return (
          <h4 key={i} className="font-bold text-foreground text-sm mt-5 mb-2 first:mt-0 font-mono">
            {line.replace(/\*\*/g, "")}
          </h4>
        );
      }
      if (line.startsWith("* ") || line.startsWith("- ")) {
        return (
          <li key={i} className="ml-5 list-disc text-xs text-foreground/90 my-1 leading-relaxed">
            {line.substring(2)}
          </li>
        );
      }
      if (line.startsWith("### ")) {
        return (
          <h3 key={i} className="text-base font-semibold text-foreground mt-6 mb-3 border-b border-border/40 pb-1 font-mono">
            {line.substring(4)}
          </h3>
        );
      }
      return (
        <p key={i} className="text-xs leading-relaxed text-foreground/90 mb-3 font-normal font-sans">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-code-bg">
      {/* VS Code style editor tab */}
      <div className="bg-secondary/40 border-b border-border/80 h-9 flex items-center justify-between shrink-0 select-none px-1">
        <div className="flex h-full items-center">
          <div className="bg-code-bg text-foreground border-r border-border/80 h-full px-3.5 flex items-center gap-2 text-[11px] border-t-2 border-t-primary font-mono font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span>ai-explanation.md</span>
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

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="bg-secondary/15 p-4 rounded-[4px] border border-border">
          <span className="text-[10px] uppercase font-bold tracking-wider font-mono text-muted-foreground block mb-1">Question</span>
          <p className="text-xs font-mono font-semibold text-foreground leading-snug">"{question}"</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
            <Sparkles className="w-3.5 h-3.5 text-primary" /> Grounded AI Analysis
          </div>

          {isLoading ? (
            <div className="space-y-3 py-4">
              <div className="h-3.5 bg-secondary/35 rounded animate-pulse w-3/4" />
              <div className="h-3.5 bg-secondary/35 rounded animate-pulse w-full" />
              <div className="h-3.5 bg-secondary/35 rounded animate-pulse w-5/6" />
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none text-foreground border border-border bg-secondary/5 p-5 rounded-[4px] leading-relaxed">
              {renderContent(answer)}
            </div>
          )}
        </div>

        {!isLoading && citedFiles.length > 0 && (
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block font-mono">Source Files Referenced</span>
            <div className="grid gap-2">
              {citedFiles.map((filePath) => (
                <div
                  key={filePath}
                  className="flex items-center justify-between p-3 rounded-[4px] border border-border bg-secondary/5 hover:bg-secondary/15 transition-colors gap-3"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileCode2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="text-xs font-mono font-bold text-foreground truncate">{filePath}</span>
                  </div>
                  {onFileSelect && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-[10px] font-mono px-3 shrink-0 rounded-[4px] border-border hover:border-accent hover:bg-secondary/20 hover:text-foreground bg-background"
                      onClick={() => onFileSelect(filePath)}
                    >
                      Open File
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
