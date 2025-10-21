export type ProjectType = "github" | "generated";

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
  summary: ProjectSummary;
  files: ProjectFile[];
}
