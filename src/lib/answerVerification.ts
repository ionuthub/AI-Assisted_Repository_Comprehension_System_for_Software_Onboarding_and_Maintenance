import type { RetrievedEvidence } from "@/components/EvidencePanel";

const MENTIONED_PATH = /(?:[\w.-]+\/)*[\w.-]+\.(?:tsx|jsx|json|java|ts|js|css|md|py|go|rb|yml|yaml)\b/g;

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

/**
 * Deterministic release gate for generated repository answers.
 *
 * This does not prove semantic correctness. It blocks obvious grounding failures before a draft
 * reaches the user. A second model pass checks semantics, then this gate checks the revised text.
 */
export function verifyGeneratedAnswer(
  answer: string,
  evidence: RetrievedEvidence[]
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
    reasons.push("The answer describes repository behaviour without retrieved evidence.");
  }

  if (evidence.length > 0 && !insufficient && citedEvidencePaths.length === 0) {
    reasons.push("The answer did not cite any of the retrieved repository files.");
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
    "Review the draft answer against the repository evidence in Project Context before it is released to the user.",
    "Return only the corrected final answer, with no review notes or preamble.",
    "Requirements:",
    "- answer the user's exact question rather than giving a generic repository summary",
    "- support every repository-specific claim with the supplied evidence",
    "- cite the exact repository file paths used",
    "- include important cross-file behaviour when the evidence shows it",
    "- distinguish direct evidence from inference",
    "- remove or correct any unsupported claim from the draft",
    "- if the evidence is insufficient, say that plainly instead of guessing",
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
    "The evidence release gate rejected the reviewed answer. Repair it using only Project Context.",
    "Return only the final answer.",
    `Question: ${question}`,
    "Gate findings:",
    ...reasons.map((reason) => `- ${reason}`),
    "",
    "Rejected answer:",
    reviewedAnswer,
  ].join("\n");
}
