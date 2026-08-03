/**
 * Application Constants
 * Centralized configuration for tab values and retrieval parameters
 */

// Tab Mode Constants
// Public GitHub ingestion is the only input path, so this is the only reachable mode.
// GENERATE and UPLOAD were removed with the generator and the local-upload paths.
export const TAB_MODES = {
  GITHUB: "github"
} as const;

export type TabMode = typeof TAB_MODES[keyof typeof TAB_MODES];

/**
 * Retrieval parameters for the grounded question-answering pipeline.
 *
 * These are the experimental parameters of the RAG configuration and must be reported
 * alongside any result produced with them: changing any value changes what evidence the
 * model receives and therefore what it answers. They are fixed here, in one place, so the
 * configuration used for the accuracy gate and for every participant session is the same
 * and can be quoted directly in the methodology.
 *
 * RAG_TOP_K            number of files retrieved as evidence for a question
 * RAG_CONTEXT_CHARS    size of the excerpt taken from each retrieved file. The region
 *                      is selected by query-term coverage, not taken from the head.
 * SEARCH_RESULT_LIMIT  results shown in the user-facing repository search
 *
 * RAG_TOP_K x RAG_CONTEXT_CHARS bounds the evidence at 7,500 characters, within the
 * 12,000-character ceiling the API applies to the system context. That relationship is
 * asserted by src/lib/promptBuilder.test.ts: tuning these past the ceiling fails the
 * build rather than silently truncating evidence the evidence panel reports as sent.
 */
export const RETRIEVAL = {
  RAG_TOP_K: 3,
  RAG_CONTEXT_CHARS: 2500,
  SEARCH_RESULT_LIMIT: 10,
} as const;




