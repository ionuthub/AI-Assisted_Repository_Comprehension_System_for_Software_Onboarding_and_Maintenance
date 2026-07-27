import { AlertTriangle, CheckCircle2, FileCode2, Loader2 } from "lucide-react";

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

export interface UnverifiedMention {
  path: string;
  reason: string;
}

interface EvidencePanelProps {
  evidence: RetrievedEvidence[];
  unverifiedMentions: UnverifiedMention[];
  isLoading: boolean;
  indexedFileCount?: number;
  totalFileCount?: number;
  onFileSelect?: (path: string) => void;
}

/**
 * The evidence behind an answer, in the three states the design system defines: retrieving,
 * grounded, and not grounded.
 *
 * The not-grounded state is marked by an icon, a border weight, a hatched background and the
 * word itself — never by colour alone — because a participant must be able to tell a
 * grounded answer from an ungrounded one, and that distinction is what the study measures.
 */
export default function EvidencePanel({
  evidence,
  unverifiedMentions,
  isLoading,
  indexedFileCount,
  totalFileCount,
  onFileSelect,
}: EvidencePanelProps) {
  const isGrounded = evidence.length > 0;

  if (isLoading) {
    return (
      <section aria-label="Evidence" aria-busy="true" className="rounded-md border border-border bg-card">
        <header className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" aria-hidden="true" />
          <h3 className="text-ui font-semibold text-foreground">Retrieving evidence…</h3>
        </header>
        <div className="p-4 space-y-2">
          <div className="h-3 rounded bg-secondary animate-pulse w-full" />
          <div className="h-3 rounded bg-secondary animate-pulse w-5/6" />
          <div className="h-3 rounded bg-secondary animate-pulse w-2/3" />
          {indexedFileCount !== undefined && (
            <p className="text-meta text-muted-foreground pt-2">Searching {indexedFileCount} indexed files</p>
          )}
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Evidence" className="space-y-4">
      {isGrounded ? (
        <div className="rounded-md border border-primary/60 bg-card overflow-hidden">
          <header className="flex items-center gap-2 px-4 py-3 border-b border-primary/40 bg-primary/10">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
            <h3 className="text-ui font-semibold text-foreground">
              Grounded · {evidence.length} file{evidence.length === 1 ? "" : "s"} retrieved
            </h3>
          </header>
          <p className="px-4 pt-3 text-meta text-muted-foreground">
            These files were sent to the model, in rank order. Nothing else was seen.
          </p>
          <ol className="p-3 space-y-2">
            {evidence.map((item, rank) => (
              <li key={item.path}>
                <details className="rounded border border-border bg-surface-raised overflow-hidden">
                  <summary className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-secondary/60">
                    <span className="text-meta font-mono text-muted-foreground shrink-0" aria-hidden="true">
                      {rank + 1}
                    </span>
                    <FileCode2 className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
                    <span className="text-path font-mono text-foreground truncate flex-1">{item.path}</span>
                    <span
                      className="h-1.5 w-16 rounded-full bg-secondary shrink-0 overflow-hidden"
                      role="img"
                      aria-label={`Relevance ${item.score.toFixed(2)}`}
                    >
                      <span
                        className="block h-full bg-primary"
                        style={{ width: `${Math.max(4, Math.min(100, item.score * 100))}%` }}
                      />
                    </span>
                    <span className="text-meta font-mono text-foreground-secondary shrink-0 w-10 text-right">
                      {item.score.toFixed(2)}
                    </span>
                  </summary>
                  <div className="border-t border-border bg-code-bg">
                    <p className="px-3 py-2 text-meta font-mono text-muted-foreground border-b border-border">
                      Lines {item.startLine}–{item.endLine} of {item.totalLines}
                      {item.omittedLines > 0 && ` · ${item.omittedLines} lines not sent`}
                    </p>
                    <pre className="text-code font-mono text-foreground/90 p-3 overflow-x-auto max-h-72 whitespace-pre-wrap">
                      {item.excerpt}
                    </pre>
                    {onFileSelect && (
                      <div className="px-3 pb-3">
                        <button
                          type="button"
                          onClick={() => onFileSelect(item.path)}
                          className="text-ui text-primary underline underline-offset-2 hover:text-primary-glow"
                        >
                          Open {item.path}
                        </button>
                      </div>
                    )}
                  </div>
                </details>
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <div
          className="rounded-md border-2 border-destructive bg-card overflow-hidden"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, hsl(var(--destructive) / 0.08) 0 8px, transparent 8px 16px)",
          }}
        >
          <header className="flex items-center gap-2 px-4 py-3 border-b border-destructive/50 bg-destructive/20">
            <AlertTriangle className="w-4 h-4 text-destructive shrink-0" aria-hidden="true" />
            <h3 className="text-ui font-semibold text-foreground">Not grounded · 0 files retrieved</h3>
          </header>
          <p className="px-4 py-3 text-ui text-foreground leading-relaxed">
            Nothing in this repository supports the answer below. Check it against the source
            before relying on any of it.
          </p>
        </div>
      )}

      {unverifiedMentions.length > 0 && (
        <div className="rounded-md border border-warning/60 bg-card overflow-hidden">
          <header className="flex items-center gap-2 px-4 py-3 border-b border-warning/40 bg-warning/10">
            <AlertTriangle className="w-4 h-4 text-warning shrink-0" aria-hidden="true" />
            <h3 className="text-ui font-semibold text-foreground">
              Unverified mentions ({unverifiedMentions.length})
            </h3>
          </header>
          <p className="px-4 pt-3 text-meta text-muted-foreground">
            The answer names these paths, but they were not retrieved. Check them yourself
            before relying on them.
          </p>
          <ul className="p-3 space-y-1.5">
            {unverifiedMentions.map((mention) => (
              <li
                key={mention.path}
                className="flex items-center justify-between gap-3 px-3 py-2 rounded border border-dashed border-border-strong"
              >
                <span className="text-path font-mono text-foreground-secondary truncate">{mention.path}</span>
                <span className="text-meta text-muted-foreground shrink-0">{mention.reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {indexedFileCount !== undefined && totalFileCount !== undefined && (
        <p className="text-meta text-muted-foreground leading-relaxed">
          Retrieved by keyword match over {indexedFileCount} of {totalFileCount} indexed files.
          {totalFileCount > indexedFileCount &&
            ` ${totalFileCount - indexedFileCount} files could not be searched.`}
        </p>
      )}
    </section>
  );
}
