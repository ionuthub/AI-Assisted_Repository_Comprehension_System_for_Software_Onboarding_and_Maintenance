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
  reason: "direct" | "symbol" | "structural";
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

/**
 * Builds a wider evidence set for the current artefact.
 *
 * Direct lexical matches are supplemented with symbol/path matches and resolved import
 * neighbours. This keeps exact identifier search while improving questions whose answer is
 * spread across callers, callees and configuration files.
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
    addCandidate(candidates, result.path, result.score + pathBoost + symbolBoost, symbolBoost > 0 ? "symbol" : "direct");
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

  const structuralSeeds = [...candidates.values()]
    .sort((a, b) => b.score - a.score || a.path.localeCompare(b.path))
    .slice(0, options.structuralSeeds);

  for (const seed of structuralSeeds) {
    const analysis = analyses[seed.path];
    if (!analysis) continue;

    const neighbours = new Set<string>([
      ...analysis.usedBy,
      ...analysis.imports.map((item) => item.resolvedPath).filter((path): path is string => Boolean(path)),
    ]);

    for (const neighbour of neighbours) {
      if (!fileByPath.has(neighbour)) continue;
      addCandidate(candidates, neighbour, seed.score * 0.72, "structural");
    }
  }

  // If lexical retrieval is sparse, add well-connected files so broad architecture questions
  // still receive repository-level context rather than an empty prompt.
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
