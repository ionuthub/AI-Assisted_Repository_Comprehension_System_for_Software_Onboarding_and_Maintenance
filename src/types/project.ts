export type ProjectType = "github" | "generated" | "uploaded";

export interface ProjectFile {
  path: string;
  language?: string | null;
  content?: string | null;
  rawUrl?: string | null;
  size?: number | null;
}

export interface ProjectSummary {
  name: string;
  owner?: string | null;
  repo?: string | null;
  description: string | null;
  source: ProjectType;
  language: string | null;
  branch?: string | null;
}

export interface Project {
  id?: string;
  summary: ProjectSummary;
  files: ProjectFile[];
  /**
   * Ingestion coverage. `files` is capped, so these record how much of the repository
   * the analysis actually saw. Retrieval quality is bounded by this, and any result
   * reported from a session should state it rather than imply whole-repository coverage.
   */
  ingestion?: {
    totalCandidateFiles: number;
    includedFiles: number;
    filesWithContent: number;
    treeTruncatedByGitHub: boolean;
  };
}
