import type { RetrievedEvidence } from "@/components/EvidencePanel";
import { MODEL_BUDGET } from "@/constants/appConstants";
import {
  buildAnswerRepairPrompt,
  buildAnswerReviewPrompt,
  verifyGeneratedAnswer,
  type AnswerVerificationResult,
} from "@/lib/answerVerification";
import type { GenerationCompleteEvent } from "@/lib/generationProtocol";

interface GenerationResponse {
  explanation?: string;
  finishReason?: string;
  usageMetadata?: GenerationCompleteEvent["usageMetadata"];
  error?: string;
}

export interface VerifiedRepositoryAnswer {
  answer: string;
  completion: GenerationCompleteEvent;
  verification: AnswerVerificationResult;
  modelCalls: number;
}

async function requestCompletion(message: string, systemContext: string) {
  const response = await fetch('/api/explain-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: message }],
      systemContext,
      stream: false,
    }),
  });

  const payload = await response.json().catch(() => ({})) as GenerationResponse;
  if (!response.ok) {
    throw new Error(payload.error || `Generation request failed (${response.status})`);
  }
  if (!payload.explanation?.trim() || !payload.finishReason) {
    throw new Error('Generation completed without a usable answer');
  }

  return {
    answer: payload.explanation.trim(),
    completion: {
      type: 'complete' as const,
      finishReason: payload.finishReason,
      usageMetadata: payload.usageMetadata,
    },
  };
}

/**
 * Generates a draft, reviews it against the same repository evidence, then runs a deterministic
 * release gate. A rejected review gets a bounded repair pass before the answer can reach the UI.
 */
export async function generateVerifiedRepositoryAnswer(
  question: string,
  systemContext: string,
  evidence: RetrievedEvidence[]
): Promise<VerifiedRepositoryAnswer> {
  let modelCalls = 0;

  const draft = await requestCompletion(question, systemContext);
  modelCalls += 1;

  let reviewed = await requestCompletion(
    buildAnswerReviewPrompt(question, draft.answer),
    systemContext
  );
  modelCalls += 1;

  let verification = verifyGeneratedAnswer(reviewed.answer, evidence);

  for (
    let attempt = 0;
    !verification.passed && attempt < MODEL_BUDGET.MAX_VERIFICATION_ATTEMPTS;
    attempt += 1
  ) {
    reviewed = await requestCompletion(
      buildAnswerRepairPrompt(question, reviewed.answer, verification.reasons),
      systemContext
    );
    modelCalls += 1;
    verification = verifyGeneratedAnswer(reviewed.answer, evidence);
  }

  if (!verification.passed) {
    throw new Error(
      `Answer was withheld because it did not pass the repository evidence check: ${verification.reasons.join(' ')}`
    );
  }

  return {
    answer: reviewed.answer,
    completion: reviewed.completion,
    verification,
    modelCalls,
  };
}
