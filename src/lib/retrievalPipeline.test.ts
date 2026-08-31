import { describe, expect, it } from "vitest";
import type { ProjectFile } from "@/types/project";
import type { FileAnalysisResult } from "@/lib/staticAnalysis";
import { buildSearchIndex } from "@/lib/semanticSearch";
import { retrieveRepositoryEvidence } from "@/lib/retrievalPipeline";

const file = (path: string, content: string): ProjectFile => ({
  path,
  content,
  language: "typescript",
  size: content.length,
  rawUrl: null,
});

const files = [
  file("src/routes/register.ts", "export function registerUser() { return createUser(); }"),
  file("src/services/users.ts", "export function createUser() { return saveUser(); }"),
  file("src/store/users.ts", "export function saveUser() { return database.insert(); }"),
  file("src/config/roles.ts", "export const defaultRole = 'member';"),
];

const analyses: Record<string, FileAnalysisResult> = {
  "src/routes/register.ts": {
    path: "src/routes/register.ts",
    imports: [{ name: "createUser", source: "../services/users", resolvedPath: "src/services/users.ts" }],
    exports: ["registerUser"],
    functions: [{ name: "registerUser", isAsync: false, parameters: [] }],
    components: [],
    classes: [],
    isApiRoute: true,
    usedBy: [],
  },
  "src/services/users.ts": {
    path: "src/services/users.ts",
    imports: [{ name: "saveUser", source: "../store/users", resolvedPath: "src/store/users.ts" }],
    exports: ["createUser"],
    functions: [{ name: "createUser", isAsync: false, parameters: [] }],
    components: [],
    classes: [],
    isApiRoute: false,
    usedBy: ["src/routes/register.ts"],
  },
  "src/store/users.ts": {
    path: "src/store/users.ts",
    imports: [],
    exports: ["saveUser"],
    functions: [{ name: "saveUser", isAsync: false, parameters: [] }],
    components: [],
    classes: [],
    isApiRoute: false,
    usedBy: ["src/services/users.ts"],
  },
  "src/config/roles.ts": {
    path: "src/config/roles.ts",
    imports: [],
    exports: ["defaultRole"],
    functions: [],
    components: [],
    classes: [],
    isApiRoute: false,
    usedBy: [],
  },
};

const options = {
  candidateFiles: 12,
  structuralSeeds: 4,
  maxEvidenceFiles: 6,
  excerptChars: 1000,
};

describe("retrieveRepositoryEvidence", () => {
  it("keeps direct matches and adds resolved structural neighbours", () => {
    const index = buildSearchIndex(files);
    const evidence = retrieveRepositoryEvidence("registerUser", index, files, analyses, options);
    const paths = evidence.map((item) => item.path);

    expect(paths).toContain("src/routes/register.ts");
    expect(paths).toContain("src/services/users.ts");
  });

  it("finds a file from a matching exported symbol", () => {
    const index = buildSearchIndex(files);
    const evidence = retrieveRepositoryEvidence("defaultRole", index, files, analyses, options);

    expect(evidence[0].path).toBe("src/config/roles.ts");
    expect(evidence[0].reason).toBe("symbol");
  });

  it("returns deterministic evidence for the same repository and query", () => {
    const index = buildSearchIndex(files);
    const a = retrieveRepositoryEvidence("create user", index, files, analyses, options);
    const b = retrieveRepositoryEvidence("create user", index, files, analyses, options);

    expect(a).toEqual(b);
  });

  it("never returns more than the configured evidence limit", () => {
    const index = buildSearchIndex(files);
    const evidence = retrieveRepositoryEvidence("user", index, files, analyses, {
      ...options,
      maxEvidenceFiles: 2,
    });

    expect(evidence.length).toBeLessThanOrEqual(2);
  });
});
