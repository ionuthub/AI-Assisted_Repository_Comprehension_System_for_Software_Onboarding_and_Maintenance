/**
 * Application constants used by the current artefact.
 */

// Public GitHub ingestion is the only reachable input path.
export const TAB_MODES = {
  GITHUB: "github"
} as const;

export type TabMode = typeof TAB_MODES[keyof typeof TAB_MODES];

/**
 * Retrieval settings for the current artefact.
 *
 * Small and medium repositories should be supplied in full whenever they fit the model budget.
 * When they do not fit, the same ranking pipeline naturally spends the available evidence budget
 * on the strongest lexical, symbol and structural evidence instead of applying a file-count cap.
 */
export const RETRIEVAL = {
  EVIDENCE_BUDGET_CHARS: 1_500_000,
  MAX_EXCERPT_CHARS: 150_000,
  MIN_EXCERPT_CHARS: 800,
  SEARCH_RESULT_LIMIT: 20,

  // Compatibility aliases for older callers. File-count limits are not enforced.
  RAG_TOP_K: Number.MAX_SAFE_INTEGER,
  RAG_CANDIDATE_FILES: Number.MAX_SAFE_INTEGER,
  RAG_STRUCTURAL_SEEDS: Number.MAX_SAFE_INTEGER,
  RAG_CONTEXT_CHARS: 150_000,
} as const;

/**
 * Model and request budgeting for repository Q&A.
 *
 * Gemini 3.5 Flash supports a large context window. The server performs a real countTokens check
 * before generation; these character limits protect the HTTP endpoint and browser from abusive
 * payloads rather than defining repository comprehension quality.
 */
export const MODEL_BUDGET = {
  MAX_SYSTEM_CONTEXT_CHARS: 1_700_000,
  MAX_REQUEST_BODY_CHARS: 2_500_000,
  MAX_INPUT_TOKENS: 850_000,
  // Gemini's candidate budget also covers internal reasoning. The deployed regression gate
  // exhausted 4,096 tokens while reviewing a cross-file answer before any final answer could
  // be released, so leave enough headroom for both reasoning and the concise visible response.
  MAX_OUTPUT_TOKENS: 8_192,
  MAX_VERIFICATION_ATTEMPTS: 2,
} as const;
