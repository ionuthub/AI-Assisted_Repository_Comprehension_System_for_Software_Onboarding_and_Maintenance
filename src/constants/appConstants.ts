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
 * The frozen participant build used three files with 2,500-character excerpts. The final
 * artefact has no fixed evidence-file count. It ranks the full indexed repository, expands
 * structural neighbours, then includes as many useful excerpts as fit the evidence budget.
 */
export const RETRIEVAL = {
  EVIDENCE_BUDGET_CHARS: 60_000,
  MAX_EXCERPT_CHARS: 6_000,
  MIN_EXCERPT_CHARS: 800,
  SEARCH_RESULT_LIMIT: 20,
} as const;

/**
 * Conservative request budgeting for repository Q&A.
 *
 * The application budgets by characters because the browser does not own the model tokenizer.
 * Four characters per token is used only as a planning estimate. The server remains the final
 * authority and rejects oversized context rather than silently dropping repository evidence.
 */
export const MODEL_BUDGET = {
  ESTIMATED_CHARS_PER_TOKEN: 4,
  MAX_SYSTEM_CONTEXT_CHARS: 70_000,
  MAX_OUTPUT_TOKENS: 4_096,
  MAX_VERIFICATION_ATTEMPTS: 2,
} as const;
