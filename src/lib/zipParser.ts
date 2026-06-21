import JSZip from "jszip";
import { ProjectFile } from "@/types/project";
import { inferLanguageFromFilename } from "@/lib/languages";

// Common text file extensions to include in the analysis
const TEXT_FILE_EXTENSIONS = [
  '.js', '.jsx', '.ts', '.tsx', '.json', '.html', '.css', '.scss', '.sass',
  '.py', '.java', '.cpp', '.c', '.h', '.cs', '.go', '.rs', '.rb', '.php',
  '.md', '.txt', '.xml', '.yml', '.yaml', '.toml', '.env', '.gitignore',
  '.sh', '.bash', '.sql', '.graphql', '.vue', '.svelte'
];

// Folders/files to exclude from extraction
const IGNORED_PATTERNS = [
  /node_modules/i,
  /\.git/i,
  /dist/i,
  /build/i,
  /\.next/i,
  /\.vercel/i,
  /package-lock\.json/i,
  /bun\.lockb/i,
  /yarn\.lock/i,
  /\.npm-cache/i,
  /\.gemini/i
];

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
    
    const isIgnored = IGNORED_PATTERNS.some(pattern => pattern.test(path));
    if (isIgnored) return;

    const lowerPath = path.toLowerCase();
    const isTextFile = TEXT_FILE_EXTENSIONS.some(ext => lowerPath.endsWith(ext));
    if (!isTextFile) return;

    try {
      const content = await zipEntry.async("string");
      const uint8Array = await zipEntry.async("uint8array");
      
      projectFiles.push({
        path,
        language: inferLanguageFromFilename(path),
        content,
        size: uint8Array.length,
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
