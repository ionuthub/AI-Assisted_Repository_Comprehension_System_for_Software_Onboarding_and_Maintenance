export interface FunctionDeclaration {
  name: string;
  isAsync: boolean;
  parameters: string[];
}

export interface FileAnalysisResult {
  path: string;
  imports: { name: string; source: string; resolvedPath: string | null }[];
  exports: string[];
  functions: FunctionDeclaration[];
  components: string[];
  classes: string[];
  isApiRoute: boolean;
  usedBy: string[]; // Paths of other files that import this file
}

/**
 * Resolves an import source string (e.g. "./CourseCard" or "@/components/Button")
 * to its absolute workspace target file path, if it exists in the project.
 */
export function resolveImportPath(
  importerPath: string,
  source: string,
  allFilePaths: string[]
): string | null {
  let resolvedBase = "";

  if (source.startsWith(".")) {
    // Resolve relative path
    const importerParts = importerPath.split("/");
    importerParts.pop(); // Remove the filename to get current directory
    const sourceParts = source.split("/");

    const resolvedParts = [...importerParts];
    for (const part of sourceParts) {
      if (part === "" || part === ".") continue;
      if (part === "..") {
        resolvedParts.pop();
      } else {
        resolvedParts.push(part);
      }
    }
    resolvedBase = resolvedParts.join("/");
  } else if (source.startsWith("@/")) {
    // Resolve TS path alias (pointing to src/)
    resolvedBase = source.replace(/^@\//, "src/");
  } else {
    // Third party dependency (node_modules)
    return null;
  }

  // Try to match the resolvedBase to an actual file in the project
  // Handles extensionless imports (e.g. import X from './utils' -> utils.ts / utils.tsx)
  const matchedPath = allFilePaths.find((f) => {
    const fWithoutExt = f.replace(/\.[^/.]+$/, "");
    return (
      f === resolvedBase ||
      fWithoutExt === resolvedBase ||
      f === `${resolvedBase}/index.ts` ||
      f === `${resolvedBase}/index.tsx` ||
      f === `${resolvedBase}/index.js` ||
      f === `${resolvedBase}/index.jsx`
    );
  });

  return matchedPath || null;
}

/**
 * Parses imports from JS/TS code content
 */
function parseImports(content: string, filePath: string, allFilePaths: string[]) {
  const imports: FileAnalysisResult["imports"] = [];
  const lines = content.split(/\r?\n/);

  // Regex matches:
  // 1. import { X, Y } from 'Z'
  // 2. import X from 'Z'
  // 3. import * as X from 'Z'
  // 4. import 'Z'
  const importRegex = /import\s+([\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g;
  const sideEffectRegex = /import\s+['"]([^'"]+)['"]/g;
  const requireRegex = /(?:const|let|var)\s+(?:\{([^}]+)\}|\w+)\s*=\s*require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

  // Process ES6 imports
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const rawEntities = match[1].trim();
    const source = match[2];
    const resolvedPath = resolveImportPath(filePath, source, allFilePaths);

    // Clean up entity names (e.g. "{ Button, Input } as Comp" -> "Button, Input")
    let entitiesName = rawEntities
      .replace(/[{}]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (entitiesName.includes(" as ")) {
      entitiesName = entitiesName.split(" as ").pop() || entitiesName;
    }

    imports.push({
      name: entitiesName || "*",
      source,
      resolvedPath
    });
  }

  // Process side-effect imports
  let seMatch;
  while ((seMatch = sideEffectRegex.exec(content)) !== null) {
    const source = seMatch[1];
    // Avoid double counting
    if (imports.some(i => i.source === source)) continue;

    const resolvedPath = resolveImportPath(filePath, source, allFilePaths);
    imports.push({
      name: "*",
      source,
      resolvedPath
    });
  }

  // Process CommonJS requires
  let reqMatch;
  while ((reqMatch = requireRegex.exec(content)) !== null) {
    const entities = reqMatch[1] ? reqMatch[1].trim() : "*";
    const source = reqMatch[2];
    const resolvedPath = resolveImportPath(filePath, source, allFilePaths);

    imports.push({
      name: entities,
      source,
      resolvedPath
    });
  }

  return imports;
}

/**
 * Parses exports from JS/TS code content
 */
function parseExports(content: string): string[] {
  const exports: string[] = [];

  // Match named exports
  const exportConstLetRegex = /export\s+(?:const|let|var)\s+(\w+)/g;
  const exportFuncRegex = /export\s+(?:async\s+)?function\s+(\w+)/g;
  const exportClassRegex = /export\s+class\s+(\w+)/g;
  const exportDefaultRegex = /export\s+default\s+(?:(?:async\s+)?function\s+(\w+)|(?:class\s+)?(\w+)|(\w+))/g;
  const exportListRegex = /export\s*\{\s*([^}]+)\s*\}/g;

  let match;
  while ((match = exportConstLetRegex.exec(content)) !== null) {
    exports.push(match[1]);
  }

  while ((match = exportFuncRegex.exec(content)) !== null) {
    exports.push(match[1]);
  }

  while ((match = exportClassRegex.exec(content)) !== null) {
    exports.push(match[1]);
  }

  while ((match = exportDefaultRegex.exec(content)) !== null) {
    const name = match[1] || match[2] || match[3] || "default";
    exports.push(`${name} (default)`);
  }

  while ((match = exportListRegex.exec(content)) !== null) {
    const items = match[1]
      .split(",")
      .map(item => item.trim().split(" as ").pop()!.trim())
      .filter(Boolean);
    exports.push(...items);
  }

  return Array.from(new Set(exports));
}

/**
 * Parses functions, React components, and classes
 */
function parseStructures(content: string, isJsxOrTsx: boolean) {
  const functions: FunctionDeclaration[] = [];
  const components: string[] = [];
  const classes: string[] = [];

  // 1. Match traditional functions: function name(params) {}
  const funcRegex = /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/g;
  let match;
  while ((match = funcRegex.exec(content)) !== null) {
    const name = match[1];
    const isAsync = match[0].includes("async");
    const parameters = match[2].split(",").map(p => p.trim()).filter(Boolean);

    functions.push({ name, isAsync, parameters });

    // Is it a React component? (Starts with Capital Letter, inside a JSX/TSX environment)
    if (isJsxOrTsx && /^[A-Z]/.test(name)) {
      components.push(name);
    }
  }

  // 2. Match arrow functions: const name = (params) => {}
  const arrowRegex = /(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>/g;
  while ((match = arrowRegex.exec(content)) !== null) {
    const name = match[1];
    const isAsync = match[0].includes("async");
    const parameters = match[2].split(",").map(p => p.trim()).filter(Boolean);

    functions.push({ name, isAsync, parameters });

    if (isJsxOrTsx && /^[A-Z]/.test(name)) {
      components.push(name);
    }
  }

  // 3. Match class structures
  const classRegex = /(?:export\s+)?class\s+(\w+)/g;
  while ((match = classRegex.exec(content)) !== null) {
    classes.push(match[1]);
  }

  return {
    functions: functions.filter((f, idx, self) => self.findIndex(t => t.name === f.name) === idx),
    components: Array.from(new Set(components)),
    classes: Array.from(new Set(classes))
  };
}

/**
 * Performs complete static analysis on a file
 */
export const analyzeCodeFile = (
  filePath: string,
  content: string,
  allFilePaths: string[]
): FileAnalysisResult => {
  const isJsxOrTsx = /\.(jsx|tsx)$/i.test(filePath);
  const isApiRoute =
    /pages\/api\//i.test(filePath) ||
    /app\/api\//i.test(filePath) ||
    /api\//i.test(filePath) ||
    (filePath.includes("route.") && isJsxOrTsx);

  const imports = parseImports(content, filePath, allFilePaths);
  const exports = parseExports(content);
  const { functions, components, classes } = parseStructures(content, isJsxOrTsx);

  return {
    path: filePath,
    imports,
    exports,
    functions,
    components,
    classes,
    isApiRoute,
    usedBy: [] // Will be populated dynamically after scanning the workspace
  };
};

/**
 * Populates the "usedBy" references for all analyzed files in a project
 */
export const computeWorkspaceReferences = (
  analyses: Record<string, FileAnalysisResult>
): Record<string, FileAnalysisResult> => {
  // Reset references
  Object.keys(analyses).forEach(key => {
    analyses[key].usedBy = [];
  });

  // Calculate references
  Object.values(analyses).forEach((fileAnalysis) => {
    fileAnalysis.imports.forEach((imp) => {
      if (imp.resolvedPath && analyses[imp.resolvedPath]) {
        // The resolved file is imported by this file
        if (!analyses[imp.resolvedPath].usedBy.includes(fileAnalysis.path)) {
          analyses[imp.resolvedPath].usedBy.push(fileAnalysis.path);
        }
      }
    });
  });

  return analyses;
};
