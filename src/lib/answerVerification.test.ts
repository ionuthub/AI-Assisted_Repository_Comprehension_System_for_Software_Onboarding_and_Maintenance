import { describe, expect, it } from "vitest";
import {
  buildAnswerAuditPrompt,
  buildAnswerRepairPrompt,
  buildAnswerReviewPrompt,
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
    expect(prompt).toContain("explicitly identify relevant emitted event types with no listener");
    expect(prompt).toContain("recompute comparisons");
    expect(prompt).toContain("One listener creates a notification.");
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
