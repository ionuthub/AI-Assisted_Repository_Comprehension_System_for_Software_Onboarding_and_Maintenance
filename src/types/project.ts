export type ProjectType = "github" | "generated" | "uploaded";

export interface ProjectFile {
  path: string;
  language?: string | null;
  content?: string | null;
  rawUrl?: string | null;
  size?: number | null;
}

export interface ExcludedFile {
  path: string;
  reason: string;
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
    /** Every blob the repository contains, before any filter. */
    totalRepositoryFiles: number;
    includedFiles: number;
    filesWithContent: number;
    treeTruncatedByGitHub: boolean;
    /**
     * Files present in the repository but not indexed, with the reason the filter gave.
     * Retained so the interface can state why coverage is partial, and so a path the model
     * names can be reported as excluded rather than merely absent.
     */
    excluded: ExcludedFile[];
  };
}
