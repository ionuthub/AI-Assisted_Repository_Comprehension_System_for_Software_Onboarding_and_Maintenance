import { describe, it, expect } from 'vitest';
import { generateDependencyGraph } from './graphUtils';
import type { Project } from '@/types/project';

const project = (files: { path: string; content?: string | null }[]): Project => ({
  summary: { name: 'p', description: null, source: 'github', language: 'TypeScript' },
  files: files.map((f) => ({ path: f.path, content: f.content ?? null, language: 'typescript', size: null, rawUrl: null })),
});

describe('generateDependencyGraph', () => {
  it('resolves path-alias imports', () => {
    // The previous substring matcher produced no edge for "@/..." at all, leaving the
    // graph near-empty for any repository that uses path aliases.
    const graph = generateDependencyGraph(project([
      { path: 'src/pages/Index.tsx', content: 'import { thing } from "@/lib/helper";' },
      { path: 'src/lib/helper.ts', content: 'export const thing = 1;' },
    ]));

    expect(graph.edges).toHaveLength(1);
    expect(graph.edges[0]).toMatchObject({ source: 'src/pages/Index.tsx', target: 'src/lib/helper.ts' });
  });

  it('resolves relative imports', () => {
    const graph = generateDependencyGraph(project([
      { path: 'src/a/one.ts', content: 'import x from "./two";' },
      { path: 'src/a/two.ts', content: 'export default 1;' },
    ]));
    expect(graph.edges.map((e) => e.target)).toEqual(['src/a/two.ts']);
  });

  it('does not invent an edge from a substring collision', () => {
    // "./utils" previously matched src/lib/utils.test.ts by substring.
    const graph = generateDependencyGraph(project([
      { path: 'src/lib/consumer.ts', content: 'import { cn } from "./utils";' },
      { path: 'src/lib/utils.ts', content: 'export const cn = 1;' },
      { path: 'src/lib/utils.test.ts', content: 'test stub' },
    ]));
    expect(graph.edges.map((e) => e.target)).toEqual(['src/lib/utils.ts']);
  });

  it('ignores third-party packages', () => {
    const graph = generateDependencyGraph(project([
      { path: 'src/app.ts', content: 'import React from "react";\nimport { z } from "zod";' },
    ]));
    expect(graph.edges).toHaveLength(0);
  });

  it('emits one edge per import pair even when a module is imported twice', () => {
    const graph = generateDependencyGraph(project([
      { path: 'src/a.ts', content: 'import x from "./b";\nimport type { Y } from "./b";' },
      { path: 'src/b.ts', content: 'export default 1;' },
    ]));
    expect(graph.edges).toHaveLength(1);
    expect(new Set(graph.edges.map((e) => e.id)).size).toBe(graph.edges.length);
  });

  it('creates a node for every file, including those without content', () => {
    const graph = generateDependencyGraph(project([
      { path: 'src/a.ts', content: 'export const a = 1;' },
      { path: 'src/b.ts', content: null },
    ]));
    expect(graph.nodes.map((n) => n.id).sort()).toEqual(['src/a.ts', 'src/b.ts']);
  });

  it('does not create a self-edge', () => {
    const graph = generateDependencyGraph(project([
      { path: 'src/a.ts', content: 'import x from "./a";' },
    ]));
    expect(graph.edges).toHaveLength(0);
  });
});
