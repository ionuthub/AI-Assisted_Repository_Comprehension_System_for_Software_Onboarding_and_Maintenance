import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import EvidencePanel, { type RetrievedEvidence } from './EvidencePanel';

const evidence = (path: string, score: number): RetrievedEvidence => ({
  path,
  score,
  excerpt: 'export const x = 1;',
  startLine: 1,
  endLine: 1,
  totalLines: 1,
  omittedLines: 0,
  omittedCharacters: 0,
});

describe('EvidencePanel headings', () => {
  it('reports what was retrieved rather than judging the answer', () => {
    // The heading appeared above answers that were refusals — retrieval had returned files,
    // but the model found nothing usable in them. Wording that reads as a verdict on the
    // answer ("Grounded") is therefore wrong at the moment it matters most, because a reader
    // who trusts the badge stops checking exactly when checking is required.
    render(
      <EvidencePanel
        evidence={[evidence('src/a.ts', 0.3), evidence('src/b.ts', 0.1)]}
        unverifiedMentions={[]}
        isLoading={false}
      />
    );
    expect(screen.getByText(/Evidence · 2 files retrieved/)).toBeInTheDocument();
    expect(screen.queryByText(/Grounded/)).not.toBeInTheDocument();
  });

  it('distinguishes the no-evidence state by wording, not colour alone', () => {
    render(<EvidencePanel evidence={[]} unverifiedMentions={[]} isLoading={false} />);
    expect(screen.getByText(/No evidence · 0 files retrieved/)).toBeInTheDocument();
    expect(screen.getByText(/No matching evidence was found in the files searched/)).toBeInTheDocument();
  });

  it('states repository coverage without calling the searched subset the indexed total', () => {
    render(
      <EvidencePanel
        evidence={[evidence('src/a.ts', 0.2)]}
        unverifiedMentions={[]}
        isLoading={false}
        indexedFileCount={50}
        totalFileCount={55}
      />
    );
    expect(screen.getByText(/after searching 50 of 55 repository files/)).toBeInTheDocument();
    expect(screen.queryByText(/50 of 55 indexed files/)).not.toBeInTheDocument();
  });

  it('discloses character truncation within a cited line', () => {
    render(
      <EvidencePanel
        evidence={[{ ...evidence('src/long.ts', 0.2), omittedCharacters: 2400 }]}
        unverifiedMentions={[]}
        isLoading={false}
      />
    );
    expect(screen.getByText(/2400 characters not sent/)).toBeInTheDocument();
  });

  it('singularises the count for one file', () => {
    render(
      <EvidencePanel evidence={[evidence('src/a.ts', 0.2)]} unverifiedMentions={[]} isLoading={false} />
    );
    expect(screen.getByText(/Evidence · 1 file retrieved/)).toBeInTheDocument();
  });
});

describe('relevance bar scale', () => {
  const widthOf = (score: number): number => {
    const { container } = render(
      <EvidencePanel evidence={[evidence('src/a.ts', score)]} unverifiedMentions={[]} isLoading={false} />
    );
    const bar = container.querySelector('[role="img"] > span') as HTMLElement;
    return parseFloat(bar.style.width);
  };

  it('draws a typical good match as a substantial bar', () => {
    // Cosine similarity over sparse TF-IDF vectors is small in absolute terms: across the 24
    // accuracy-gate stems the median top-ranked score was 0.27. Drawn at score * 100% that
    // read as 27% — a nearly empty bar above a correct result, which invites a reader to
    // discount an answer they should accept.
    expect(widthOf(0.27)).toBeGreaterThan(40);
  });

  it('still draws a failed retrieval as a nearly empty bar', () => {
    // The orientation stem scored 0.04 in both study repositories and retrieved the wrong
    // files. Rescaling must not flatter that case, or the bar stops carrying information.
    expect(widthOf(0.04)).toBeLessThan(12);
  });

  it('is monotonic and bounded', () => {
    expect(widthOf(0.1)).toBeLessThan(widthOf(0.3));
    expect(widthOf(0.3)).toBeLessThan(widthOf(0.5));
    expect(widthOf(0.95)).toBeLessThanOrEqual(100);
    expect(widthOf(0)).toBeGreaterThan(0);
  });

  it('exposes the raw score to assistive technology, not the scaled width', () => {
    render(
      <EvidencePanel evidence={[evidence('src/a.ts', 0.27)]} unverifiedMentions={[]} isLoading={false} />
    );
    expect(screen.getByRole('img', { name: 'Keyword match score 0.27' })).toBeInTheDocument();
  });
});
