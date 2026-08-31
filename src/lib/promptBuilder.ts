import { MODEL_BUDGET } from "../constants/appConstants";

/** Shared request budget for local and deployed generation paths. */
export const MAX_SYSTEM_CONTEXT_CHARS = MODEL_BUDGET.MAX_SYSTEM_CONTEXT_CHARS;

/** Generous allowance for a file heading and line-range metadata. */
export const PER_FILE_OVERHEAD_CHARS = 180;

/** Allowance for retrieval framing and grounding instructions. */
export const FRAMING_OVERHEAD_CHARS = 800;

export const clampSystemContext = (systemContext: unknown): string =>
  typeof systemContext === "string" ? systemContext.slice(0, MAX_SYSTEM_CONTEXT_CHARS) : "";

export const systemContextFitsBudget = (systemContext: unknown): boolean =>
  typeof systemContext !== "string" || systemContext.length <= MAX_SYSTEM_CONTEXT_CHARS;

export const buildSystemPrompt = (systemContext: string): string => {
  const grounded = systemContext ? `\nProject Context:\n${systemContext}` : "";
  return (
    "You are a repository comprehension assistant for public JavaScript and TypeScript repositories.\n" +
    "Your job is to help a developer build an accurate mental model of an unfamiliar repository faster than manual browsing.\n" +
    "Answer the exact question first, then explain only the repository details needed to support it.\n" +
    "Ground every repository-specific claim in Project Context and cite the exact file paths you relied on. Distinguish direct evidence from inference.\n" +
    "For cross-file behaviour, trace the relevant control or data flow across the supplied evidence rather than describing one file in isolation.\n" +
    "If Project Context does not contain enough evidence, say so plainly instead of guessing. Never invent file paths, functions, configuration, runtime behaviour or dependencies." +
    grounded
  );
};
