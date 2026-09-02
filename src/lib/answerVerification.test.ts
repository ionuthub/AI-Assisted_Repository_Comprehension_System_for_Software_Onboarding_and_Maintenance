import { describe, expect, it } from "vitest";
import {
  buildAnswerAdjudicationPrompt,
  buildAnswerAuditPrompt,
  buildAnswerRepairPrompt,
  buildAnswerReviewPrompt,
  requiresSemanticAdjudication,
  verifyGeneratedAnswer,
} from "@/lib/answerVerification";
import type { RetrievedEvidence } from "@/components/EvidencePanel";

const evidence: RetrievedEvidence[] = [
  {
    path: "src/main.tsx",
    score: 0.9,
    excerpt: "createRoot(root).render(<App />);",
    startLine: 1,
    endLine: 10,
    totalLines: 10,
    omittedLines: 0,
    omittedCharacters: 0,
  },
  {
    path: "package.json",
    score: 0.7,
    excerpt: "{\"scripts\":{\"dev\":\"vite\"}}",
    startLine: 1,
    endLine: 1,
    totalLines: 1,
    omittedLines: 0,
    omittedCharacters: 0,
  },
];

describe("verifyGeneratedAnswer", () => {
  it("passes an answer that cites supplied evidence", () => {
    const result = verifyGeneratedAnswer(
      "Browser execution starts in `src/main.tsx`, which renders the application.",
      evidence
    );

    expect(result.passed).toBe(true);
    expect(result.citedEvidencePaths).toEqual(["src/main.tsx"]);
  });

  it("recognises root-level evidence paths", () => {
    const result = verifyGeneratedAnswer(
      "The development command is defined in `package.json`.",
      evidence
    );

    expect(result.passed).toBe(true);
    expect(result.citedEvidencePaths).toContain("package.json");
  });

  it("resolves an unambiguous relative import to its canonical evidence path", () => {
    const withStyles = [
      ...evidence,
      { ...evidence[0], path: "src/styles.css" },
    ];
    const result = verifyGeneratedAnswer(
      "The entry module imports `./styles.css` before rendering the application from `src/main.tsx`.",
      withStyles
    );

    expect(result.passed).toBe(true);
    expect(result.citedEvidencePaths).toContain("src/styles.css");
    expect(result.unverifiedPaths).toEqual([]);
  });

  it("rejects an ambiguous bare or relative filename rather than guessing", () => {
    const ambiguous = [
      ...evidence,
      { ...evidence[0], path: "src/styles.css" },
      { ...evidence[0], path: "src/admin/styles.css" },
    ];
    const result = verifyGeneratedAnswer(
      "The page styling comes from `./styles.css`, while execution starts in `src/main.tsx`.",
      ambiguous
    );

    expect(result.passed).toBe(false);
    expect(result.unverifiedPaths).toEqual(["./styles.css"]);
  });

  it("rejects paths that were not supplied to the model", () => {
    const result = verifyGeneratedAnswer(
      "Execution starts in `src/server.ts`.",
      evidence
    );

    expect(result.passed).toBe(false);
    expect(result.unverifiedPaths).toEqual(["src/server.ts"]);
  });

  it("allows an explicit insufficient-evidence response without a citation", () => {
    const result = verifyGeneratedAnswer(
      "The supplied evidence is insufficient to determine that behaviour.",
      evidence
    );

    expect(result.passed).toBe(true);
  });

  it("rejects repository claims when there is no evidence", () => {
    const result = verifyGeneratedAnswer("The application starts in src/main.tsx.", []);
    expect(result.passed).toBe(false);
  });
});

describe("verification prompts", () => {
  it("keeps the original question and draft in the review prompt", () => {
    const prompt = buildAnswerReviewPrompt("Where does execution start?", "Draft answer");
    expect(prompt).toContain("Where does execution start?");
    expect(prompt).toContain("Draft answer");
    expect(prompt).toContain("Return only the corrected final answer");
  });

  it("requires runtime caller and override tracing", () => {
    const prompt = buildAnswerReviewPrompt(
      "If this configuration changes, what is affected?",
      "The store uses the fallback value."
    );
    expect(prompt).toContain("real UI/job/runtime entry points");
    expect(prompt).toContain("if every live caller supplies an override");
    expect(prompt).toContain("bypassed fallback as live application behaviour");
  });

  it("requires an exhaustive final audit shaped by the question", () => {
    const prompt = buildAnswerAuditPrompt(
      "What reacts when an event is emitted?",
      "One listener creates a notification."
    );
    expect(prompt).toContain("private checklist");
    expect(prompt).toContain("if every live caller supplies an override");
    expect(prompt).toContain("complete declared event map");
    expect(prompt).toContain("declared or emitted type with zero subscribers");
    expect(prompt).toContain("whether it mutates the supplied objects or a cloned structure");
    expect(prompt).toContain("never reduce the final answer to only the strategy name and mapping");
    expect(prompt).toContain("the opening answer and total must count only production sites");
    expect(prompt).toContain("explicitly exclude seed values, initialization, resets, decrements");
    expect(prompt).toContain("inspect the complete returned object or assignment block");
    expect(prompt).toContain("audit every file-location claim and causal statement");
    expect(prompt).toContain("trace guards, early returns, and loop continue paths");
    expect(prompt).toContain("never describe the callback literal as an applied runtime score");
    expect(prompt).toContain("never say it pre-populates state unless that data flow exists");
    expect(prompt).toContain("complete declared event map");
    expect(prompt).toContain("zero subscribers");
    expect(prompt).toContain("make the first paragraph the narrowest verified direct answer");
    expect(prompt).toContain("privately compare every headline and causal claim");
    expect(prompt).toContain("rewrite the broader claim so the final answer cannot assert both");
    expect(prompt).toContain("compare the opening answer and every heading with later qualifications");
    expect(prompt).toContain("do not claim a live downstream effect when all live callers bypass");
    expect(prompt).toContain("recompute comparisons");
    expect(prompt).toContain("One listener creates a notification.");
  });

  it("targets causal, exhaustive, and special-case questions for adjudication", () => {
    expect(requiresSemanticAdjudication("If the routing rules changed, what else would be affected?")).toBe(true);
    expect(requiresSemanticAdjudication("Are restricted records treated differently anywhere?")).toBe(true);
    expect(requiresSemanticAdjudication("Which pricing implementation runs for a bulk request?")).toBe(true);
    expect(requiresSemanticAdjudication("How is a referral given its priority band?")).toBe(true);
    expect(requiresSemanticAdjudication("How is an order assigned to a warehouse zone?")).toBe(true);
    expect(requiresSemanticAdjudication("Which code decides how a given order type is processed?")).toBe(true);
    expect(requiresSemanticAdjudication("Where does execution start?")).toBe(false);
  });

  it("requires an independent claim-ledger adjudication", () => {
    const prompt = buildAnswerAdjudicationPrompt(
      "If configuration changes, what is affected?",
      "A bypassed fallback changes every downstream screen."
    );
    expect(prompt).toContain("Treat the proposed answer as untrusted");
    expect(prompt).toContain("guards and early exits");
    expect(prompt).toContain("does not filter it");
    expect(prompt).toContain("only the guard effect applies");
    expect(prompt).toContain("state initializer or an assignment actually consumes it");
    expect(prompt).toContain("complete declared event map");
    expect(prompt).toContain("every declared or emitted event type with no subscriber");
    expect(prompt).toContain("do not stack mutually exclusive branch effects");
    expect(prompt).toContain("remove every claim that changing it alters live stored state");
    expect(prompt).toContain("A bypassed fallback changes every downstream screen.");
  });
  it("includes release-gate findings in a repair prompt", () => {
    const prompt = buildAnswerRepairPrompt(
      "Where does execution start?",
      "Rejected answer",
      ["No retrieved file was cited."]
    );
    expect(prompt).toContain("No retrieved file was cited.");
    expect(prompt).toContain("Rejected answer");
    expect(prompt).toContain("caller arguments/overrides");
  });
});
