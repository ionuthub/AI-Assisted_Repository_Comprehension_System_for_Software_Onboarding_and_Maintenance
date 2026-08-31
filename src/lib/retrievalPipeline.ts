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
  evidenceBudgetChars: number;
  maxExcerptChars: number;
  minExcerptChars: number;
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

const EVIDENCE_HEADER_CHARS = 180;

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

  if (score > 0 && analysis && analysis.usedBy.length === 0 && resolvedNeighbours(analysis).length > 0) {
    score += 0.08;
  }

  return Math.min(score, 1);
};

const rankCandidates = (
  query: string,
  index: SearchIndex,
  files: ProjectFile[],
  analyses: Record<string, FileAnalysisResult>
): RankedCandidate[] => {
  const fileByPath = new Map(files.map((file) => [file.path, file]));
  const queryTokens = new Set(tokenize(query));
  const candidates = new Map<string, RankedCandidate>();

  // Search the full indexed repository. The previous candidate-file cap could discard the
  // correct file before path, symbol or graph evidence had a chance to improve its rank.
  const direct = searchRepository(query, index, files, files.length);
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

  for (const [path, analysis] of Object.entries(analyses)) {
    if (!fileByPath.has(path)) continue;
    const symbolMatch = overlapRatio(queryTokens, symbolValues(analysis));
    const pathMatch = overlapRatio(queryTokens, [path]);
    if (symbolMatch > 0 || pathMatch > 0) {
      addCandidate(candidates, path, 0.55 + symbolMatch * 0.3 + pathMatch * 0.15, "symbol");
    }
  }

  const asksForEntryPoint = [...queryTokens].some((token) => ENTRY_INTENT_TERMS.has(token));
  if (asksForEntryPoint) {
    for (const file of files) {
      const score = entryPointScore(file.path, analyses[file.path]);
      if (score > 0) addCandidate(candidates, file.path, score, "entry");
    }
  }

  const rankedBeforeGraph = [...candidates.values()]
    .sort((a, b) => b.score - a.score || a.path.localeCompare(b.path));
  const bestScore = rankedBeforeGraph[0]?.score ?? 0;
  const seedThreshold = Math.max(0.18, bestScore * 0.5);
  const structuralSeeds = rankedBeforeGraph.filter((candidate) => candidate.score >= seedThreshold);

  // Expand all meaningfully ranked seeds rather than an arbitrary top-N seed list.
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

  if (candidates.size < 4) {
    const connected = Object.values(analyses)
      .filter((analysis) => fileByPath.has(analysis.path))
      .sort((a, b) => b.usedBy.length - a.usedBy.length || a.path.localeCompare(b.path));

    for (const analysis of connected.slice(0, 4)) {
      addCandidate(candidates, analysis.path, 0.2 + Math.min(analysis.usedBy.length, 10) * 0.02, "structural");
    }
  }

  return [...candidates.values()]
    .sort((a, b) => b.score - a.score || a.path.localeCompare(b.path));
};

/**
 * Builds the evidence set for the current artefact.
 *
 * The repository itself is not capped. Retrieval ranks every indexed file and spends a context
 * budget on the best evidence. Small relevant files therefore do not lose their place merely
 * because an arbitrary evidence-file limit has been reached.
 */
export function retrieveRepositoryEvidence(
  query: string,
  index: SearchIndex,
  files: ProjectFile[],
  analyses: Record<string, FileAnalysisResult>,
  options: RetrievalOptions
): RepositoryEvidence[] {
  const fileByPath = new Map(files.map((file) => [file.path, file]));
  const ranked = rankCandidates(query, index, files, analyses);
  const evidence: RepositoryEvidence[] = [];
  let usedChars = 0;

  for (const candidate of ranked) {
    const file = fileByPath.get(candidate.path);
    if (!file?.content) continue;

    const remaining = options.evidenceBudgetChars - usedChars - EVIDENCE_HEADER_CHARS;
    if (remaining <= 0) break;

    const excerptLimit = Math.min(options.maxExcerptChars, remaining);
    if (excerptLimit < options.minExcerptChars && evidence.length > 0) break;

    const region = selectExcerptRegion(
      file.content,
      query,
      Math.max(1, excerptLimit)
    );

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

    usedChars += region.text.length + EVIDENCE_HEADER_CHARS;
    if (usedChars >= options.evidenceBudgetChars) break;
  }

  return evidence;
}
