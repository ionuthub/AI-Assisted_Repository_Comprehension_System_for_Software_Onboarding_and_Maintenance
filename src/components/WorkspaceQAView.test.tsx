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

// The Answers tab is reachable before any question exists. These tests pin the
// empty state discovered in the 1 August smoke test: the view rendered its full
// answer layout for a question that was never asked, and the evidence panel
// reported "No evidence · 0 files retrieved" for a retrieval that never ran —
// a manufactured failure state in an instrument whose subject is trust.
import { render, screen } from '@testing-library/react';
import WorkspaceQAView from './WorkspaceQAView';

const idleProps = {
  question: '',
  answer: '',
  isLoading: false,
  generationStatus: 'idle' as const,
  completion: null,
  evidence: [],
  indexedFileCount: 50,
  totalFileCount: 54,
  onBackToOverview: () => {},
};

describe('WorkspaceQAView before any question is asked', () => {
  it('shows the empty state instead of the answer layout', () => {
    render(<WorkspaceQAView {...idleProps} />);
    expect(screen.getByText('No question asked yet.')).toBeInTheDocument();
    expect(screen.queryByText('Your question')).not.toBeInTheDocument();
  });

  it('does not render the no-evidence warning for a retrieval that never ran', () => {
    render(<WorkspaceQAView {...idleProps} />);
    expect(screen.queryByText(/No evidence/)).not.toBeInTheDocument();
    expect(screen.queryByText(/0 files retrieved/)).not.toBeInTheDocument();
  });

  it('still renders the answer layout once a question exists', () => {
    render(<WorkspaceQAView {...idleProps} question="Where does execution start?" generationStatus="complete" answer="In src/main.tsx." />);
    expect(screen.getByText('Your question')).toBeInTheDocument();
    expect(screen.getByText('Where does execution start?')).toBeInTheDocument();
    expect(screen.queryByText('No question asked yet.')).not.toBeInTheDocument();
  });
});
