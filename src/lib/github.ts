import type { Project, ProjectFile, ProjectSummary, ExcludedFile } from "@/types/project";
import { inferLanguageFromFilename } from "@/lib/languages";
import { ignoredDirectoryFor, isGeneratedFile } from "@/lib/ingestionFilters";

const GITHUB_API = "https://api.github.com";

// Public repositories are read without a GitHub access token.
const getGitHubHeaders = (): HeadersInit => ({
  Accept: "application/vnd.github.v3+json",
});

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const CONTENT_FETCH_CONCURRENCY = 8;
const MAX_REPO_NAME_LENGTH = 255;
const MAX_OWNER_NAME_LENGTH = 39;
const REQUEST_TIMEOUT = 10000;

export interface IngestionProgress {
  phase: "metadata" | "tree" | "fetching" | "indexing";
  completed: number;
  total: number;
  currentPath?: string;
}

export type IngestionProgressHandler = (progress: IngestionProgress) => void;

interface GitHubRepoResponse {
  name: string;
  owner: { login: string };
  description: string | null;
  language: string | null;
  default_branch: string;
}

interface GitHubTreeItem {
  path: string;
  type: "tree" | "blob";
  size?: number;
}

const CODE_FILE_PATTERN = /\.(js|ts|tsx|jsx|py|rs|rb|go|java|cs|php|swift|kt|m|c|cpp|h|hs|scala|sql|md|json|yml|yaml|html|css)$/i;

const validateGitHubIdentifier = (identifier: string, maxLength: number, type: string): string => {
  if (!identifier) throw new Error(`${type} cannot be empty`);
  if (identifier.length > maxLength) throw new Error(`${type} exceeds maximum length of ${maxLength}`);
  if (identifier === "." || identifier === ".." || !/^[a-zA-Z0-9_.-]+$/.test(identifier)) {
    throw new Error(`${type} contains invalid characters`);
  }
  return identifier;
};

const parseGitHubUrl = (url: string) => {
  try {
    const parsed = new URL(url.trim());
    const hostname = parsed.hostname.toLowerCase();
    if (hostname !== "github.com" && hostname !== "www.github.com") {
      throw new Error("Provide a valid GitHub URL");
    }
    const segments = parsed.pathname.replace(/\.git$/, "").split("/").filter(Boolean);
    if (segments.length < 2) throw new Error("GitHub URL must include owner and repository");

    const owner = validateGitHubIdentifier(segments[0], MAX_OWNER_NAME_LENGTH, "Owner");
    const repo = validateGitHubIdentifier(segments[1], MAX_REPO_NAME_LENGTH, "Repository");
    return { owner, repo };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Invalid GitHub URL");
  }
};

const handleGitHubError = async (response: Response) => {
  if (response.ok) return;
  if (response.status === 404) throw new Error("Repository not found");
  if (response.status === 403) {
    const limit = response.headers.get("x-ratelimit-remaining");
    if (limit === "0") {
      throw new Error("GitHub API rate limit exceeded. Wait a few minutes and try again.");
    }
    throw new Error("GitHub API request forbidden");
  }
  const text = await response.text();
  throw new Error(text || "GitHub API request failed");
};

const buildProjectSummary = (repo: GitHubRepoResponse): ProjectSummary => ({
  name: repo.name,
  owner: repo.owner.login,
  repo: repo.name,
  description: repo.description,
  source: "github",
  language: repo.language,
  branch: repo.default_branch,
});

const validateFilePath = (path: string): boolean => {
  let decoded: string;
  try {
    decoded = decodeURIComponent(path);
  } catch {
    return false;
  }

  return Boolean(path) &&
    !path.includes("..") &&
    !path.startsWith("/") &&
    !path.includes("\\") &&
    !decoded.includes("..") &&
    !decoded.startsWith("/") &&
    !Array.from(decoded).some((character) => {
      const codePoint = character.charCodeAt(0);
      return codePoint <= 31 || codePoint === 127;
    });
};

/**
 * Separates files that can contribute to repository understanding from files that are
 * deliberately ignored. There is no fixed file-count cap in the current artefact.
 */
export const partitionTreeFiles = (items: GitHubTreeItem[]) => {
  const blobs = items.filter((item) => item.type === "blob");
  const included: GitHubTreeItem[] = [];
  const excluded: ExcludedFile[] = [];

  for (const item of blobs) {
    const ignoredDirectory = ignoredDirectoryFor(item.path);
    if (!validateFilePath(item.path)) {
      excluded.push({ path: item.path, reason: "Unsafe path" });
    } else if (ignoredDirectory) {
      excluded.push({ path: item.path, reason: `In ${ignoredDirectory}` });
    } else if (isGeneratedFile(item.path)) {
      excluded.push({ path: item.path, reason: "Generated dependency manifest" });
    } else if (!CODE_FILE_PATTERN.test(item.path)) {
      excluded.push({ path: item.path, reason: "Not a supported source file" });
    } else if ((item.size ?? 0) > MAX_FILE_SIZE) {
      excluded.push({ path: item.path, reason: `Larger than ${MAX_FILE_SIZE / (1024 * 1024)} MB` });
    } else {
      included.push(item);
    }
  }

  return { included, excluded, totalCandidates: included.length };
};

const buildProjectFiles = (items: GitHubTreeItem[]): ProjectFile[] =>
  items.map((item) => ({
    path: item.path,
    language: inferLanguageFromFilename(item.path),
    rawUrl: null,
    size: item.size ?? null,
    content: null,
  }));

const hydrateFileContents = async (
  owner: string,
  repo: string,
  branch: string,
  files: ProjectFile[],
  onProgress?: IngestionProgressHandler
): Promise<ProjectFile[]> => {
  const hydrated: ProjectFile[] = new Array(files.length);
  let cursor = 0;
  let completed = 0;

  const worker = async (): Promise<void> => {
    while (cursor < files.length) {
      const index = cursor++;
      const file = files[index];
      try {
        const fetched = await fetchFileContent(owner, repo, branch, file.path);
        hydrated[index] = { ...file, content: fetched.content ?? null, size: fetched.size ?? file.size };
      } catch {
        hydrated[index] = file;
      }
      completed += 1;
      onProgress?.({ phase: "fetching", completed, total: files.length, currentPath: file.path });
    }
  };

  await Promise.all(Array.from({ length: Math.min(CONTENT_FETCH_CONCURRENCY, files.length) }, worker));
  return hydrated;
};

export const fetchRepositoryProject = async (
  repoUrl: string,
  onProgress?: IngestionProgressHandler
): Promise<Project> => {
  const { owner, repo } = parseGitHubUrl(repoUrl);
  const headers = getGitHubHeaders();

  onProgress?.({ phase: "metadata", completed: 0, total: 0 });
  const repoResponse = await fetch(`${GITHUB_API}/repos/${owner}/${repo}`, { headers });
  await handleGitHubError(repoResponse);
  const repoData = (await repoResponse.json()) as GitHubRepoResponse;

  onProgress?.({ phase: "tree", completed: 0, total: 0 });
  const treeResponse = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/trees/${repoData.default_branch}?recursive=1`, { headers });
  await handleGitHubError(treeResponse);
  const treePayload = await treeResponse.json();
  const tree = treePayload.tree as GitHubTreeItem[];

  const { included, excluded, totalCandidates } = partitionTreeFiles(tree);
  const selected = buildProjectFiles(included);
  onProgress?.({ phase: "fetching", completed: 0, total: selected.length });

  const files = await hydrateFileContents(owner, repo, repoData.default_branch, selected, onProgress);
  onProgress?.({ phase: "indexing", completed: files.length, total: files.length });

  const unreadable = files
    .filter((file) => !file.content)
    .map((file) => ({ path: file.path, reason: "Could not be read" }));
  const readableFiles = files.filter((file) => Boolean(file.content));

  return {
    summary: buildProjectSummary(repoData),
    files: readableFiles,
    ingestion: {
      totalCandidateFiles: totalCandidates,
      totalRepositoryFiles: tree.filter((item) => item.type === "blob").length,
      includedFiles: files.length,
      filesWithContent: readableFiles.length,
      treeTruncatedByGitHub: Boolean(treePayload.truncated),
      excluded: [...excluded, ...unreadable],
    },
  };
};

export const fetchFileContent = async (
  owner: string,
  repo: string,
  branch: string,
  path: string
): Promise<ProjectFile> => {
  if (!validateFilePath(path)) throw new Error("Invalid file path");

  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${encodedPath}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(rawUrl, { signal: controller.signal });
    if (!response.ok) {
      if (response.status === 404) throw new Error(`File not found: ${path}`);
      throw new Error(`Unable to load ${path}`);
    }

    const contentLength = response.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE) {
      throw new Error("File exceeds maximum size of 5MB");
    }

    const content = await response.text();
    if (content.length > MAX_FILE_SIZE) throw new Error("File content exceeds maximum size");

    return {
      path,
      language: inferLanguageFromFilename(path),
      rawUrl,
      size: content.length,
      content,
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timeout - file took too long to load");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};
