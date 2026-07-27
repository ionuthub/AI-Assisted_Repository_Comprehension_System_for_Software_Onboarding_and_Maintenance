import { useState } from "react";
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
  const percent = totalRepositoryFiles > 0 ? Math.round((indexedFiles / totalRepositoryFiles) * 100) : 0;

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
          {indexedFiles} of {totalRepositoryFiles} files
        </span>{" "}
        indexed ({percent}%)
      </p>

      {treeTruncated && (
        <p className="text-ui text-warning">
          GitHub truncated the file listing for this repository, so some files are not
          accounted for below.
        </p>
      )}

      {groups.length > 0 && (
        <div className="space-y-2">
          <p className="text-ui font-semibold text-foreground">
            {excluded.length} file{excluded.length === 1 ? " was" : "s were"} excluded
          </p>
          <ul className="space-y-1.5">
            {groups.map((group) => {
              const isOpen = openReason === group.reason;
              return (
                <li key={group.reason}>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-ui text-foreground-secondary">
                      {group.paths.length} {group.reason.toLowerCase()}
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
