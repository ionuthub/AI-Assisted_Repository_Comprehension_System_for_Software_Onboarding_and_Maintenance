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
 * artefact uses a larger candidate pool and adds structural neighbours before choosing the
 * evidence shown to the model. Historical study results must continue to report the frozen
 * settings rather than these values.
 */
export const RETRIEVAL = {
  RAG_TOP_K: 8,
  RAG_CANDIDATE_FILES: 24,
  RAG_STRUCTURAL_SEEDS: 6,
  RAG_CONTEXT_CHARS: 2200,
  SEARCH_RESULT_LIMIT: 10,
} as const;
