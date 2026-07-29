import { describe, it, expect } from 'vitest';
import { MENTIONED_PATH } from './WorkspaceQAView';

const extract = (text: string) => text.match(new RegExp(MENTIONED_PATH.source, 'g')) ?? [];

describe('MENTIONED_PATH', () => {
  it('keeps the x on .tsx and .jsx', () => {
    // Listing `ts` before `tsx` in the alternation truncated every React component path, so the
    // unverified-mentions panel accused correct answers of citing files that were never
    // retrieved — while showing the real file as evidence immediately above the accusation.
    expect(extract('see src/components/PriorityPanel.tsx here')).toEqual([
      'src/components/PriorityPanel.tsx',
    ]);
    expect(extract('src/pages/OrderListPage.jsx')).toEqual(['src/pages/OrderListPage.jsx']);
  });

  it('still matches the shorter extensions', () => {
    expect(extract('src/lib/util.ts and src/lib/old.js')).toEqual([
      'src/lib/util.ts',
      'src/lib/old.js',
    ]);
  });

  it('does not match a longer extension it does not know', () => {
    // `.tsconfig` must not be read as `.ts` plus leftovers.
    expect(extract('src/tsconfig.tsbuildinfo')).toEqual([]);
  });

  it('requires a directory segment, so prose is not mistaken for a path', () => {
    expect(extract('the answer is fine.ts')).toEqual([]);
  });
});
