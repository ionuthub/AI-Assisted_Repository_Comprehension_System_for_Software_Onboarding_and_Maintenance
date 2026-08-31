const MENTIONED_PATH = /(?:[\w.-]+\/)*[\w.-]+\.(?:tsx|jsx|json|java|ts|js|css|md|py|go|rb|yml|yaml)\b/g;
const EVIDENCE_HEADING = /^--- File: (.+?) \(lines \d+-\d+ of \d+\) ---$/gm;

export interface EvidencePathLike {
  path: string;
}

export interface AnswerVerificationResult {
  passed: boolean;
  reasons: string[];
  citedEvidencePaths: string[];
  unverifiedPaths: string[];
}

const saysEvidenceIsInsufficient = (answer: string): boolean =>
  /(?:not enough|insufficient|cannot determine|can't determine|could not determine|no matching evidence|not supported by the (?:provided )?evidence)/i.test(
    answer
  );

export function extractEvidencePathsFromContext(systemContext: string): string[] {
  return Array.from(systemContext.matchAll(EVIDENCE_HEADING), (match) => match[1]);
}

/**
 * Deterministic release gate for generated repository answers.
 *
 * This does not prove semantic correctness. It blocks obvious grounding failures before a draft
 * reaches the user. A second model pass checks semantics, then this gate checks the revised text.
 */
export function verifyGeneratedAnswer(
  answer: string,
  evidence: EvidencePathLike[]
): AnswerVerificationResult {
  const reasons: string[] = [];
  const trimmed = answer.trim();
  const evidencePaths = new Set(evidence.map((item) => item.path));
  const mentionedPaths = Array.from(new Set(trimmed.match(MENTIONED_PATH) ?? []));
  const citedEvidencePaths = mentionedPaths.filter((path) => evidencePaths.has(path));
  const unverifiedPaths = mentionedPaths.filter((path) => !evidencePaths.has(path));
  const insufficient = saysEvidenceIsInsufficient(trimmed);

  if (!trimmed) reasons.push("The generated answer was empty.");

  if (evidence.length === 0 && !insufficient) {
    reasons.push("The answer describes repository behaviour without repository evidence.");
  }

  if (evidence.length > 0 && !insufficient && citedEvidencePaths.length === 0) {
    reasons.push("The answer did not cite any repository file supplied as evidence.");
  }

  if (unverifiedPaths.length > 0) {
    reasons.push(`The answer named paths that were not supplied as evidence: ${unverifiedPaths.join(", ")}.`);
  }

  return {
    passed: reasons.length === 0,
    reasons,
    citedEvidencePaths,
    unverifiedPaths,
  };
}

export function buildAnswerReviewPrompt(question: string, draft: string): string {
  return [
    "Independently re-solve the repository question from Project Context, then use that result to review the draft before it is released.",
    "Do not assume the draft is correct. Return only the corrected final answer, with no review notes or preamble.",
    "Requirements:",
    "- answer the user's exact question first",
    "- inspect the full relevant execution or data path, including definitions, callers, configuration and consumers when they affect the answer",
    "- check whether apparent configuration fields or helper functions are actually used before describing them as live behaviour",
    "- support every repository-specific claim with Project Context and cite the exact repository file paths used",
    "- distinguish direct evidence from inference",
    "- remove misleading simplifications, unsupported claims and invented paths",
    "- if Project Context is insufficient, say that plainly instead of guessing",
    "",
    `Question: ${question}`,
    "",
    "Draft answer:",
    draft,
  ].join("\n");
}

export function buildAnswerRepairPrompt(
  question: string,
  reviewedAnswer: string,
  reasons: string[]
): string {
  return [
    "The evidence release gate rejected the reviewed answer. Re-solve the question from Project Context and repair the answer.",
    "Return only the final answer.",
    `Question: ${question}`,
    "Gate findings:",
    ...reasons.map((reason) => `- ${reason}`),
    "",
    "Rejected answer:",
    reviewedAnswer,
  ].join("\n");
}
