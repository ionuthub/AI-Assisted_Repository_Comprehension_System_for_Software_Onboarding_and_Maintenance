import { describe, it, expect } from 'vitest';
import {
  MAX_SYSTEM_CONTEXT_CHARS,
  FRAMING_OVERHEAD_CHARS,
  buildSystemPrompt,
  clampSystemContext,
} from './promptBuilder';
import { RETRIEVAL } from '@/constants/appConstants';

describe('retrieval budget against the server context cap', () => {
  it('keeps the evidence budget inside the context accepted by the server', () => {
    const worstCase = RETRIEVAL.EVIDENCE_BUDGET_CHARS + FRAMING_OVERHEAD_CHARS;

    expect(
      worstCase,
      `Retrieval can assemble ${worstCase} characters but the server context cap is ` +
        `${MAX_SYSTEM_CONTEXT_CHARS}. Keep the evidence and server budgets aligned so ` +
        `the model receives the evidence shown in the interface.`
    ).toBeLessThanOrEqual(MAX_SYSTEM_CONTEXT_CHARS);
  });
});

describe('clampSystemContext', () => {
  it('passes through context inside the cap unchanged', () => {
    const context = 'x'.repeat(100);
    expect(clampSystemContext(context)).toBe(context);
  });

  it('truncates context beyond the cap', () => {
    expect(clampSystemContext('x'.repeat(MAX_SYSTEM_CONTEXT_CHARS + 500))).toHaveLength(
      MAX_SYSTEM_CONTEXT_CHARS
    );
  });

  it('yields an empty context for non-string input rather than coercing it', () => {
    expect(clampSystemContext(undefined)).toBe('');
    expect(clampSystemContext(null)).toBe('');
    expect(clampSystemContext({ files: [] })).toBe('');
    expect(clampSystemContext(42)).toBe('');
  });
});

describe('buildSystemPrompt', () => {
  it('always states the grounding and citation rules', () => {
    for (const context of ['', 'some retrieved evidence']) {
      const prompt = buildSystemPrompt(context);
      expect(prompt).toContain('Ground every repository-specific claim');
      expect(prompt).toContain('Never invent file paths, functions, configuration, runtime behaviour or dependencies');
    }
  });

  it('includes repository evidence under a Project Context heading', () => {
    const prompt = buildSystemPrompt('--- File: src/a.ts (lines 1-10 of 10) ---');
    expect(prompt).toContain('Project Context:\n--- File: src/a.ts (lines 1-10 of 10) ---');
  });

  it('omits the Project Context heading when no evidence was supplied', () => {
    expect(buildSystemPrompt('')).not.toContain('\nProject Context:\n');
  });

  it('uses one developer-facing register with no skill-level placeholder', () => {
    const prompt = buildSystemPrompt('');
    expect(prompt).toContain('help a developer build an accurate mental model');
    expect(prompt).not.toMatch(/Level:/);
    expect(prompt).not.toMatch(/beginner|intermediate/i);
  });

  it('requires a private exhaustive audit before the single generated answer', () => {
    const prompt = buildSystemPrompt('');
    expect(prompt).toContain('question-shaped completeness checklist');
    expect(prompt).toContain('enumerate every registered listener');
    expect(prompt).toContain('Recompute numerical comparisons');
    expect(prompt).toContain('shortest answer that remains complete');
  });
});
