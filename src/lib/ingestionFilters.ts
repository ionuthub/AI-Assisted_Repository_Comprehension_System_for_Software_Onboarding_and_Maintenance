/**
 * Directories whose contents are never the subject of a comprehension question: installed
 * dependencies, build output, caches and version-control internals.
 *
 * This matters more than it looks. The file list is capped, and a repository that commits
 * its dependencies presents thousands of vendored files in tree order — so without this
 * filter the entire budget is spent on `node_modules` and the tool never sees the project's
 * own source. Observed on a real repository: 50 of 50 indexed files were dependencies, and
 * the model correctly reported that the entry point was not present.
 */
const IGNORED_DIRECTORIES = [
  "node_modules",
  "bower_components",
  "vendor",
  "dist",
  "build",
  "out",
  "coverage",
  "target",
  ".git",
  ".next",
  ".nuxt",
  ".svelte-kit",
  ".cache",
  ".turbo",
  ".venv",
  "__pycache__",
  "site-packages",
];

/**
 * Matched against whole path segments, never as substrings.
 *
 * A substring rule excludes real source: "dist" appears inside `src/utils/distance.ts`,
 * "build" inside `src/lib/builder.ts`, and ".git" inside `.github/workflows/ci.yml`. Those
 * files would then be silently missing from the index with no indication to the user.
 */
export function ignoredDirectoryFor(path: string): string | null {
  const segments = path.split("/");
  // The final segment is the filename, so only directory segments are considered.
  for (let i = 0; i < segments.length - 1; i++) {
    if (IGNORED_DIRECTORIES.includes(segments[i])) return segments[i];
  }
  return null;
}

export function isInIgnoredDirectory(path: string): boolean {
  return ignoredDirectoryFor(path) !== null;
}

/**
 * Generated dependency manifests. They are machine output rather than source a developer
 * reads, and they are large: a lockfile consumes one of the fifty index slots and fills the
 * term index with package names, which then compete with the repository's own identifiers
 * during retrieval.
 */
const GENERATED_FILES = new Set([
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "bun.lockb",
  "npm-shrinkwrap.json",
  "composer.lock",
  "Cargo.lock",
  "poetry.lock",
  "Gemfile.lock",
]);

export function isGeneratedFile(path: string): boolean {
  return GENERATED_FILES.has(path.split("/").pop() ?? "");
}

/** True for any path the ingestion layer should not index, whatever its extension. */
export function isExcludedFromIngestion(path: string): boolean {
  return isInIgnoredDirectory(path) || isGeneratedFile(path);
}
