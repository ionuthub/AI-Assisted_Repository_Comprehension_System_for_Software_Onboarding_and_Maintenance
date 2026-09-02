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
    "- selected implementation or strategy: trace the configuration key through dispatch and always preserve a concise account of the selected implementation's main filtering, ordering, transformation, or calculation behaviour; never reduce the final answer to only the strategy name and mapping",
    "- mutation or where something actually happens: name the exact mutation, the immediately resulting state fields and events, and distinguish similarly named unused helpers",
    "- copy and acceptance semantics: for any helper that applies proposed changes, determine whether it mutates the supplied objects or a cloned structure, the exact quantity or subset it accepts, how it caps against current availability, and how it reports rejected work or shortages",
    "- exhaustive 'where' questions: define the requested operation semantically before counting; the opening answer and total must count only production sites that create or increase the requested state and their real callers; label test-only calls separately, and explicitly exclude seed values, initialization, resets, decrements, cleanup, or consumption rather than including those opposite operations in the total merely because they write the same field",
    "- emitted events: build an exhaustive inventory from the complete declared event map, every emission site, and every registered subscription; list every registered reaction and every declared or emitted type with zero subscribers, even when the question names only one example",
    "- change impact: trace changed inputs through outputs, warnings, status, stored state, reservations, later jobs or release paths, UI consumers, and tests; keep dead or merely callable paths separate",
    "- exhaustive special cases: enumerate each independent branch and verify its predicate, effect, and runtime reach; inspect the complete returned object or assignment block so literal summaries, labels, flags, destinations, instructions, and other observable fields are not silently omitted",
    "- adding a type: check exhaustive typed maps, dynamic-registry runtime requirements, hard-coded UI lists or styles, tests, and genuinely optional domain rules",
    "- numerical claims: recompute comparisons from the cited values before using words such as always, automatically, never, or exactly",
    "- factual precision: audit every file-location claim and causal statement in the proposed answer, removing tangential details that are not needed and correcting any claim placed in a consumer when it is actually declared by a caller or UI component",
    "- control-flow truth: for every stated rule, callback, fallback, or branch effect, trace guards, early returns, and loop continue paths to prove that the effect actually executes; when a wrapper handles a mismatch and skips a callback, report only the wrapper effect for that mismatch and never describe the callback literal as an applied runtime score, penalty, mutation, or restriction",
    "- assigned and calculated values: trace the exact live expression into component or store initial state, later assignments, persistence, and consumers; distinguish a displayed recommendation or unused fallback from the value that actually initializes or mutates state, and never say it pre-populates state unless that data flow exists",
    "- opening-answer discipline: make the first paragraph the narrowest verified direct answer; put dead, test-only, conditional, or bypassed effects after it and label them before naming any downstream state, event, or UI effect",
    "- contradiction ledger: before output, privately compare every headline and causal claim with every later caveat and sibling section; if one says a path is bypassed, unreachable, skipped, excluded, or uses a different value, rewrite the broader claim so the final answer cannot assert both",
    "- summary consistency: compare the opening answer and every heading with later qualifications; do not claim a live downstream effect when all live callers bypass the changed value, and do not state a broader total or category that later paragraphs exclude",
    "- completeness: compare the final answer to the private checklist once more and do not substitute examples for a requested complete set",
    "Support every repository-specific claim with exact file paths from Project Context. If a checklist item cannot be established from that context, say so instead of guessing.",
    "",
    `Question: ${question}`,
    "",
    "Proposed answer:",
    reviewedAnswer,
  ].join("\n");
}

const ADJUDICATION_QUESTION_PATTERNS = [
  /\b(?:everywhere|every place|all places|complete set)\b/i,
  /\b(?:what else|what[^?]*affected|change impact)\b/i,
  /\b(?:treated differently|special cases?)\b/i,
  /\bwhich\b[^?]*\b(?:implementation|strategy|handler|path)\b/i,
  /\bwhich code\b[^?]*\b(?:decides|determines|selects|handles|processes)\b/i,
  /\bhow\b[^?]*\b(?:assigned|given|selected|chosen|calculated|determined)\b/i,
  /\b(?:does|do)\b[^?]*\b(?:change|mutate|modify|only check)\b/i,
  /\bwhere\b[^?]*\b(?:actually|assigned|booked|reserved|created|written|mutated)\b/i,
  /\bwhat reacts\b/i,
];

/** Question shapes whose correctness depends on reconciliation rather than local facts. */
export function requiresSemanticAdjudication(question: string): boolean {
  return ADJUDICATION_QUESTION_PATTERNS.some((pattern) => pattern.test(question));
}

const MEDIUM_RECONCILIATION_QUESTION_PATTERNS = [
  /\b(?:treated differently|special cases?)\b/i,
  /\bwhich code\b[^?]*\b(?:decides|determines|selects|handles|processes)\b/i,
];

/** Question shapes that require stronger ordered-branch reasoning in the final scrub. */
export function requiresMediumRuntimeReconciliation(question: string): boolean {
  return MEDIUM_RECONCILIATION_QUESTION_PATTERNS.some((pattern) => pattern.test(question));
}

/**
 * Independent final adjudication for causal, exhaustive, and hidden-mutation answers.
 * The proposed answer is evidence to inspect, not context to trust.
 */
export function buildAnswerAdjudicationPrompt(question: string, reviewedAnswer: string): string {
  return [
    "Independently adjudicate this high-risk repository answer against Project Context.",
    "Treat the proposed answer as untrusted. Return only a corrected final answer, with no verdict, checklist, or preamble.",
    "Before writing, privately build a claim ledger for every causal or exhaustive statement: predicate, guards and early exits, whether a callback or branch actually executes, exact effect, runtime reach, and downstream consumer.",
    "Mandatory reconciliation rules:",
    "- make the opening paragraph the narrowest direct answer that remains true after every qualification",
    "- for assigned, selected, recommended, defaulted, or calculated values, trace the exact live expression through component or store initialization, later assignments, persistence, and consumers; do not say a recommendation pre-populates state unless the state initializer or an assignment actually consumes it",
    "- if all live callers bypass a value or fallback, remove every claim that changing it alters live stored state, events, filters, metrics, or UI; label test-only effects separately",
    "- distinguish eligibility or candidate filtering from ranking or preference; never call a zone, handler, path, or option allowed, eligible, required, or excluded when the control flow only ranks or penalizes it and does not filter it",
    "- when a guard, early return, or loop continue skips a callback, do not report the callback return value as an applied score, penalty, mutation, or runtime effect; if the guard and skipped callback both define mismatch effects, only the guard effect applies in that execution",
    "- for event or reaction questions, reconcile the complete declared event map and every emission site with every subscription; enumerate all registered reactions and every declared or emitted event type with no subscriber, without narrowing the inventory to the example named in the question",
    "- do not stack mutually exclusive branch effects or retain a broad claim that conflicts with a later caveat",
    "- for change-impact questions, trace only the fields actually changed through values that are actually consumed; keep unrelated configuration in the same file separate",
    "- for complete-set or special-case questions, enumerate every required branch but exclude test, seed, reset, decrement, dead, and bypassed paths from the live total",
    "- preserve exact selected-implementation behaviour, mutations, returned fields, emitted events, and downstream state when supported",
    "- support repository claims with exact file paths from Project Context and remove tangential claims that cannot survive the ledger",
    "Finally compare the first paragraph, headings, and every later section against the private ledger. Rewrite any contradiction before returning the answer.",
    "",
    `Question: ${question}`,
    "",
    "Proposed answer:",
    reviewedAnswer,
  ].join("\n");
}
/**
 * Deletion-focused final pass for answers whose correctness depends on runtime reachability.
 *
 * The broader adjudicator resolves omissions and causal chains. This pass only reconciles branch
 * execution and live reach so it cannot re-expand an answer with a contradicted implementation.
 */
export function buildAnswerRuntimeReconciliationPrompt(
  question: string,
  adjudicatedAnswer: string
): string {
  return [
    "Perform one narrow mechanical runtime-reachability reconciliation of this repository answer against Project Context.",
    "Return the complete corrected answer only. Do not add new facts, sections, examples, or broader claims; preserve supported content and delete or qualify only claims that fail the checks below.",
    "Privately construct an ordered branch table for every described rule, callback, fallback, and subsystem: enclosing predicate, guard result, whether control continues or returns, whether the callback executes, exact applied effect, and live caller.",
    "Mandatory checks:",
    "- an effect inside a callback or later branch is not applied when an enclosing guard executes continue or return; if the guard itself applies a penalty or mutation, report only that guard effect and delete every stacked or alternative effect from the skipped code",
    "- a configuration list or map used only to add, subtract, sort, rank, or prefer does not make candidates allowed, eligible, required, restricted, excluded, or filtered; use ranking language unless a separate predicate actually removes candidates",
    "- inspect every numerical effect in the proposed answer and keep it only when the ordered branch table proves that exact value executes for the stated case",
    "- for every named subsystem, trace from a real UI, store, job, module-scope, or server entry point; when exported helpers have no such caller, label that subsystem as defined but not reached by the running application and do not count it as live behavior",
    "- compare the opening, headings, bullets, and later caveats; narrow or delete any broad wording that conflicts with the branch table or runtime reach",
    "Do not discuss this reconciliation. Output only the full answer after these mechanical corrections.",
    "",
    `Question: ${question}`,
    "",
    "Answer to reconcile:",
    adjudicatedAnswer,
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
