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
    /** All files that passed the source/configuration filters; there is no count cap. */
    totalCandidateFiles: number;
    /** Every blob discovered from the complete Git tree before source filtering. */
    totalRepositoryFiles: number;
    /** Eligible files selected for content fetching before unreadable entries are removed. */
    includedFiles: number;
    filesWithContent: number;
    /** True only when known tree truncation remains unresolved; successful ingestion is false. */
    treeTruncatedByGitHub: boolean;
    /** Files not indexed, with the actual exclusion reason. */
    excluded: ExcludedFile[];
  };
}
