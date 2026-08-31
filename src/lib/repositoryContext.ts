import type { RetrievedEvidence } from "@/components/EvidencePanel";
import type { RepositoryEvidence } from "@/lib/retrievalPipeline";
import { MAX_SYSTEM_CONTEXT_CHARS } from "@/lib/promptBuilder";

export interface RepositoryQuestionContext {
  systemContext: string;
  evidence: RetrievedEvidence[];
}

/** Builds the exact evidence text shown to the model and the UI. */
export function buildRepositoryQuestionContext(
  retrieved: RepositoryEvidence[]
): RepositoryQuestionContext {
  const evidence: RetrievedEvidence[] = retrieved.map((item) => ({
    path: item.path,
    score: item.score,
    excerpt: item.excerpt,
    startLine: item.startLine,
    endLine: item.endLine,
    totalLines: item.totalLines,
    omittedLines: item.omittedLines,
    omittedCharacters: item.omittedCharacters,
  }));

  let systemContext =
    "Use the repository evidence below to answer the question. Cite the exact files you rely on and separate direct evidence from inference.";

  if (retrieved.length === 0) {
    systemContext +=
      "\n\n[No repository evidence could be retrieved. State that the evidence is insufficient and do not invent repository-specific behaviour.]";
  } else {
    systemContext +=
      "\n\n[Repository evidence selected using lexical, path, symbol, entry-point and import/caller relationships.]";
    for (const item of retrieved) {
      systemContext +=
        `\n\n--- File: ${item.path} (lines ${item.startLine}-${item.endLine} of ${item.totalLines}) ---\n${item.excerpt}`;
    }
  }

  if (systemContext.length > MAX_SYSTEM_CONTEXT_CHARS) {
    throw new Error(
      `Repository evidence exceeded the context budget (${systemContext.length} > ${MAX_SYSTEM_CONTEXT_CHARS} characters).`
    );
  }

  return { systemContext, evidence };
}
