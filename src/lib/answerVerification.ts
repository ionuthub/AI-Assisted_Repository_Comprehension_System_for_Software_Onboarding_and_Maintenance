import type { RetrievedEvidence } from "@/components/EvidencePanel";

const MENTIONED_PATH = /(?:[\w-]+\/)+[\w.-]+\.(?:tsx|jsx|json|java|ts|js|css|md|py|go|rb)\b/g;

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
 * This does not prove semantic correctness. It prevents a draft from being shown when the
 * generation is empty, claims repository knowledge without retrieved evidence, fails to cite
 * any retrieved file, or names repository paths that were not part of the evidence supplied to
 * the model. The UI should describe a passing result as evidence-checked, not "correct".
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
