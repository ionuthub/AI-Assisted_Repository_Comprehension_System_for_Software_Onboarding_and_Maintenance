import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import type { ExcludedFile } from "@/types/project";

interface CoveragePanelProps {
  indexedFiles: number;
  totalRepositoryFiles: number;
  excluded: ExcludedFile[];
  treeTruncated?: boolean;
}

/** Excluded files grouped by the reason the ingestion filter recorded. */
function groupByReason(excluded: ExcludedFile[]): { reason: string; paths: string[] }[] {
  const groups = new Map<string, string[]>();
  for (const item of excluded) {
    const list = groups.get(item.reason);
    if (list) list.push(item.path);
    else groups.set(item.reason, [item.path]);
  }
  return [...groups.entries()]
    .map(([reason, paths]) => ({ reason, paths }))
    .sort((a, b) => b.paths.length - a.paths.length);
}

/**
 * States how much of the repository was actually read.
 *
 * The file list is capped and several filters apply, so an answer can only ever be grounded
 * in part of a repository. Leaving that implicit invites a reader to assume whole-repository
 * coverage; this panel makes the limit, and the reason for each exclusion, inspectable.
 */
export default function CoveragePanel({
  indexedFiles,
  totalRepositoryFiles,
  excluded,
  treeTruncated,
}: CoveragePanelProps) {
  const [openReason, setOpenReason] = useState<string | null>(null);
  const groups = groupByReason(excluded);
  const ratio = totalRepositoryFiles > 0 ? indexedFiles / totalRepositoryFiles : 0;
  const percent = ratio * 100;
  // Rounding a real fraction to "0%" reads as "nothing was indexed", which is wrong and
  // undermines the figure beside it.
  const percentLabel = percent > 0 && percent < 1 ? "under 1%" : `${Math.round(percent)}%`;
  // Below this, an answer is drawn from so small a slice that treating it as a statement
  // about the repository is unsafe. Said plainly rather than left for the user to infer
  // from a progress bar.
  const coverageTooLowToRelyOn = totalRepositoryFiles > 0 && ratio < 0.1;

  return (
    <section className="rounded-md border border-border bg-card p-5 space-y-4" aria-label="Repository coverage">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <h2 className="text-section text-foreground">How much of this repository was read</h2>
        <p className="text-meta text-muted-foreground">Answers can only cite indexed files</p>
      </div>

      <div
        className="h-2 rounded-full bg-secondary overflow-hidden"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={totalRepositoryFiles}
        aria-valuenow={indexedFiles}
        aria-label={`${indexedFiles} of ${totalRepositoryFiles} files indexed`}
      >
        <div className="h-full bg-primary" style={{ width: `${Math.max(percent, 1)}%` }} />
      </div>

      <p className="text-ui text-foreground">
        <span className="font-semibold">
          {indexedFiles.toLocaleString()} of {totalRepositoryFiles.toLocaleString()} files
        </span>{" "}
        indexed ({percentLabel})
      </p>

      {coverageTooLowToRelyOn && (
        <div className="flex items-start gap-2 rounded-md border border-warning/60 bg-warning/10 p-3">
          <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-ui text-foreground leading-relaxed">
            <span className="font-semibold">Coverage is too low to rely on.</span> Answers can
            only draw on the {indexedFiles.toLocaleString()} indexed files, so anything said
            about the rest of this repository is not supported by evidence. A smaller
            repository will give more dependable results.
          </p>
        </div>
      )}

      {treeTruncated && (
        <p className="text-ui text-warning">
          GitHub truncated the file listing for this repository, so some files are not
          accounted for below.
        </p>
      )}

      {groups.length > 0 && (
        <div className="space-y-2">
          <p className="text-ui font-semibold text-foreground">
            {excluded.length.toLocaleString()} file{excluded.length === 1 ? " was" : "s were"} excluded
          </p>
          <ul className="space-y-1.5">
            {groups.map((group) => {
              const isOpen = openReason === group.reason;
              return (
                <li key={group.reason}>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-ui text-foreground-secondary">
                      {group.paths.length.toLocaleString()} {group.reason.charAt(0).toLowerCase() + group.reason.slice(1)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setOpenReason(isOpen ? null : group.reason)}
                      aria-expanded={isOpen}
                      className="text-ui text-primary underline underline-offset-2 hover:text-primary-glow"
                    >
                      {isOpen ? "Hide them" : "Show them"}
                    </button>
                  </div>
                  {isOpen && (
                    <ul className="mt-2 mb-3 max-h-48 overflow-y-auto rounded border border-border bg-surface-raised divide-y divide-border">
                      {group.paths.map((path) => (
                        <li key={path} className="px-3 py-1.5 text-path font-mono text-foreground-secondary truncate">
                          {path}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
