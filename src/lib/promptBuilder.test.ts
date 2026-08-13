import { describe, it, expect } from 'vitest';
import {
  MAX_SYSTEM_CONTEXT_CHARS,
  PER_FILE_OVERHEAD_CHARS,
  FRAMING_OVERHEAD_CHARS,
  buildSystemPrompt,
  clampSystemContext,
} from './promptBuilder';
import { RETRIEVAL } from '@/constants/appConstants';

describe('retrieval parameters against the context cap', () => {
  /**
   * The load-bearing test of this module.
   *
   * The evidence panel states which files and line ranges were sent to the model. The
   * deployed function caps the context at MAX_SYSTEM_CONTEXT_CHARS. If the retrieval
   * parameters are ever tuned past that cap, production silently truncates evidence the
   * panel has already claimed was sent, the panel becomes a false statement, in the one
   * part of the artefact whose whole purpose is letting a reader check the answer.
   *
   * RETRIEVAL is documented as an experimental parameter set, so it will be tuned. This
   * test is what makes tuning it past the cap a build failure rather than a silent
   * change in what the model receives.
   */
  it('cannot assemble more context than the deployed function will accept', () => {
    const worstCase =
      RETRIEVAL.RAG_TOP_K * (RETRIEVAL.RAG_CONTEXT_CHARS + PER_FILE_OVERHEAD_CHARS) +
      FRAMING_OVERHEAD_CHARS;

    expect(
      worstCase,
      `Retrieval can assemble ${worstCase} characters but the deployed function caps ` +
        `context at ${MAX_SYSTEM_CONTEXT_CHARS}. Raise MAX_SYSTEM_CONTEXT_CHARS or lower ` +
        `RAG_TOP_K / RAG_CONTEXT_CHARS, do not leave them apart, or production will drop ` +
        `evidence the evidence panel reports as sent.`
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
    // A coerced "undefined" or "[object Object]" would be interpolated as if it were
    // repository evidence, producing a grounded-looking prompt with no grounding in it.
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
      expect(prompt).toContain('Ground every claim in the provided repository context');
      expect(prompt).toContain('never invent file paths, functions or behaviour');
    }
  });

  it('includes retrieved context under a Project Context heading', () => {
    const prompt = buildSystemPrompt('--- File: src/a.ts (lines 1-10 of 10) ---');
    expect(prompt).toContain('Project Context:\n--- File: src/a.ts (lines 1-10 of 10) ---');
  });

  it('omits the Project Context heading entirely when nothing was retrieved', () => {
    // An empty heading would imply evidence exists and is blank, rather than that
    // retrieval returned nothing.
    expect(buildSystemPrompt('')).not.toContain('Project Context');
  });

  it('states a single register, with no skill-level placeholder left behind', () => {
    const prompt = buildSystemPrompt('');
    expect(prompt).toContain('Respond as an experienced engineer to an experienced engineer');
    expect(prompt).not.toMatch(/Level:/);
    expect(prompt).not.toMatch(/beginner|intermediate/i);
  });
});
