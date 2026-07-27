import { describe, it, expect } from 'vitest';
import { ignoredDirectoryFor, isInIgnoredDirectory } from './ingestionFilters';

describe('ignoredDirectoryFor', () => {
  it('excludes installed dependencies at any depth', () => {
    // A repository that commits node_modules presents thousands of vendored files in tree
    // order, which consumed the entire 50-file budget and left the project's own source
    // unindexed. Observed on a real repository.
    expect(ignoredDirectoryFor('node_modules/abbrev/abbrev.js')).toBe('node_modules');
    expect(ignoredDirectoryFor('packages/api/node_modules/debug/src/index.js')).toBe('node_modules');
  });

  it('excludes build output, caches and version-control internals', () => {
    expect(isInIgnoredDirectory('dist/bundle.js')).toBe(true);
    expect(isInIgnoredDirectory('coverage/lcov-report/index.html')).toBe(true);
    expect(isInIgnoredDirectory('.git/config')).toBe(true);
    expect(isInIgnoredDirectory('.next/server/pages.js')).toBe(true);
  });

  it('matches whole segments, not substrings', () => {
    // These are real source files whose paths merely contain an ignored word. An unanchored
    // pattern silently dropped them from the index with no indication to the user.
    expect(isInIgnoredDirectory('src/utils/distance.ts')).toBe(false);
    expect(isInIgnoredDirectory('src/lib/builder.ts')).toBe(false);
    expect(isInIgnoredDirectory('.github/workflows/ci.yml')).toBe(false);
    expect(isInIgnoredDirectory('src/components/OutBox.tsx')).toBe(false);
  });

  it('does not exclude a file merely named like an ignored directory', () => {
    // The final segment is the filename and is never matched.
    expect(isInIgnoredDirectory('scripts/dist.ts')).toBe(false);
    expect(isInIgnoredDirectory('build.js')).toBe(false);
  });

  it('leaves ordinary source paths untouched', () => {
    expect(ignoredDirectoryFor('src/pages/Index.tsx')).toBeNull();
    expect(ignoredDirectoryFor('index.js')).toBeNull();
    expect(ignoredDirectoryFor('lib/router/index.js')).toBeNull();
  });
});
