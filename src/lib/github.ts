import type { Project, ProjectFile, ProjectSummary, ExcludedFile } from "@/types/project";

const GITHUB_API = "https://api.github.com";

// The application reads public repositories only, so requests are unauthenticated.
const getGitHubHeaders = (): HeadersInit => ({
  'Accept': 'application/vnd.github.v3+json',
});

// Security limits
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES_TO_ANALYZE = 50;
const CONTENT_FETCH_CONCURRENCY = 6;

/**
 * Ingestion is multi-stage and, since contents are fetched up front, the slowest part of
 * the product. Progress is reported so the interface can show what is happening rather
 * than an unqualified spinner.
 */
export interface IngestionProgress {
  phase: "metadata" | "tree" | "fetching" | "indexing";
  completed: number;
  total: number;
  currentPath?: string;
}

export type IngestionProgressHandler = (progress: IngestionProgress) => void;
const MAX_REPO_NAME_LENGTH = 255;
const MAX_OWNER_NAME_LENGTH = 39;
const REQUEST_TIMEOUT = 10000; // 10 seconds

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

import { inferLanguageFromFilename } from "@/lib/languages";
import { ignoredDirectoryFor, isGeneratedFile } from "@/lib/ingestionFilters";

const CODE_FILE_PATTERN = /\.(js|ts|tsx|jsx|py|rs|rb|go|java|cs|php|swift|kt|m|c|cpp|h|hs|scala|sql|md|json|yml|yaml|html|css)$/i;

const validateGitHubIdentifier = (identifier: string, maxLength: number, type: string): string => {
  if (!identifier || identifier.length === 0) {
    throw new Error(`${type} cannot be empty`);
  }
  if (identifier.length > maxLength) {
    throw new Error(`${type} exceeds maximum length of ${maxLength}`);
  }
  // Repository names legitimately contain dots (vercel/next.js, socketio/socket.io), so
  // dots are permitted while "." and ".." are rejected outright to preclude traversal.
  if (identifier === "." || identifier === "..") {
    throw new Error(`${type} contains invalid characters`);
  }
  if (!/^[a-zA-Z0-9_.-]+$/.test(identifier)) {
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
    if (segments.length < 2) {
      throw new Error("GitHub URL must include owner and repository");
    }

    const owner = validateGitHubIdentifier(segments[0], MAX_OWNER_NAME_LENGTH, "Owner");
    const repo = validateGitHubIdentifier(segments[1], MAX_REPO_NAME_LENGTH, "Repository");

    return { owner, repo };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid GitHub URL";
    throw new Error(message);
  }
};

const handleGitHubError = async (response: Response) => {
  if (response.ok) {
    return;
  }
  if (response.status === 404) {
    throw new Error("Repository not found");
  }
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
  branch: repo.default_branch
});

const validateFilePath = (path: string): boolean => {
  let decoded: string;
  try {
    decoded = decodeURIComponent(path);
  } catch {
    return false;
  }
  if (
    !path ||
    path.includes("..") ||
    path.startsWith("/") ||
    path.includes("\\") ||
    decoded.includes("..") ||
    decoded.startsWith("/") ||
    Array.from(decoded).some((character) => {
      const codePoint = character.charCodeAt(0);
      return codePoint <= 31 || codePoint === 127;
    })
  ) {
    return false;
  }
  return true;
};

/**
 * Classifies every blob in the tree into the set that is indexed and the set that is not,
 * recording why each exclusion happened.
 *
 * The reasons are the ones the code actually applies — nothing is inferred or invented — so
 * the coverage figures the interface shows, and any statement made about them in the study,
 * are traceable to the filter that produced them.
 */
export const partitionTreeFiles = (items: GitHubTreeItem[]) => {
  const blobs = items.filter((item) => item.type === "blob");
  const analysable: GitHubTreeItem[] = [];
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
      analysable.push(item);
    }
  }

  const included = analysable.slice(0, MAX_FILES_TO_ANALYZE);
  for (const item of analysable.slice(MAX_FILES_TO_ANALYZE)) {
    excluded.push({ path: item.path, reason: `Over the ${MAX_FILES_TO_ANALYZE}-file limit` });
  }

  return { included, excluded, totalCandidates: analysable.length };
};

const buildProjectFiles = (items: GitHubTreeItem[]): ProjectFile[] =>
  items.map((item) => ({
    path: item.path,
    language: inferLanguageFromFilename(item.path),
    rawUrl: null,
    size: item.size ?? null,
    content: null,
  }));

/**
 * Fetches file contents with bounded concurrency.
 *
 * The search index is built from `file.content`, so a project whose files all carry
 * `content: null` produces an index over path tokens alone — retrieval then degrades to
 * filename matching and the RAG prompt is assembled with no evidence. Contents are
 * therefore hydrated during ingestion rather than lazily as the user opens files.
 *
 * A file that fails to load is returned here with `content: null` so the caller can record
 * the exclusion reason. It must be removed before the Project is returned: otherwise the
 * search index can retrieve it by filename even though no source was read.
 */
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

  // Concurrency is capped to stay well inside GitHub's rate limits and to avoid opening
  // fifty simultaneous connections from the browser.
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

  const files = await hydrateFileContents(
    owner,
    repo,
    repoData.default_branch,
    selected,
    onProgress
  );

  onProgress?.({ phase: "indexing", completed: files.length, total: files.length });

  // A file selected for indexing whose content could not be fetched is excluded in
  // practice, so it is recorded as such rather than counted as covered.
  const unreadable = files
    .filter((f) => !f.content)
    .map((f) => ({ path: f.path, reason: "Could not be read" }));
  const readableFiles = files.filter((f) => Boolean(f.content));

  return {
    summary: buildProjectSummary(repoData),
    files: readableFiles,
    ingestion: {
      totalCandidateFiles: totalCandidates,
      totalRepositoryFiles: tree.filter((i) => i.type === "blob").length,
      includedFiles: files.length,
      filesWithContent: readableFiles.length,
      treeTruncatedByGitHub: Boolean(treePayload.truncated),
      excluded: [...excluded, ...unreadable],
    },
  };
};

export const fetchFileContent = async (owner: string, repo: string, branch: string, path: string): Promise<ProjectFile> => {
  if (!validateFilePath(path)) {
    throw new Error("Invalid file path");
  }

  // Public repositories are served directly from raw.githubusercontent.com. This
  // endpoint needs no authentication and is not subject to the API's request
  // budget, which matters when ingestion fetches up to fifty files in a burst.
  const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(rawUrl, { signal: controller.signal });

    if (!response.ok) {
      if (response.status === 404) throw new Error(`File not found: ${path}`);
      throw new Error(`Unable to load ${path}`);
    }

    // Two size guards on purpose: the header check refuses oversized files
    // before downloading them, and the post-read check catches responses that
    // did not declare a length.
    const contentLength = response.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE) {
      throw new Error(`File exceeds maximum size of 5MB`);
    }

    const content = await response.text();
    if (content.length > MAX_FILE_SIZE) {
      throw new Error(`File content exceeds maximum size`);
    }

    return {
      path,
      language: inferLanguageFromFilename(path),
      rawUrl,
      size: content.length,
      content
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
