import { ProjectFile } from "@/types/project";

// Standard programming syntax keywords and common English stopwords to exclude
const STOPWORDS = new Set([
  // Programming keywords
  "const", "let", "var", "import",
  "return", "async", "await", "try", "catch", "finally", "if", "else", "for",
  "while", "do", "switch", "case", "break", "continue", "null", "undefined",
  "true", "false", "this", "super", "new", "throw", "typeof", "instanceof",
  "extends", "implements", "package", "private", "protected",
  "public", "yield", "from", "as",
  // "api", "router" and "route" were previously listed here. They are domain terms, not
  // language keywords: the query "api router" tokenised to nothing, retrieval returned no
  // matches, and the question was then sent to the model with no repository context.
  // Their discriminative power is already handled by IDF.
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
  const readableFiles = files.filter((file) => file.content !== null && file.content !== undefined);
  const totalDocs = readableFiles.length;

  // 1. Tokenize files and count document frequencies
  readableFiles.forEach(file => {
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
  //
  // Smoothed IDF: log((N + 1) / (df + 1)) + 1. The unsmoothed log(N / df) it replaces
  // assigned zero weight to any term present in every document, and produced an entirely
  // zero index for a single-document corpus, every query then returned no results with
  // no error. The trailing +1 keeps weights strictly positive so a term common to all
  // documents still contributes to ranking rather than being discarded.
  const idf: Record<string, number> = {};
  Object.entries(df).forEach(([token, count]) => {
    idf[token] = Math.log((totalDocs + 1) / (count + 1)) + 1;
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

/**
 * A contiguous region of a file selected as evidence for a question.
 *
 * Line numbers are 1-based and inclusive, matching what an editor shows, so a citation can
 * be checked against the file directly.
 */
export interface ExcerptRegion {
  text: string;
  startLine: number;
  endLine: number;
  totalLines: number;
  /** Lines of the file not included in this excerpt, and therefore never seen by the model. */
  omittedLines: number;
  /** Characters of the file not included, including a truncated portion of a cited line. */
  omittedCharacters: number;
}

/**
 * Selects the region of a file most relevant to a query.
 *
 * Retrieval ranks whole files, but only a bounded excerpt is sent to the model. Taking the
 * head of the file is cheap and was what this previously did, but for any file longer than
 * the budget it usually sends imports and licence headers rather than the code the question
 * is about, and the interface would then cite lines the model never saw.
 *
 * A fixed-size window is slid over the file and scored by how many distinct query terms it
 * contains, with total occurrences breaking ties. Distinct-term coverage is preferred over
 * raw frequency so a region mentioning several query terms once beats one repeating a
 * single common term. Ties resolve to the earliest region, which keeps output stable for a
 * given file and query, a requirement for reproducing a study run.
 */
export function selectExcerptRegion(
  content: string,
  query: string,
  maxChars: number
): ExcerptRegion {
  const lines = content.split("\n");
  const totalLines = lines.length;

  const windowFrom = (start: number) => {
    const parts: string[] = [];
    let used = 0;
    let end = start;

    while (end < totalLines && used < maxChars) {
      const separator = end > start ? "\n" : "";
      const available = maxChars - used - separator.length;
      if (available <= 0) break;

      const piece = lines[end].slice(0, available);
      parts.push(separator + piece);
      used += separator.length + piece.length;
      end += 1;

      // The rest of this line is outside the budget. Do not score it and then silently
      // slice it away: that can select an excerpt whose only match is never emitted.
      if (piece.length < lines[end - 1].length) break;
    }

    const text = parts.join("");
    return {
      text,
      start,
      end,
      omittedCharacters: Math.max(content.length - text.length, 0),
    };
  };

  const head = (): ExcerptRegion => {
    const window = windowFrom(0);
    const includedLines = Math.max(window.end - window.start, 1);
    return {
      text: window.text,
      startLine: 1,
      endLine: includedLines,
      totalLines,
      omittedLines: Math.max(totalLines - includedLines, 0),
      omittedCharacters: window.omittedCharacters,
    };
  };

  if (content.length <= maxChars) {
    return {
      text: content,
      startLine: 1,
      endLine: totalLines,
      totalLines,
      omittedLines: 0,
      omittedCharacters: 0,
    };
  }

  const queryTerms = new Set(tokenize(query));
  if (queryTerms.size === 0) return head();

  let bestStart = 0;
  let bestEnd = 0; // exclusive
  let bestDistinct = -1;
  let bestOccurrences = -1;

  // Each candidate window is grown to the character budget and scored exactly as it will be
  // emitted, so the region that wins is the region that is sent and cited. Scoring a larger
  // window and trimming it afterwards can discard the match that selected it.
  for (let start = 0; start < totalLines; start++) {
    const window = windowFrom(start);
    const distinct = new Set<string>();
    let occurrences = 0;

    for (const token of tokenize(window.text)) {
      if (queryTerms.has(token)) {
        distinct.add(token);
        occurrences += 1;
      }
    }

    if (distinct.size > bestDistinct || (distinct.size === bestDistinct && occurrences > bestOccurrences)) {
      bestDistinct = distinct.size;
      bestOccurrences = occurrences;
      bestStart = start;
      bestEnd = window.end;
    }

    if (window.end >= totalLines) break;
  }

  // No query term occurs anywhere in the file: the head is as defensible as any other region.
  if (bestDistinct <= 0) return head();

  const best = windowFrom(bestStart);
  const includedLines = Math.max(bestEnd - bestStart, 1);

  return {
    text: best.text,
    startLine: bestStart + 1,
    endLine: bestEnd,
    totalLines,
    omittedLines: Math.max(totalLines - includedLines, 0),
    omittedCharacters: best.omittedCharacters,
  };
}
