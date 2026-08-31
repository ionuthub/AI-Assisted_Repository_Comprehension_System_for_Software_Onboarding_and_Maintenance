/**
 * Application constants used by the current artefact.
 */

// Public GitHub ingestion is the only reachable input path.
export const TAB_MODES = {
  GITHUB: "github"
} as const;

export type TabMode = typeof TAB_MODES[keyof typeof TAB_MODES];

/**
 * Retrieval settings for the current post-study artefact.
 *
 * The frozen participant build used three files with 2,500-character excerpts. The current
 * artefact ranks the full indexed repository and spends a context budget on relevant evidence.
 * The RAG_* aliases remain temporarily so existing callers compile while the retrieval function
 * ignores the old file-count caps.
 */
export const RETRIEVAL = {
  EVIDENCE_BUDGET_CHARS: 60_000,
  MAX_EXCERPT_CHARS: 6_000,
  MIN_EXCERPT_CHARS: 800,
  SEARCH_RESULT_LIMIT: 20,

  // Compatibility aliases. File-count values are not enforced by the current retrieval path.
  RAG_TOP_K: Number.MAX_SAFE_INTEGER,
  RAG_CANDIDATE_FILES: Number.MAX_SAFE_INTEGER,
  RAG_STRUCTURAL_SEEDS: Number.MAX_SAFE_INTEGER,
  RAG_CONTEXT_CHARS: 6_000,
} as const;

/**
 * Conservative request budgeting for repository Q&A.
 *
 * The browser budgets by characters because it does not own the model tokenizer. Returned model
 * usage metadata is recorded so real token use can be measured. The server rejects oversized
 * context instead of silently trimming repository evidence.
 */
export const MODEL_BUDGET = {
  ESTIMATED_CHARS_PER_TOKEN: 4,
  MAX_SYSTEM_CONTEXT_CHARS: 70_000,
  MAX_OUTPUT_TOKENS: 4_096,
  MAX_VERIFICATION_ATTEMPTS: 2,
} as const;
