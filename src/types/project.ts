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
  /** Coverage of the source files eligible for repository analysis. */
  ingestion?: {
    totalCandidateFiles: number;
    /** Every blob in the GitHub tree before source filtering. */
    totalRepositoryFiles: number;
    /** Eligible files selected for content fetching before unreadable entries are removed. */
    includedFiles: number;
    filesWithContent: number;
    treeTruncatedByGitHub: boolean;
    /** Files not indexed, with the actual exclusion reason. */
    excluded: ExcludedFile[];
  };
}
