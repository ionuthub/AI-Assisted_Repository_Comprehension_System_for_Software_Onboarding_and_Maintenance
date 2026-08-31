import { describe, expect, it } from "vitest";
import {
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

  it("includes release-gate findings in a repair prompt", () => {
    const prompt = buildAnswerRepairPrompt(
      "Where does execution start?",
      "Rejected answer",
      ["No retrieved file was cited."]
    );
    expect(prompt).toContain("No retrieved file was cited.");
    expect(prompt).toContain("Rejected answer");
  });
});
