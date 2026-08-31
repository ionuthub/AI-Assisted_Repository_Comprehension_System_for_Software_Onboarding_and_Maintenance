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
  file("src/main.tsx", "createRoot(root).render(App);"),
  file("src/App.tsx", "export function App() { return null; }"),
  file("src/routes/register.ts", "export function registerUser() { return createAccount(); }"),
  file("src/services/accounts.ts", "export function createAccount() { return persistRecord(); }"),
  file("src/store/database.ts", "export function persistRecord() { return database.insert(); }"),
  file("src/config/roles.ts", "export const defaultRole = 'member';"),
];

const analyses: Record<string, FileAnalysisResult> = {
  "src/main.tsx": {
    path: "src/main.tsx",
    imports: [{ name: "App", source: "./App", resolvedPath: "src/App.tsx" }],
    exports: [],
    functions: [],
    components: [],
    classes: [],
    isApiRoute: false,
    usedBy: [],
  },
  "src/App.tsx": {
    path: "src/App.tsx",
    imports: [],
    exports: ["App"],
    functions: [{ name: "App", isAsync: false, parameters: [] }],
    components: ["App"],
    classes: [],
    isApiRoute: false,
    usedBy: ["src/main.tsx"],
  },
  "src/routes/register.ts": {
    path: "src/routes/register.ts",
    imports: [{ name: "createAccount", source: "../services/accounts", resolvedPath: "src/services/accounts.ts" }],
    exports: ["registerUser"],
    functions: [{ name: "registerUser", isAsync: false, parameters: [] }],
    components: [],
    classes: [],
    isApiRoute: true,
    usedBy: [],
  },
  "src/services/accounts.ts": {
    path: "src/services/accounts.ts",
    imports: [{ name: "persistRecord", source: "../store/database", resolvedPath: "src/store/database.ts" }],
    exports: ["createAccount"],
    functions: [{ name: "createAccount", isAsync: false, parameters: [] }],
    components: [],
    classes: [],
    isApiRoute: false,
    usedBy: ["src/routes/register.ts"],
  },
  "src/store/database.ts": {
    path: "src/store/database.ts",
    imports: [],
    exports: ["persistRecord"],
    functions: [{ name: "persistRecord", isAsync: false, parameters: [] }],
    components: [],
    classes: [],
    isApiRoute: false,
    usedBy: ["src/services/accounts.ts"],
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
  evidenceBudgetChars: 20_000,
  maxExcerptChars: 2_000,
  minExcerptChars: 200,
};

describe("retrieveRepositoryEvidence", () => {
  it("keeps direct matches and adds resolved structural neighbours", () => {
    const index = buildSearchIndex(files);
    const evidence = retrieveRepositoryEvidence("registerUser", index, files, analyses, options);
    const paths = evidence.map((item) => item.path);

    expect(paths).toContain("src/routes/register.ts");
    expect(paths).toContain("src/services/accounts.ts");
  });

  it("expands to a second import hop for multi-file behaviour", () => {
    const index = buildSearchIndex(files);
    const evidence = retrieveRepositoryEvidence("registerUser", index, files, analyses, options);

    expect(evidence.map((item) => item.path)).toContain("src/store/database.ts");
  });

  it("finds a file from a matching exported symbol", () => {
    const index = buildSearchIndex(files);
    const evidence = retrieveRepositoryEvidence("defaultRole", index, files, analyses, options);

    expect(evidence[0].path).toBe("src/config/roles.ts");
    expect(evidence[0].reason).toBe("symbol");
  });

  it("retrieves a conventional graph-root entry file when the question has no lexical overlap", () => {
    const index = buildSearchIndex(files);
    const evidence = retrieveRepositoryEvidence(
      "Where does execution start in this project?",
      index,
      files,
      analyses,
      options
    );

    expect(evidence[0].path).toBe("src/main.tsx");
    expect(evidence[0].reason).toBe("entry");
    expect(evidence.map((item) => item.path)).toContain("src/App.tsx");
  });

  it("returns deterministic evidence for the same repository and query", () => {
    const index = buildSearchIndex(files);
    const a = retrieveRepositoryEvidence("create account", index, files, analyses, options);
    const b = retrieveRepositoryEvidence("create account", index, files, analyses, options);

    expect(a).toEqual(b);
  });

  it("uses the context budget instead of a fixed evidence-file count", () => {
    const manyFiles = Array.from({ length: 18 }, (_, index) =>
      file(`src/feature/part${index}.ts`, `export const sharedFeature${index} = 'shared feature';`)
    );
    const manyAnalyses = Object.fromEntries(
      manyFiles.map((item) => [item.path, {
        path: item.path,
        imports: [],
        exports: [],
        functions: [],
        components: [],
        classes: [],
        isApiRoute: false,
        usedBy: [],
      } satisfies FileAnalysisResult])
    );
    const index = buildSearchIndex(manyFiles);
    const evidence = retrieveRepositoryEvidence("shared feature", index, manyFiles, manyAnalyses, {
      evidenceBudgetChars: 20_000,
      maxExcerptChars: 800,
      minExcerptChars: 100,
    });

    expect(evidence.length).toBeGreaterThan(8);
    const consumed = evidence.reduce((sum, item) => sum + item.excerpt.length + 180, 0);
    expect(consumed).toBeLessThanOrEqual(20_000);
  });

  it("stops at the evidence budget when excerpts are large", () => {
    const largeFiles = Array.from({ length: 10 }, (_, index) =>
      file(`src/large${index}.ts`, `sharedFeature ${"x".repeat(2_000)}`)
    );
    const largeAnalyses = Object.fromEntries(
      largeFiles.map((item) => [item.path, {
        path: item.path,
        imports: [],
        exports: [],
        functions: [],
        components: [],
        classes: [],
        isApiRoute: false,
        usedBy: [],
      } satisfies FileAnalysisResult])
    );
    const index = buildSearchIndex(largeFiles);
    const evidence = retrieveRepositoryEvidence("sharedFeature", index, largeFiles, largeAnalyses, {
      evidenceBudgetChars: 5_000,
      maxExcerptChars: 2_000,
      minExcerptChars: 500,
    });

    const consumed = evidence.reduce((sum, item) => sum + item.excerpt.length + 180, 0);
    expect(consumed).toBeLessThanOrEqual(5_000);
    expect(evidence.length).toBeLessThan(10);
  });
});
