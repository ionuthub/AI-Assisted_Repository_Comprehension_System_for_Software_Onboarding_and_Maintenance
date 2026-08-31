/**
 * Shared system-prompt builder used by local and deployed generation paths.
 */

/**
 * Hard cap on retrieved repository context. The final artefact uses a wider evidence set
 * than the frozen study build, so the cap is raised with the retrieval budget rather than
 * silently trimming evidence already shown in the interface.
 */
export const MAX_SYSTEM_CONTEXT_CHARS = 22000;

/** Generous allowance for a file heading and line-range metadata. */
export const PER_FILE_OVERHEAD_CHARS = 160;

/** Allowance for the retrieval framing text. */
export const FRAMING_OVERHEAD_CHARS = 400;

export const clampSystemContext = (systemContext: unknown): string =>
  typeof systemContext === "string" ? systemContext.slice(0, MAX_SYSTEM_CONTEXT_CHARS) : "";

export const buildSystemPrompt = (systemContext: string): string => {
  const grounded = systemContext ? `\nProject Context:\n${systemContext}` : "";
  return (
    "You are a repository comprehension assistant. You help developers understand an unfamiliar codebase.\n" +
    "Respond as an experienced engineer to an experienced engineer: precise and technical, covering structure, control flow, trade-offs and likely maintenance impact when the evidence supports it.\n" +
    "Ground every claim in the provided repository context and cite the file paths you relied on. Distinguish direct evidence from inference. If the context does not contain enough evidence, say so plainly rather than guessing, and never invent file paths, functions or behaviour." +
    grounded
  );
};
