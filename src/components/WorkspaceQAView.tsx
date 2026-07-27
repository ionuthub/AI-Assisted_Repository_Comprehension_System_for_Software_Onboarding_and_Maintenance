import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, FileCode2, HelpCircle, AlertTriangle } from "lucide-react";

/**
 * A file that was retrieved and supplied to the model as evidence for the answer.
 * Line numbers describe the region actually sent, so a citation can be checked against the
 * file directly rather than being taken on trust.
 */
export interface RetrievedEvidence {
  path: string;
  score: number;
  excerpt: string;
  startLine: number;
  endLine: number;
  totalLines: number;
  omittedLines: number;
}

interface WorkspaceQAViewProps {
  question: string;
  answer: string;
  isLoading: boolean;
  evidence: RetrievedEvidence[];
  onBackToOverview: () => void;
  onFileSelect?: (path: string) => void;
}

/**
 * Paths the answer mentions. Used only to detect references the model made to files that
 * were NOT retrieved, so they can be shown as unverified rather than as sources.
 */
const MENTIONED_PATH = /(?:[\w-]+\/)+[\w.-]+\.(?:ts|tsx|js|jsx|css|json|md|py|go|rb|java)/g;

export default function WorkspaceQAView({
  question,
  answer,
  isLoading,
  evidence,
  onBackToOverview,
  onFileSelect
}: WorkspaceQAViewProps) {
  const evidencePaths = new Set(evidence.map((e) => e.path));
  const isGrounded = evidence.length > 0;

  // A path the model wrote that was never supplied to it. Previously these were rendered
  // indistinguishably from real sources, so an invented path corroborated its own claim.
  const unverifiedMentions = Array.from(new Set(answer.match(MENTIONED_PATH) || []))
    .filter((path) => !evidencePaths.has(path));

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
          <div className="bg-code-bg text-foreground border-r border-border/80 h-full px-3.5 flex items-center gap-2 text-sm border-t-2 border-t-primary font-mono font-semibold">
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
          <span className="text-xs font-bold tracking-wider font-mono text-muted-foreground block mb-1">Question</span>
          <p className="text-xs font-mono font-semibold text-foreground leading-snug">"{question}"</p>
        </div>

        {/* Grounded and ungrounded answers must not look alike: the study measures whether
            participants notice when the tool is wrong, so the interface must not imply
            evidence that does not exist. */}
        {!isLoading && !isGrounded && (
          <div className="flex items-start gap-2 p-3 rounded-[4px] border border-destructive/50 bg-destructive/10">
            <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-xs font-mono text-foreground leading-relaxed">
              <span className="font-bold block mb-0.5">Not grounded in this repository</span>
              No repository files were retrieved for this question, so the answer below is not
              supported by evidence from the codebase. Verify it against the source before relying on it.
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground font-mono">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            {isGrounded ? `Grounded AI Analysis — ${evidence.length} source file${evidence.length === 1 ? "" : "s"}` : "AI Analysis (ungrounded)"}
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

        {evidence.length > 0 && (
          <div className="space-y-3">
            <span className="text-xs font-bold text-muted-foreground block font-mono">
              Evidence used ({evidence.length}) — expand to see exactly what the model was given
            </span>
            <div className="grid gap-2">
              {evidence.map((item, rank) => (
                <details
                  key={item.path}
                  className="rounded-[4px] border border-border bg-secondary/5 overflow-hidden"
                >
                  <summary className="flex items-center justify-between p-3 gap-3 cursor-pointer hover:bg-secondary/15 transition-colors">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileCode2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
                      <span className="text-xs font-mono font-bold text-foreground truncate">{item.path}</span>
                      <span className="text-xs font-mono text-muted-foreground shrink-0">
                        #{rank + 1} · {item.score.toFixed(2)} · lines {item.startLine}–{item.endLine} of {item.totalLines}
                      </span>
                    </div>
                    {onFileSelect && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs font-mono px-3 shrink-0 rounded-[4px] border-border hover:border-accent hover:bg-secondary/20 hover:text-foreground bg-background"
                        onClick={(e) => { e.preventDefault(); onFileSelect(item.path); }}
                      >
                        Open file
                      </Button>
                    )}
                  </summary>
                  <div className="border-t border-border bg-code-bg">
                    <pre className="text-xs font-mono text-foreground/80 p-3 overflow-x-auto max-h-64 whitespace-pre-wrap">
                      {item.excerpt}
                    </pre>
                    {item.omittedLines > 0 && (
                      <p className="text-xs font-mono text-muted-foreground px-3 pb-3">
                        Truncated — {item.omittedLines} of {item.totalLines} lines were not sent.
                      </p>
                    )}
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}

        {!isLoading && unverifiedMentions.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-muted-foreground block font-mono">
              Mentioned but not retrieved
            </span>
            <p className="text-xs font-mono text-muted-foreground leading-relaxed">
              The answer refers to these paths, but they were not part of the evidence supplied to
              the model. Treat any claim about them as unverified.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {unverifiedMentions.map((path) => (
                <span
                  key={path}
                  className="text-xs font-mono px-2 py-1 rounded-[3px] border border-dashed border-muted-foreground/50 text-muted-foreground"
                >
                  {path}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
