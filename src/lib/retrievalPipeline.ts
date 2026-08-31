import type { ProjectFile } from "@/types/project";
import type { FileAnalysisResult } from "@/lib/staticAnalysis";
import {
  searchRepository,
  selectExcerptRegion,
  tokenize,
  type SearchIndex,
} from "@/lib/semanticSearch";

export interface RepositoryEvidence {
  path: string;
  score: number;
  excerpt: string;
  startLine: number;
  endLine: number;
  totalLines: number;
  omittedLines: number;
  omittedCharacters: number;
  reason: "direct" | "symbol" | "structural" | "entry";
}

export interface RetrievalOptions {
  candidateFiles: number;
  structuralSeeds: number;
  maxEvidenceFiles: number;
  excerptChars: number;
}

interface RankedCandidate {
  path: string;
  score: number;
  reason: RepositoryEvidence["reason"];
}

const ENTRY_INTENT_TERMS = new Set([
  "start",
  "entry",
  "entrypoint",
  "execution",
  "boot",
  "bootstrap",
  "launch",
  "initialise",
  "initialize",
]);

const overlapRatio = (queryTokens: Set<string>, values: string[]): number => {
  if (queryTokens.size === 0 || values.length === 0) return 0;
  const valueTokens = new Set(values.flatMap((value) => tokenize(value)));
  let matched = 0;
  for (const token of queryTokens) {
    if (valueTokens.has(token)) matched += 1;
  }
  return matched / queryTokens.size;
};

const symbolValues = (analysis?: FileAnalysisResult): string[] => {
  if (!analysis) return [];
  return [
    ...analysis.exports,
    ...analysis.functions.map((fn) => fn.name),
    ...analysis.components,
    ...analysis.classes,
    ...analysis.imports.flatMap((item) => [item.name, item.source]),
  ];
};

const addCandidate = (
  candidates: Map<string, RankedCandidate>,
  path: string,
  score: number,
  reason: RankedCandidate["reason"]
) => {
  const clamped = Math.max(0, Math.min(score, 1));
  const existing = candidates.get(path);
  if (!existing || clamped > existing.score) {
    candidates.set(path, { path, score: clamped, reason });
  }
};

const resolvedNeighbours = (analysis?: FileAnalysisResult): string[] => {
  if (!analysis) return [];
  return [
    ...analysis.usedBy,
    ...analysis.imports
      .map((item) => item.resolvedPath)
      .filter((path): path is string => Boolean(path)),
  ];
};

const entryPointScore = (path: string, analysis?: FileAnalysisResult): number => {
  const filename = path.split("/").pop()?.toLowerCase() ?? "";
  let score = 0;

  if (/^(main|index|server|bootstrap|cli)\.(tsx?|jsx?|py|go|rb|java|cs|php)$/.test(filename)) {
    score = 0.82;
  } else if (/^app\.(tsx?|jsx?|py|go|rb|java|cs|php)$/.test(filename)) {
    score = 0.68;
  } else if (filename === "package.json") {
    score = 0.64;
  }

  // A named entry file with no in-repository callers but with outgoing imports is especially
  // likely to be a root rather than a utility barrel that merely happens to be named index.
  if (score > 0 && analysis && analysis.usedBy.length === 0 && resolvedNeighbours(analysis).length > 0) {
    score += 0.08;
  }

  return Math.min(score, 1);
};

/**
 * Builds the evidence set for the current artefact.
 *
 * Retrieval combines lexical rank, path/symbol matches, entry-point intent and import/caller
 * relationships. The graph expansion runs to two hops so a question about a behaviour can
 * reach the configuration and store/controller on either side of a directly matched helper.
 */
export function retrieveRepositoryEvidence(
  query: string,
  index: SearchIndex,
  files: ProjectFile[],
  analyses: Record<string, FileAnalysisResult>,
  options: RetrievalOptions
): RepositoryEvidence[] {
  const fileByPath = new Map(files.map((file) => [file.path, file]));
  const queryTokens = new Set(tokenize(query));
  const candidates = new Map<string, RankedCandidate>();

  const direct = searchRepository(query, index, files, options.candidateFiles);
  for (const result of direct) {
    const pathBoost = overlapRatio(queryTokens, [result.path]) * 0.18;
    const symbolBoost = overlapRatio(queryTokens, symbolValues(analyses[result.path])) * 0.28;
    addCandidate(
      candidates,
      result.path,
      result.score + pathBoost + symbolBoost,
      symbolBoost > 0 ? "symbol" : "direct"
    );
  }

  // A named symbol can be important even when the containing file ranks weakly as a whole.
  for (const [path, analysis] of Object.entries(analyses)) {
    if (!fileByPath.has(path)) continue;
    const symbolMatch = overlapRatio(queryTokens, symbolValues(analysis));
    const pathMatch = overlapRatio(queryTokens, [path]);
    if (symbolMatch > 0 || pathMatch > 0) {
      addCandidate(candidates, path, 0.55 + symbolMatch * 0.3 + pathMatch * 0.15, "symbol");
    }
  }

  // Questions such as "Where does execution start?" often share no vocabulary with the
  // actual main/index/bootstrap file. Use conventional entry names plus graph-root evidence
  // only when the question itself expresses entry/execution intent.
  const asksForEntryPoint = [...queryTokens].some((token) => ENTRY_INTENT_TERMS.has(token));
  if (asksForEntryPoint) {
    for (const file of files) {
      const score = entryPointScore(file.path, analyses[file.path]);
      if (score > 0) addCandidate(candidates, file.path, score, "entry");
    }
  }

  const structuralSeeds = [...candidates.values()]
    .sort((a, b) => b.score - a.score || a.path.localeCompare(b.path))
    .slice(0, options.structuralSeeds);

  for (const seed of structuralSeeds) {
    let frontier = [seed.path];
    const visited = new Set<string>(frontier);

    for (let depth = 1; depth <= 2 && frontier.length > 0; depth += 1) {
      const nextFrontier: string[] = [];
      const depthScore = seed.score * (depth === 1 ? 0.72 : 0.48);

      for (const currentPath of frontier) {
        for (const neighbour of resolvedNeighbours(analyses[currentPath])) {
          if (!fileByPath.has(neighbour) || visited.has(neighbour)) continue;
          visited.add(neighbour);
          nextFrontier.push(neighbour);
          addCandidate(candidates, neighbour, depthScore, "structural");
        }
      }

      frontier = nextFrontier;
    }
  }

  // If retrieval is still sparse, add well-connected files so a broad architecture question
  // receives repository-level context instead of an empty prompt.
  if (candidates.size < Math.min(4, options.maxEvidenceFiles)) {
    const connected = Object.values(analyses)
      .filter((analysis) => fileByPath.has(analysis.path))
      .sort((a, b) => b.usedBy.length - a.usedBy.length || a.path.localeCompare(b.path));

    for (const analysis of connected.slice(0, 4)) {
      addCandidate(candidates, analysis.path, 0.2 + Math.min(analysis.usedBy.length, 10) * 0.02, "structural");
    }
  }

  const ranked = [...candidates.values()]
    .sort((a, b) => b.score - a.score || a.path.localeCompare(b.path))
    .slice(0, options.maxEvidenceFiles);

  const evidence: RepositoryEvidence[] = [];
  for (const candidate of ranked) {
    const file = fileByPath.get(candidate.path);
    if (!file?.content) continue;
    const region = selectExcerptRegion(file.content, query, options.excerptChars);
    evidence.push({
      path: candidate.path,
      score: candidate.score,
      excerpt: region.text,
      startLine: region.startLine,
      endLine: region.endLine,
      totalLines: region.totalLines,
      omittedLines: region.omittedLines,
      omittedCharacters: region.omittedCharacters,
      reason: candidate.reason,
    });
  }

  return evidence;
}
