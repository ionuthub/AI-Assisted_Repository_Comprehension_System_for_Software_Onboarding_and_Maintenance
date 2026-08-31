import { afterEach, describe, it, expect, vi } from 'vitest';
import { fetchRepositoryProject, partitionTreeFiles } from './github';

const blob = (path: string, size = 100) => ({ path, type: 'blob' as const, size });

afterEach(() => {
  vi.restoreAllMocks();
});

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

  it('does not impose a fixed file-count cap', () => {
    const files = Array.from({ length: 120 }, (_, i) => blob(`src/file${i}.ts`));
    const { included, excluded, totalCandidates } = partitionTreeFiles(files);

    expect(included).toHaveLength(120);
    expect(totalCandidates).toBe(120);
    expect(excluded).toHaveLength(0);
  });

  it('rejects traversal paths rather than indexing them', () => {
    const { included, excluded } = partitionTreeFiles([blob('../secrets.ts'), blob('src/app.ts')]);
    expect(included.map((f) => f.path)).toEqual(['src/app.ts']);
    expect(excluded).toEqual([{ path: '../secrets.ts', reason: 'Unsafe path' }]);
  });

  it('counts all eligible candidates after filtering', () => {
    const files = [...Array.from({ length: 55 }, (_, i) => blob(`src/f${i}.ts`)), blob('a.png')];
    const { totalCandidates } = partitionTreeFiles(files);
    expect(totalCandidates).toBe(55);
  });

  it('returns empty results for an empty tree', () => {
    expect(partitionTreeFiles([])).toEqual({ included: [], excluded: [], totalCandidates: 0 });
  });
});

describe('partitionTreeFiles, vendored directories', () => {
  it('excludes node_modules so only project files are analysed', () => {
    const tree = [
      ...Array.from({ length: 60 }, (_, i) => blob(`node_modules/pkg${i}/index.js`)),
      blob('src/index.ts'),
      blob('src/app.ts'),
    ];
    const { included, excluded } = partitionTreeFiles(tree);

    expect(included.map((f) => f.path)).toEqual(['src/index.ts', 'src/app.ts']);
    expect(excluded.filter((e) => e.reason === 'In node_modules')).toHaveLength(60);
  });

  it('does not exclude source files whose names contain an ignored word', () => {
    const { included } = partitionTreeFiles([blob('src/utils/distance.ts'), blob('src/lib/builder.ts')]);
    expect(included).toHaveLength(2);
  });
});

describe('fetchRepositoryProject', () => {
  it('removes unreadable files from the returned corpus while recording their exclusion', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input);
      if (url.endsWith('/repos/example/project')) {
        return new Response(JSON.stringify({
          name: 'project',
          owner: { login: 'example' },
          description: null,
          language: 'TypeScript',
          default_branch: 'main',
        }), { status: 200 });
      }
      if (url.includes('/git/trees/main')) {
        return new Response(JSON.stringify({
          tree: [blob('src/app.ts'), blob('src/unreadable.ts')],
          truncated: false,
        }), { status: 200 });
      }
      if (url.endsWith('/src/app.ts')) {
        return new Response('export const app = true;', { status: 200 });
      }
      if (url.endsWith('/src/unreadable.ts')) {
        return new Response('failed', { status: 500 });
      }
      throw new Error(`Unexpected URL ${url}`);
    });

    const project = await fetchRepositoryProject('https://github.com/example/project');

    expect(project.files.map((file) => file.path)).toEqual(['src/app.ts']);
    expect(project.ingestion?.includedFiles).toBe(2);
    expect(project.ingestion?.filesWithContent).toBe(1);
    expect(project.ingestion?.excluded).toContainEqual({
      path: 'src/unreadable.ts',
      reason: 'Could not be read',
    });
  });
});
