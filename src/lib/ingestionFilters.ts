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
