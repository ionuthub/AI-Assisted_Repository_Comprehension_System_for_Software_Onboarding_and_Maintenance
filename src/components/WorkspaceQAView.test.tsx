import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import WorkspaceQAView, { MENTIONED_PATH } from './WorkspaceQAView';

const extract = (text: string) => text.match(new RegExp(MENTIONED_PATH.source, 'g')) ?? [];

describe('MENTIONED_PATH', () => {
  it('keeps the x on .tsx and .jsx', () => {
    // Listing `ts` before `tsx` in the alternation truncated every React component path, so the
    // unverified-mentions panel accused correct answers of citing files that were never
    // retrieved, while showing the real file as evidence immediately above the accusation.
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
  onAsk: vi.fn(),
};

describe('WorkspaceQAView before any question is asked', () => {
  it('makes Answers the repository-wide question entry point', () => {
    render(<WorkspaceQAView {...idleProps} />);

    expect(screen.getByRole('heading', { name: 'Ask about this repository' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('What would you like to understand about this codebase?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ask' })).toBeInTheDocument();
    expect(screen.getByText('50 of 54 repository files indexed')).toBeInTheDocument();
    expect(screen.queryByText('Your question')).not.toBeInTheDocument();
  });

  it('submits a repository question through the existing onAsk entry point', () => {
    const onAsk = vi.fn();
    render(<WorkspaceQAView {...idleProps} onAsk={onAsk} />);

    fireEvent.change(
      screen.getByPlaceholderText('What would you like to understand about this codebase?'),
      { target: { value: 'Where does execution start?' } }
    );
    fireEvent.click(screen.getByRole('button', { name: 'Ask' }));

    expect(onAsk).toHaveBeenCalledTimes(1);
    expect(onAsk).toHaveBeenCalledWith('Where does execution start?');
  });

  it('does not render the no-evidence warning for a retrieval that never ran', () => {
    render(<WorkspaceQAView {...idleProps} />);
    expect(screen.queryByText(/No evidence/)).not.toBeInTheDocument();
    expect(screen.queryByText(/0 files retrieved/)).not.toBeInTheDocument();
  });

  it('still renders the answer layout once a question exists', () => {
    render(
      <WorkspaceQAView
        {...idleProps}
        question="Where does execution start?"
        generationStatus="complete"
        answer="In src/main.tsx."
      />
    );
    expect(screen.getByText('Your question')).toBeInTheDocument();
    expect(screen.getByText('Where does execution start?')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ask another question about this repository')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Ask about this repository' })).not.toBeInTheDocument();
  });
});
