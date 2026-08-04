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
  omittedCharacters: number;
}

export interface UnverifiedMention {
  path: string;
  reason: string;
}

/**
 * Score at which the relevance bar is drawn full.
 *
 * Scores are cosine similarity between sparse TF-IDF vectors, where a short natural-language
 * query shares few terms with any one file. They are therefore small in absolute terms even
 * when retrieval has worked perfectly, and drawing the bar at `score * 100%` rendered a
 * correct top-ranked result as a near-empty bar.
 *
 * That is not a cosmetic problem. A reader who sees an empty bar above a correct answer
 * discounts a result they should have accepted, and under-trust is as much a calibration
 * failure as over-trust.
 *
 * DERIVATION
 *
 * The value is the 90th percentile of top-ranked scores over the 24 accuracy-gate question
 * stems, each scored against the repository it was written for:
 *
 *   n = 24, min 0.042, median 0.248, p90 0.551, max 0.662
 *   percentiles by linear interpolation between closest ranks (the numpy default)
 *
 * Source: study/question-scores.json, committed in 1996285, measured against artefact
 * 1b9b0e0 with a clean working tree. Regenerate with `npm run measure:questions`.
 *
 * The earlier value of 0.60 came from a 27 July measurement produced by tooling that was
 * never committed, and a second ad-hoc computation on 30 July of the same distribution
 * disagreed with it (p90 0.59 then 0.57). Neither could be reproduced from the repository.
 * This derivation can be.
 *
 * It is fixed and recorded here rather than tuned per query, so a given score always draws
 * the same bar and two answers can be compared by eye. Changing it changes what participants
 * see, so it is frozen from here on: a display constant that moved between participants
 * would be a condition change rather than a correction, whatever a later measurement says.
 */
const SCORE_BAR_FULL_SCALE = 0.55;

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
 * evidence present, and no evidence.
 *
 * The no-evidence state is marked by an icon, a border weight, a hatched background and the
 * wording itself — never by colour alone — because a reader must be able to tell an answer
 * with supporting files from one without, and that distinction is what the study measures.
 *
 * The headings state what the panel can actually establish, which is what was retrieved and
 * sent to the model. They deliberately do not characterise the answer. An earlier wording
 * read "Grounded", which was read as a verdict that the answer was supported — it appeared
 * above answers that were outright refusals, since retrieval had returned files but the model
 * had found nothing in them. Whether an answer follows from its evidence is a judgement only
 * the reader can make, and inviting them to make it is the point of the panel.
 */
export default function EvidencePanel({
  evidence,
  unverifiedMentions,
  isLoading,
  indexedFileCount,
  totalFileCount,
  onFileSelect,
}: EvidencePanelProps) {
  const hasEvidence = evidence.length > 0;

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
      {hasEvidence ? (
        <div className="rounded-md border border-primary/60 bg-card overflow-hidden">
          <header className="flex items-center gap-2 px-4 py-3 border-b border-primary/40 bg-primary/10">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
            <h3 className="text-ui font-semibold text-foreground">
              Evidence · {evidence.length} file{evidence.length === 1 ? "" : "s"} retrieved
            </h3>
          </header>
          <p className="px-4 pt-3 text-meta text-muted-foreground">
            These files were sent to the model, in rank order. Nothing else was seen. Whether
            the answer follows from them is for you to check.
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
                      aria-label={`Keyword match score ${item.score.toFixed(2)}`}
                    >
                      <span
                        className="block h-full bg-primary"
                        style={{
                          width: `${Math.max(
                            4,
                            Math.min(100, (item.score / SCORE_BAR_FULL_SCALE) * 100)
                          )}%`,
                        }}
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
                      {item.omittedCharacters > 0 &&
                        ` · ${item.omittedCharacters} characters not sent`}
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
            <h3 className="text-ui font-semibold text-foreground">No evidence · 0 files retrieved</h3>
          </header>
          <p className="px-4 py-3 text-ui text-foreground leading-relaxed">
            No matching evidence was found in the files searched. Check the answer against the
            source before relying on it.
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
          Retrieved by keyword match after searching {indexedFileCount} of {totalFileCount}
          {" "}repository files.
          {totalFileCount > indexedFileCount &&
            ` ${totalFileCount - indexedFileCount} files were not indexed, so answers cannot draw on them.`}
          {hasEvidence &&
            ` Scores measure shared wording, not correctness; a bar is full at ${SCORE_BAR_FULL_SCALE.toFixed(
              2
            )}.`}
        </p>
      )}
    </section>
  );
}
