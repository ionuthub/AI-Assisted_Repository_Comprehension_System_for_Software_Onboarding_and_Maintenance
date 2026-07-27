import { describe, it, expect } from 'vitest';
import { buildSearchIndex, searchRepository, tokenize } from './semanticSearch';
import type { ProjectFile } from '@/types/project';

const file = (path: string, content: string | null): ProjectFile => ({
  path, content, language: 'typescript', size: content?.length ?? null, rawUrl: null,
});

const CORPUS: ProjectFile[] = [
  file('src/lib/paymentProcessor.ts', 'export function processPayment(amount) { return chargeCard(amount); }'),
  file('src/lib/userProfile.ts', 'export function loadUserProfile(id) { return fetchProfile(id); }'),
  file('src/api/routeHandler.ts', 'export function handleApiRoute(req) { return router.dispatch(req); }'),
];

describe('tokenize', () => {
  it('splits camelCase into constituent terms', () => {
    expect(tokenize('processPayment')).toContain('process');
    expect(tokenize('processPayment')).toContain('payment');
  });

  it('retains api, route and router as searchable terms', () => {
    // These were previously stopwords, so "api router" tokenised to nothing and the
    // question reached the model with no repository evidence attached.
    expect(tokenize('api router').length).toBeGreaterThan(0);
    expect(tokenize('route')).toContain('route');
  });

  it('still removes language keywords', () => {
    expect(tokenize('const function return')).toHaveLength(0);
  });
});

describe('buildSearchIndex', () => {
  it('indexes file content, not only the path', () => {
    const index = buildSearchIndex(CORPUS);
    // "charge" occurs only inside the file body (chargeCard), never in its path — so its
    // presence proves the index covers content. Ingestion previously left content null
    // for every GitHub file, which reduced the index to path tokens alone.
    const tokens = Object.keys(index.docVectors['src/lib/paymentProcessor.ts']);
    expect(tokens).toContain('charge');
    expect(tokens).toContain('amount');
  });

  it('produces a usable index for a single-document corpus', () => {
    // Unsmoothed IDF gave log(1/1) = 0 for every term here, zeroing the whole index so
    // that every query returned nothing at all, silently.
    const index = buildSearchIndex([CORPUS[0]]);
    const results = searchRepository('payment', index, [CORPUS[0]], 5);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].score).toBeGreaterThan(0);
  });

  it('assigns non-zero weight to a term present in every document', () => {
    const shared = [file('a.ts', 'export const widget = 1;'), file('b.ts', 'export const widget = 2;')];
    const index = buildSearchIndex(shared);
    expect(index.idf['widget']).toBeGreaterThan(0);
  });
});

describe('searchRepository', () => {
  it('ranks the file whose body matches the query first', () => {
    const index = buildSearchIndex(CORPUS);
    const results = searchRepository('payment', index, CORPUS, 3);
    expect(results[0].path).toBe('src/lib/paymentProcessor.ts');
  });

  it('finds files by a domain term that used to be a stopword', () => {
    const index = buildSearchIndex(CORPUS);
    const results = searchRepository('api route', index, CORPUS, 3);
    expect(results.map((r) => r.path)).toContain('src/api/routeHandler.ts');
  });

  it('returns an empty result set rather than throwing for an unmatched query', () => {
    const index = buildSearchIndex(CORPUS);
    expect(searchRepository('zzzznomatch', index, CORPUS, 3)).toEqual([]);
  });

  it('returns nothing for a query made entirely of keywords', () => {
    const index = buildSearchIndex(CORPUS);
    expect(searchRepository('const return', index, CORPUS, 3)).toEqual([]);
  });

  it('respects the requested result limit', () => {
    const index = buildSearchIndex(CORPUS);
    expect(searchRepository('export', index, CORPUS, 2).length).toBeLessThanOrEqual(2);
  });

  it('does not index files whose content failed to load', () => {
    const withNull = [...CORPUS, file('src/lib/missing.ts', null)];
    const index = buildSearchIndex(withNull);
    const results = searchRepository('payment', index, withNull, 5);
    expect(results.map((r) => r.path)).not.toContain('src/lib/missing.ts');
  });
});
