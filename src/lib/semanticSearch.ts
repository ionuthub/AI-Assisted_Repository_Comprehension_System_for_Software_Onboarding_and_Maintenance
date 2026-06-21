import { ProjectFile } from "@/types/project";

// Standard programming syntax keywords and common English stopwords to exclude
const STOPWORDS = new Set([
  // Programming keywords
  "const", "let", "var", "function", "class", "export", "import", "default",
  "return", "async", "await", "try", "catch", "finally", "if", "else", "for",
  "while", "do", "switch", "case", "break", "continue", "null", "undefined",
  "true", "false", "this", "super", "new", "throw", "typeof", "instanceof",
  "extends", "implements", "interface", "package", "private", "protected",
  "public", "static", "yield", "from", "as", "api", "router", "route",
  // Common English words
  "the", "is", "at", "which", "on", "in", "to", "for", "with", "a", "an", "and",
  "or", "not", "that", "this", "these", "those", "it", "its", "of", "by", "from"
]);

export interface SearchIndex {
  docVectors: Record<string, Record<string, number>>; // file path -> { word -> tfIdfWeight }
  idf: Record<string, number>;                         // word -> idfWeight
  magnitudes: Record<string, number>;                  // file path -> vector magnitude
}

export interface SearchResult {
  path: string;
  score: number;
  language: string | null;
  size: number | null;
}

/**
 * Tokenizes a text string into individual lowercase terms.
 * Splits camelCase, PascalCase, and snake_case tokens.
 */
export function tokenize(text: string): string[] {
  if (!text) return [];

  // Replace punctuation and symbols with spaces
  const cleaned = text.replace(/[^a-zA-Z0-9_$]/g, " ");

  // Split by space
  const rawTokens = cleaned.split(/\s+/);
  const resultTokens: string[] = [];

  rawTokens.forEach(token => {
    if (!token) return;

    // Split snake_case / kebab-case
    const subTokens = token.split(/[_$]/);

    subTokens.forEach(subToken => {
      if (!subToken) return;

      // Split camelCase / PascalCase
      // Matches letters followed by uppercase letters
      const camelSplits = subToken.replace(/([a-z0-9])([A-Z])/g, "$1 $2").split(" ");

      camelSplits.forEach(word => {
        const lower = word.toLowerCase();
        if (lower.length > 1 && !STOPWORDS.has(lower)) {
          resultTokens.push(lower);
        }
      });
    });
  });

  return resultTokens;
}

/**
 * Compiles a TF-IDF index for the given project files.
 */
export const buildSearchIndex = (files: ProjectFile[]): SearchIndex => {
  const docTokens: Record<string, string[]> = {};
  const df: Record<string, number> = {};
  const totalDocs = files.length;

  // 1. Tokenize files and count document frequencies
  files.forEach(file => {
    // Index file content and file path name (path contains valuable context!)
    const fileContent = file.content || "";
    const pathContent = file.path.replace(/\//g, " ");
    const tokens = tokenize(`${pathContent} ${pathContent} ${fileContent}`); // Weight filename higher

    docTokens[file.path] = tokens;

    const uniqueTokens = new Set(tokens);
    uniqueTokens.forEach(token => {
      df[token] = (df[token] || 0) + 1;
    });
  });

  // 2. Compute Inverse Document Frequencies (IDF)
  const idf: Record<string, number> = {};
  Object.entries(df).forEach(([token, count]) => {
    // Standard IDF formula with smoothing to avoid division by zero
    idf[token] = Math.log(totalDocs / count);
  });

  // 3. Compute TF-IDF vectors for documents
  const docVectors: Record<string, Record<string, number>> = {};
  const magnitudes: Record<string, number> = {};

  Object.entries(docTokens).forEach(([filePath, tokens]) => {
    const vector: Record<string, number> = {};
    const tfCounts: Record<string, number> = {};

    tokens.forEach(token => {
      tfCounts[token] = (tfCounts[token] || 0) + 1;
    });

    const totalTokens = tokens.length || 1;
    let sumSquares = 0;

    Object.entries(tfCounts).forEach(([token, count]) => {
      const tf = count / totalTokens;
      const tfIdf = tf * (idf[token] || 0);
      vector[token] = tfIdf;
      sumSquares += tfIdf * tfIdf;
    });

    docVectors[filePath] = vector;
    magnitudes[filePath] = Math.sqrt(sumSquares) || 1;
  });

  return {
    docVectors,
    idf,
    magnitudes
  };
};

/**
 * Ranks project files against a search query using Cosine Similarity.
 */
export const searchRepository = (
  query: string,
  index: SearchIndex,
  files: ProjectFile[],
  limit = 10
): SearchResult[] => {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0 || files.length === 0) return [];

  // Compute query term frequencies
  const queryTf: Record<string, number> = {};
  queryTokens.forEach(token => {
    queryTf[token] = (queryTf[token] || 0) + 1;
  });

  // Build query TF-IDF vector
  const queryVector: Record<string, number> = {};
  let querySumSquares = 0;

  Object.entries(queryTf).forEach(([token, count]) => {
    const tf = count / queryTokens.length;
    // Reuse index IDF
    const tfIdf = tf * (index.idf[token] || 0);
    queryVector[token] = tfIdf;
    querySumSquares += tfIdf * tfIdf;
  });

  const queryMagnitude = Math.sqrt(querySumSquares);
  if (queryMagnitude === 0) return [];

  const results: SearchResult[] = [];

  // Compute Cosine Similarity for each file
  files.forEach(file => {
    const docVector = index.docVectors[file.path];
    const docMagnitude = index.magnitudes[file.path];

    if (!docVector || !docMagnitude) return;

    let dotProduct = 0;

    // Dot product only over query terms
    Object.keys(queryVector).forEach(token => {
      if (docVector[token]) {
        dotProduct += queryVector[token] * docVector[token];
      }
    });

    const similarity = dotProduct / (queryMagnitude * docMagnitude);

    if (similarity > 0) {
      results.push({
        path: file.path,
        score: similarity,
        language: file.language || null,
        size: file.size || null
      });
    }
  });

  // Sort by score descending and return limited results
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};
