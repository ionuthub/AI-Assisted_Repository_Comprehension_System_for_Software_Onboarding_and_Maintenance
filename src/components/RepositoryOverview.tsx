import { useMemo } from "react";
import type { Project } from "@/types/project";
import type { FileAnalysisResult } from "@/lib/staticAnalysis";
import type { ProjectOverview } from "@/lib/projectAnalyzer";

interface RepositoryOverviewProps {
  project: Project;
  overview: ProjectOverview | null;
  staticAnalyses: Record<string, FileAnalysisResult>;
  onFileSelect: (path: string) => void;
}

/** Conventional entry points, most specific first. */
const ENTRY_POINT_CANDIDATES = [
  "src/main.tsx", "src/main.ts", "src/index.tsx", "src/index.ts",
  "src/app.tsx", "src/App.tsx", "index.js", "index.ts", "main.py", "app.py",
  "src/index.js", "server.js", "app.js",
];

const TEST_PATH = /(^|\/)(__tests__|tests?|spec|fixtures?)(\/|$)|\.(test|spec)\.[jt]sx?$/i;

export default function RepositoryOverview({
  project,
  overview,
  staticAnalyses,
  onFileSelect,
}: RepositoryOverviewProps) {
  const stats = useMemo(() => {
    const indexed = project.files.filter((f) => f.content);
    const totalLines = indexed.reduce((sum, f) => sum + (f.content?.split("\n").length ?? 0), 0);
    const testFiles = indexed.filter((f) => TEST_PATH.test(f.path)).length;

    const entryPoint =
      ENTRY_POINT_CANDIDATES.find((candidate) => project.files.some((f) => f.path === candidate)) ??
      project.files.find((f) => /^(src\/)?(index|main)\.[jt]sx?$/.test(f.path))?.path ??
      null;

    const mostDependedOn = Object.values(staticAnalyses)
      .map((analysis) => ({ path: analysis.path, count: analysis.usedBy.length }))
      .filter((entry) => entry.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      indexedCount: indexed.length,
      totalLines,
      sourceFiles: indexed.length - testFiles,
      testFiles,
      entryPoint,
      mostDependedOn,
      maxDependents: mostDependedOn[0]?.count ?? 1,
    };
  }, [project, staticAnalyses]);

  const technologies = overview?.frameworks ?? [];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-8">
      <div className="min-w-0 space-y-6">
        <div className="space-y-3">
          <h1 className="text-view text-foreground">What this project is</h1>
          <p className="text-body text-foreground/90 max-w-[68ch]">
            {overview?.description || project.summary.description || "No description was available for this repository."}
          </p>
          <p className="text-meta text-muted-foreground">
            Written from the {stats.indexedCount} indexed files. Statements about anything else
            are not supported by evidence.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <section className="rounded-md border border-border bg-card p-4 space-y-1.5">
            <h2 className="text-meta font-semibold text-muted-foreground">Entry point</h2>
            {stats.entryPoint ? (
              <button
                type="button"
                onClick={() => onFileSelect(stats.entryPoint as string)}
                className="focus-ring rounded-sm text-path font-mono text-primary underline underline-offset-2 hover:text-primary-glow break-all text-left"
              >
                {stats.entryPoint}
              </button>
            ) : (
              <p className="text-ui text-foreground-secondary">Not identified in the indexed files.</p>
            )}
          </section>

          <section className="rounded-md border border-border bg-card p-4 space-y-1.5">
            <h2 className="text-meta font-semibold text-muted-foreground">Size</h2>
            <p className="text-ui font-semibold text-foreground">{stats.indexedCount} files indexed</p>
            <p className="text-meta text-muted-foreground">
              {stats.totalLines.toLocaleString()} lines · {stats.sourceFiles} source, {stats.testFiles} test
            </p>
          </section>

          <section className="rounded-md border border-border bg-card p-4 space-y-2">
            <h2 className="text-meta font-semibold text-muted-foreground">Built with</h2>
            {technologies.length > 0 ? (
              <ul className="flex flex-wrap gap-1.5">
                {technologies.slice(0, 4).map((tech) => (
                  <li
                    key={tech}
                    className="text-meta font-mono px-2 py-1 rounded border border-border bg-surface-raised text-foreground-secondary"
                  >
                    {tech}
                  </li>
                ))}
                {technologies.length > 4 && (
                  <li className="text-meta font-mono px-2 py-1 rounded border border-border bg-surface-raised text-muted-foreground">
                    +{technologies.length - 4} more
                  </li>
                )}
              </ul>
            ) : (
              <p className="text-ui text-foreground-secondary">No frameworks detected.</p>
            )}
          </section>
        </div>
      </div>

      <aside className="min-w-0 space-y-6">
        <section className="space-y-3">
          <div className="space-y-1">
            <h2 className="text-section text-foreground">Files most depended on</h2>
            <p className="text-meta text-muted-foreground">Change these and the most breaks.</p>
          </div>
          {stats.mostDependedOn.length > 0 ? (
            <ol className="space-y-2">
              {stats.mostDependedOn.map((entry) => (
                <li key={entry.path} className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onFileSelect(entry.path)}
                    className="focus-ring rounded-sm text-path font-mono text-foreground hover:text-primary truncate flex-1 text-left"
                  >
                    {entry.path}
                  </button>
                  <span className="h-1.5 w-14 rounded-full bg-secondary overflow-hidden shrink-0" aria-hidden="true">
                    <span
                      className="block h-full bg-primary"
                      style={{ width: `${Math.round((entry.count / stats.maxDependents) * 100)}%` }}
                    />
                  </span>
                  <span className="text-meta font-mono text-foreground-secondary shrink-0 w-10 text-right">
                    {entry.count} in
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-ui text-foreground-secondary">
              No import relationships were resolved between the indexed files. Import parsing
              covers JavaScript and TypeScript only.
            </p>
          )}
        </section>
      </aside>
    </div>
  );
}
