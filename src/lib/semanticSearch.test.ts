import { describe, it, expect } from 'vitest';
import { buildSearchIndex, searchRepository, tokenize, selectExcerptRegion } from './semanticSearch';
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

  it('keeps code-structure terms while still removing low-signal keywords', () => {
    expect(tokenize('default export interface class function static')).toEqual([
      'default', 'export', 'interface', 'class', 'function', 'static',
    ]);
    expect(tokenize('const return')).toHaveLength(0);
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
    const results = searchRepository('function', index, CORPUS, 2);
    expect(results).toHaveLength(2);
  });

  it('does not index files whose content failed to load', () => {
    const withNull = [...CORPUS, file('src/lib/missing.ts', null)];
    const index = buildSearchIndex(withNull);
    const results = searchRepository('missing', index, withNull, 5);
    expect(index.docVectors['src/lib/missing.ts']).toBeUndefined();
    expect(results.map((r) => r.path)).not.toContain('src/lib/missing.ts');
  });
});

describe('selectExcerptRegion', () => {
  const long = (marker: string, atLine: number, total = 200) =>
    Array.from({ length: total }, (_, i) => (i + 1 === atLine ? marker : `const filler${i} = ${i};`)).join('\n');

  it('returns the whole file when it fits the budget', () => {
    const r = selectExcerptRegion('const a = 1;\nconst b = 2;', 'a', 10_000);
    expect(r.startLine).toBe(1);
    expect(r.endLine).toBe(2);
    expect(r.omittedLines).toBe(0);
    expect(r.omittedCharacters).toBe(0);
    expect(r.text).toContain('const b = 2;');
  });

  it('selects the region containing the query term rather than the head', () => {
    // The previous behaviour always sent the first N characters, so for a long file the
    // excerpt shown as a citation was rarely the code the answer was about.
    const content = long('function handleAuthentication() {}', 150);
    const r = selectExcerptRegion(content, 'authentication', 800);
    expect(r.startLine).toBeGreaterThan(100);
    expect(r.text).toContain('handleAuthentication');
    expect(r.endLine).toBeGreaterThanOrEqual(r.startLine);
  });

  it('reports the lines omitted so truncation can be stated honestly', () => {
    const content = long('function handleAuthentication() {}', 150);
    const r = selectExcerptRegion(content, 'authentication', 800);
    expect(r.totalLines).toBe(200);
    expect(r.omittedLines).toBe(200 - (r.endLine - r.startLine + 1));
  });

  it('never exceeds the character budget', () => {
    const content = long('function handleAuthentication() {}', 150);
    const r = selectExcerptRegion(content, 'authentication', 400);
    expect(r.text.length).toBeLessThanOrEqual(400);
  });

  it('scores only the emitted prefix of a line longer than the budget', () => {
    const hiddenMatch = `${'x'.repeat(500)} authentication`;
    const visibleMatch = `function authentication() { return true; }`;
    const content = `${hiddenMatch}\n${visibleMatch}`;
    const r = selectExcerptRegion(content, 'authentication', 100);

    expect(r.startLine).toBe(2);
    expect(r.text).toContain('authentication');
    expect(r.text.length).toBeLessThanOrEqual(100);
    expect(r.omittedCharacters).toBe(content.length - r.text.length);
  });

  it('reports character omission when only part of one line is emitted', () => {
    const content = `${'a'.repeat(500)} hiddenMatch`;
    const r = selectExcerptRegion(content, 'hiddenMatch', 100);

    expect(r.startLine).toBe(1);
    expect(r.endLine).toBe(1);
    expect(r.omittedLines).toBe(0);
    expect(r.omittedCharacters).toBe(content.length - 100);
    expect(r.text).not.toContain('hiddenMatch');
  });

  it('falls back to the head when no query term appears in the file', () => {
    const content = long('const nothing = 0;', 150);
    const r = selectExcerptRegion(content, 'zzzznomatch', 400);
    expect(r.startLine).toBe(1);
  });

  it('falls back to the head when the query is only stopwords', () => {
    const content = long('const nothing = 0;', 150);
    const r = selectExcerptRegion(content, 'const return', 400);
    expect(r.startLine).toBe(1);
  });

  it('is deterministic for the same file and query', () => {
    const content = long('function handleAuthentication() {}', 150);
    const a = selectExcerptRegion(content, 'authentication', 600);
    const b = selectExcerptRegion(content, 'authentication', 600);
    expect(a).toEqual(b);
  });

  it('prefers a region covering more distinct query terms', () => {
    const lines = Array.from({ length: 120 }, (_, i) => `const filler${i} = ${i};`);
    lines[20] = 'const router = 1; const router2 = 2; const router3 = 3;';
    lines[80] = 'const router = makeRouter();';
    lines[81] = 'const middleware = useMiddleware();';
    const r = selectExcerptRegion(lines.join('\n'), 'router middleware', 500);
    // Assert on content rather than a line number: the region covering both terms wins over
    // the earlier one that repeats a single term.
    expect(r.text).toContain('makeRouter');
    expect(r.text).toContain('useMiddleware');
  });

  it('handles an empty file', () => {
    const r = selectExcerptRegion('', 'anything', 100);
    expect(r.text).toBe('');
    expect(r.totalLines).toBe(1);
  });
});
