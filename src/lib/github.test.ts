import { describe, it, expect } from 'vitest';
import { partitionTreeFiles } from './github';

const blob = (path: string, size = 100) => ({ path, type: 'blob' as const, size });

describe('partitionTreeFiles', () => {
  it('indexes supported source files', () => {
    const { included, excluded } = partitionTreeFiles([blob('src/app.ts'), blob('src/util.js')]);
    expect(included.map((f) => f.path)).toEqual(['src/app.ts', 'src/util.js']);
    expect(excluded).toHaveLength(0);
  });

  it('ignores directory entries', () => {
    const { included } = partitionTreeFiles([
      { path: 'src', type: 'tree' },
      blob('src/app.ts'),
    ]);
    expect(included).toHaveLength(1);
  });

  it('records unsupported file types with a reason', () => {
    const { included, excluded } = partitionTreeFiles([blob('logo.png'), blob('src/app.ts')]);
    expect(included.map((f) => f.path)).toEqual(['src/app.ts']);
    expect(excluded).toEqual([{ path: 'logo.png', reason: 'Not a supported source file' }]);
  });

  it('records oversized files with a reason', () => {
    const { excluded } = partitionTreeFiles([blob('src/huge.ts', 6 * 1024 * 1024)]);
    expect(excluded[0].reason).toMatch(/Larger than/);
  });

  it('records files beyond the analysis cap with a reason, and caps the included set', () => {
    const files = Array.from({ length: 60 }, (_, i) => blob(`src/file${i}.ts`));
    const { included, excluded, totalCandidates } = partitionTreeFiles(files);
    expect(included).toHaveLength(50);
    expect(totalCandidates).toBe(60);
    expect(excluded).toHaveLength(10);
    expect(excluded.every((e) => /Over the 50-file limit/.test(e.reason))).toBe(true);
  });

  it('rejects traversal paths rather than indexing them', () => {
    const { included, excluded } = partitionTreeFiles([blob('../secrets.ts'), blob('src/app.ts')]);
    expect(included.map((f) => f.path)).toEqual(['src/app.ts']);
    expect(excluded).toEqual([{ path: '../secrets.ts', reason: 'Unsafe path' }]);
  });

  it('counts candidates before the cap, not after', () => {
    const files = [...Array.from({ length: 55 }, (_, i) => blob(`src/f${i}.ts`)), blob('a.png')];
    const { totalCandidates } = partitionTreeFiles(files);
    expect(totalCandidates).toBe(55);
  });

  it('returns empty results for an empty tree', () => {
    expect(partitionTreeFiles([])).toEqual({ included: [], excluded: [], totalCandidates: 0 });
  });
});
