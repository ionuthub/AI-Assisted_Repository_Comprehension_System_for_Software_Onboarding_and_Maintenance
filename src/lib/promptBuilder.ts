/**
 * The single source of the system prompt sent to the generation model.
 *
 * Both entry points import from here: the Vite dev-server proxy in vite.config.ts and the
 * deployed function in api/explain-code.ts. They previously built the prompt independently
 * and had already drifted, the deployed side capped the retrieved context and validated
 * the request, the dev side did neither, and the two template literals sat at different
 * indentation depths, so the bytes sent to the model differed between environments.
 *
 * That is a confound rather than untidiness: a pilot session run against the dev server was
 * not exercising the instrument a participant meets in production. Any divergence must now
 * be a change to this file, which both callers pick up.
 *
 * This module has no imports, deliberately. api/explain-code.ts is bundled as a deployed
 * function without the "@/" path alias, so anything it shares with the client must resolve
 * on its own, the same constraint generationProtocol.ts is written to.
 */

/**
 * Hard cap on the retrieved repository context, in characters.
 *
 * The evidence panel tells the reader which files and line ranges were sent to the model.
 * Context trimmed after that panel is populated would make the panel a false statement, so
 * the margin between this cap and the retrieval parameters is asserted by a test rather
 * than left to inspection. See promptBuilder.test.ts.
 */
export const MAX_SYSTEM_CONTEXT_CHARS = 12000;

/**
 * Per-excerpt overhead: "\n\n--- File: {path} (lines A-B of C) ---\n" at a generous path
 * length. Used by the test that couples the retrieval parameters to the cap.
 */
export const PER_FILE_OVERHEAD_CHARS = 160;

/** Framing overhead: the tutor preamble and the grounded-context marker. */
export const FRAMING_OVERHEAD_CHARS = 400;

/**
 * Applies the cap. Non-string input yields an empty context rather than a coerced one, so a
 * malformed request produces an ungrounded answer that says so, not a grounded-looking one.
 */
export const clampSystemContext = (systemContext: unknown): string =>
  typeof systemContext === "string" ? systemContext.slice(0, MAX_SYSTEM_CONTEXT_CHARS) : "";

/**
 * The register is fixed. An earlier revision varied depth by a `skillLevel` field, but
 * nothing in the interface ever set it: the value was pinned at "advanced" from the store's
 * initial state onwards, so the other two registers were unreachable. The prompt now states
 * the one register the tool has always actually served.
 *
 * The grounding and citation rules are not negotiable by caller: the artefact's claim is
 * file-cited, retrieval-grounded answers, and the study measures whether participants detect
 * inaccurate ones. Hedging when evidence is absent is part of the instrument.
 */
export const buildSystemPrompt = (systemContext: string): string => {
  const grounded = systemContext ? `\nProject Context:\n${systemContext}` : "";
  return (
    "You are a repository comprehension assistant. You help developers onboard to and maintain an unfamiliar codebase.\n" +
    "Respond as an experienced engineer to an experienced engineer: precise and technical, covering structure, control flow, trade-offs and maintenance impact. Do not use analogies or introductory framing.\n" +
    "Ground every claim in the provided repository context and cite the file paths you relied on. If the context does not contain the answer, say so plainly rather than guessing, and never invent file paths, functions or behaviour." +
    grounded
  );
};
