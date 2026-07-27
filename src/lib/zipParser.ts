import JSZip from "jszip";
import { ProjectFile } from "@/types/project";
import { inferLanguageFromFilename } from "@/lib/languages";
import { isInIgnoredDirectory } from "@/lib/ingestionFilters";

// Common text file extensions to include in the analysis
const TEXT_FILE_EXTENSIONS = [
  '.js', '.jsx', '.ts', '.tsx', '.json', '.html', '.css', '.scss', '.sass',
  '.py', '.java', '.cpp', '.c', '.h', '.cs', '.go', '.rs', '.rb', '.php',
  '.md', '.txt', '.xml', '.yml', '.yaml', '.toml', '.env', '.gitignore',
  '.sh', '.bash', '.sql', '.graphql', '.vue', '.svelte'
];

// Lockfiles carry no comprehension value and are large. Directory exclusions come from the
// shared ingestion filter, which matches whole path segments — the patterns here previously
// matched substrings, so "dist" excluded src/utils/distance.ts, "build" excluded
// src/lib/builder.ts, and ".git" excluded everything under .github/.
const IGNORED_FILENAMES = new Set([
  "package-lock.json",
  "bun.lockb",
  "yarn.lock",
  "pnpm-lock.yaml",
]);

/**
 * Parses a zipped project folder and returns ProjectFiles
 * @param file Zipped File object from file input
 * @returns Array of parsed project files
 */
export const parseZipFile = async (file: File): Promise<ProjectFile[]> => {
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(file);
  const projectFiles: ProjectFile[] = [];

  const filePromises = Object.entries(loadedZip.files).map(async ([path, zipEntry]) => {
    // Skip directories and check ignored directories/files
    if (zipEntry.dir) return;
    
    if (isInIgnoredDirectory(path)) return;
    if (IGNORED_FILENAMES.has(path.split("/").pop() ?? "")) return;

    const lowerPath = path.toLowerCase();
    const isTextFile = TEXT_FILE_EXTENSIONS.some(ext => lowerPath.endsWith(ext));
    if (!isTextFile) return;

    try {
      // Decompressed once and decoded, rather than decompressing twice to obtain a byte
      // length; the previous form doubled CPU and peak memory on large uploads.
      const bytes = await zipEntry.async("uint8array");
      const content = new TextDecoder().decode(bytes);

      projectFiles.push({
        path,
        language: inferLanguageFromFilename(path),
        content,
        size: bytes.length,
        rawUrl: null
      });
    } catch (err) {
      console.warn(`Failed to read ZIP file entry: ${path}`, err);
    }
  });

  await Promise.all(filePromises);
  
  // Sort files alphabetically by path for consistent navigation
  return projectFiles.sort((a, b) => a.path.localeCompare(b.path));
};
