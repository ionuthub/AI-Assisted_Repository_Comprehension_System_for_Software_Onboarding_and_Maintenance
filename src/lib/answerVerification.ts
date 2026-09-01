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
 * Resolves a path written naturally in an answer to one canonical evidence path.
 *
 * Models often quote an import as `./styles.css`, while the repository evidence is keyed by its
 * canonical path such as `src/styles.css`. Treat that as grounded only when the suffix identifies
 * exactly one supplied evidence file. Ambiguous filenames remain rejected rather than guessing.
 */
function resolveMentionedPath(mention: string, evidencePaths: string[]): string | null {
  if (evidencePaths.includes(mention)) return mention;

  const normalized = mention
    .replace(/\\/g, "/")
    .replace(/^(?:\.\.\/)+/, "")
    .replace(/^(?:\.\/)+/, "");

  if (!normalized) return null;

  const matches = evidencePaths.filter(
    (path) => path === normalized || path.endsWith(`/${normalized}`)
  );

  return matches.length === 1 ? matches[0] : null;
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
  const evidencePaths = evidence.map((item) => item.path);
  const mentionedPaths = Array.from(new Set(trimmed.match(MENTIONED_PATH) ?? []));
  const resolvedMentions = mentionedPaths.map((mention) => ({
    mention,
    resolved: resolveMentionedPath(mention, evidencePaths),
  }));
  const citedEvidencePaths = Array.from(new Set(
    resolvedMentions
      .map(({ resolved }) => resolved)
      .filter((path): path is string => Boolean(path))
  ));
  const unverifiedPaths = resolvedMentions
    .filter(({ resolved }) => !resolved)
    .map(({ mention }) => mention);
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
    "- for change-impact, complete-set, 'what runs', or 'what is affected' questions, trace from the definition to every relevant direct caller and then to real UI/job/runtime entry points before claiming an effect",
    "- distinguish code that is merely present or theoretically callable from code that is actually reached by the running application",
    "- inspect arguments and defaults at real callers: if every live caller supplies an override, do not describe the bypassed fallback as live application behaviour",
    "- check whether apparent configuration fields, exported helpers or store actions are actually used before describing them as live behaviour",
    "- when the question asks for every place or a complete set, explicitly check for additional callers/branches and do not substitute examples for enumeration",
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

/**
 * Exhaustive semantic review after the initial draft.
 *
 * A fluent cross-file draft can omit one link in a complete execution path or retain an
 * unchecked numerical inference. This pass gives the model a concrete, question-shaped audit
 * checklist before any text reaches the user.
 */
export function buildAnswerAuditPrompt(question: string, reviewedAnswer: string): string {
  return [
    "Perform a final exhaustive semantic audit of the proposed repository answer against Project Context.",
    "Independently derive a private checklist of every fact needed to answer the exact question, then return only the corrected final answer. Do not output the checklist, audit notes, or a preamble.",
    "Do not merely polish the prose. Preserve supported details, fill material omissions, and remove contradictions, unreachable claims, and arithmetic or threshold errors.",
    "Apply every relevant check below:",
    "- trace definitions through direct callers, configuration, consumers, real UI or job entry points, and mutations before claiming a runtime effect",
    "- inspect caller arguments and defaults: if every live caller supplies an override, do not present the bypassed fallback as live application behaviour",
    "- verify that apparent configuration fields, exported helpers, store actions, and event types are actually used before describing them as live",
    "- execution start: distinguish the HTML loader, module-scope evaluation, React render, effects, and initialization timing",
    "- selected implementation or strategy: trace the configuration key through dispatch and summarize what the selected implementation actually does when that behaviour answers the question",
    "- mutation or where something actually happens: name the exact mutation, the immediately resulting state fields and events, and distinguish similarly named unused helpers",
    "- copy and acceptance semantics: for any helper that applies proposed changes, determine whether it mutates the supplied objects or a cloned structure, the exact quantity or subset it accepts, how it caps against current availability, and how it reports rejected work or shortages",
    "- exhaustive 'where' questions: define the requested operation semantically before counting; enumerate production mutation sites and their real callers first, then label test-only calls separately; do not count seed values, initialization, resets, decrements, cleanup, or consumption as creating the state merely because they write the same field",
    "- emitted events: enumerate every relevant registered listener and explicitly identify relevant emitted event types with no listener",
    "- change impact: trace changed inputs through outputs, warnings, status, stored state, reservations, later jobs or release paths, UI consumers, and tests; keep dead or merely callable paths separate",
    "- exhaustive special cases: enumerate each independent branch and verify its predicate, effect, and runtime reach; inspect the complete returned object or assignment block so literal summaries, labels, flags, destinations, instructions, and other observable fields are not silently omitted",
    "- adding a type: check exhaustive typed maps, dynamic-registry runtime requirements, hard-coded UI lists or styles, tests, and genuinely optional domain rules",
    "- numerical claims: recompute comparisons from the cited values before using words such as always, automatically, never, or exactly",
    "- factual precision: audit every file-location claim and causal statement in the proposed answer, removing tangential details that are not needed and correcting any claim placed in a consumer when it is actually declared by a caller or UI component",
    "- completeness: compare the final answer to the private checklist once more and do not substitute examples for a requested complete set",
    "Support every repository-specific claim with exact file paths from Project Context. If a checklist item cannot be established from that context, say so instead of guessing.",
    "",
    `Question: ${question}`,
    "",
    "Proposed answer:",
    reviewedAnswer,
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
    "Before returning it, re-check real callers, caller arguments/overrides and runtime entry points so a possible fallback is not presented as live behaviour.",
    `Question: ${question}`,
    "Gate findings:",
    ...reasons.map((reason) => `- ${reason}`),
    "",
    "Rejected answer:",
    reviewedAnswer,
  ].join("\n");
}
