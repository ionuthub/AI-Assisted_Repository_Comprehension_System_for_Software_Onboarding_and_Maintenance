/**
 * Smart Code Block Detector
 * 
 * Detects logical code blocks (functions, conditionals, loops, classes, etc.)
 * and returns the line range for the complete block.
 */

export interface CodeBlock {
  startLine: number;
  endLine: number;
  type: "function" | "class" | "conditional" | "loop" | "try_catch" | "object" | "array" | "line";
  description: string;
}

/**
 * Detects the logical code block containing the given line
 * Returns the start and end line numbers of the block
 */
export const detectCodeBlock = (
  content: string,
  lineNumber: number
): CodeBlock => {
  const lines = content.split(/\r?\n/);
  const targetLine = lines[lineNumber - 1]?.trim() || "";

  // Start by checking what type of block this line belongs to
  if (isFunctionStart(targetLine)) {
    return findFunctionBlock(lines, lineNumber - 1);
  }

  if (isClassStart(targetLine)) {
    return findClassBlock(lines, lineNumber - 1);
  }

  if (isConditionalStart(targetLine)) {
    return findConditionalBlock(lines, lineNumber - 1);
  }

  if (isLoopStart(targetLine)) {
    return findLoopBlock(lines, lineNumber - 1);
  }

  if (isTryStart(targetLine)) {
    return findTryCatchBlock(lines, lineNumber - 1);
  }

  if (isObjectStart(targetLine)) {
    return findObjectBlock(lines, lineNumber - 1);
  }

  if (isArrayStart(targetLine)) {
    return findArrayBlock(lines, lineNumber - 1);
  }

  // If line is inside a block, find the parent block
  const parentBlock = findParentBlock(lines, lineNumber - 1);
  if (parentBlock) {
    return parentBlock;
  }

  // Default: return just this line
  return {
    startLine: lineNumber,
    endLine: lineNumber,
    type: "line",
    description: `Line ${lineNumber}`
  };
};

// ============================================================================
// BLOCK START DETECTION
// ============================================================================

const isFunctionStart = (line: string): boolean => {
  return (
    /^(async\s+)?function\s+\w+/.test(line) ||
    /^const\s+\w+\s*=\s*\(.*\)\s*=>/.test(line) ||
    /^const\s+\w+\s*=\s*async\s*\(.*\)\s*=>/.test(line) ||
    /^let\s+\w+\s*=\s*\(.*\)\s*=>/.test(line) ||
    /^(public|private|protected)?\s*(async\s+)?\w+\s*\(.*\)\s*[:{]/.test(line)
  );
};

const isClassStart = (line: string): boolean => {
  return /^(export\s+)?(abstract\s+)?class\s+\w+/.test(line);
};

const isConditionalStart = (line: string): boolean => {
  return /^(if|else\s+if|else)\s*\(/.test(line) || /^else\s*[:{]/.test(line);
};

const isLoopStart = (line: string): boolean => {
  return /^(for|while|do)\s*[\({]/.test(line) || /^for\s+\(/.test(line);
};

const isTryStart = (line: string): boolean => {
  return /^try\s*[:{]/.test(line);
};

const isObjectStart = (line: string): boolean => {
  return /^(const|let|var)\s+\w+\s*=\s*\{/.test(line) || /^\w+:\s*\{/.test(line);
};

const isArrayStart = (line: string): boolean => {
  return /^(const|let|var)\s+\w+\s*=\s*\[/.test(line);
};

// ============================================================================
// BLOCK FINDING FUNCTIONS
// ============================================================================

const findFunctionBlock = (lines: string[], startIdx: number): CodeBlock => {
  // Find the line with the opening brace
  let openBraceIdx = startIdx;
  for (let i = startIdx; i < lines.length; i++) {
    if (lines[i].includes("{")) {
      openBraceIdx = i;
      break;
    }
  }

  const startLine = openBraceIdx + 1;
  let braceCount = 0;
  let foundBrace = false;

  for (let i = openBraceIdx; i < lines.length; i++) {
    const line = lines[i];
    braceCount += (line.match(/{/g) || []).length;
    braceCount -= (line.match(/}/g) || []).length;

    if (braceCount > 0) {
      foundBrace = true;
    }

    if (foundBrace && braceCount === 0) {
      return {
        startLine,
        endLine: i + 1,
        type: "function",
        description: `Function (lines ${startLine}-${i + 1})`
      };
    }
  }

  return {
    startLine,
    endLine: lines.length,
    type: "function",
    description: `Function (lines ${startLine}-${lines.length})`
  };
};

const findClassBlock = (lines: string[], startIdx: number): CodeBlock => {
  // Find the line with the opening brace
  let openBraceIdx = startIdx;
  for (let i = startIdx; i < lines.length; i++) {
    if (lines[i].includes("{")) {
      openBraceIdx = i;
      break;
    }
  }

  const startLine = openBraceIdx + 1;
  let braceCount = 0;
  let foundBrace = false;

  for (let i = openBraceIdx; i < lines.length; i++) {
    const line = lines[i];
    braceCount += (line.match(/{/g) || []).length;
    braceCount -= (line.match(/}/g) || []).length;

    if (braceCount > 0) {
      foundBrace = true;
    }

    if (foundBrace && braceCount === 0) {
      return {
        startLine,
        endLine: i + 1,
        type: "class",
        description: `Class (lines ${startLine}-${i + 1})`
      };
    }
  }

  return {
    startLine,
    endLine: lines.length,
    type: "class",
    description: `Class (lines ${startLine}-${lines.length})`
  };
};

const findConditionalBlock = (lines: string[], startIdx: number): CodeBlock => {
  // Find the line with the opening brace
  let openBraceIdx = startIdx;
  for (let i = startIdx; i < lines.length; i++) {
    if (lines[i].includes("{")) {
      openBraceIdx = i;
      break;
    }
  }

  const startLine = openBraceIdx + 1;
  let braceCount = 0;
  let foundBrace = false;

  for (let i = openBraceIdx; i < lines.length; i++) {
    const line = lines[i];
    braceCount += (line.match(/{/g) || []).length;
    braceCount -= (line.match(/}/g) || []).length;

    if (braceCount > 0) {
      foundBrace = true;
    }

    if (foundBrace && braceCount === 0) {
      // Check if there's an else or else if following
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (/^else\s*if\s*\(/.test(nextLine) || /^else\s*[:{]/.test(nextLine)) {
          // Recursively find the else block
          const elseBlock = findConditionalBlock(lines, i + 1);
          return {
            startLine,
            endLine: elseBlock.endLine,
            type: "conditional",
            description: `Conditional (lines ${startLine}-${elseBlock.endLine})`
          };
        }
      }

      return {
        startLine,
        endLine: i + 1,
        type: "conditional",
        description: `Conditional (lines ${startLine}-${i + 1})`
      };
    }
  }

  return {
    startLine,
    endLine: lines.length,
    type: "conditional",
    description: `Conditional (lines ${startLine}-${lines.length})`
  };
};

const findLoopBlock = (lines: string[], startIdx: number): CodeBlock => {
  // Find the line with the opening brace
  let openBraceIdx = startIdx;
  for (let i = startIdx; i < lines.length; i++) {
    if (lines[i].includes("{")) {
      openBraceIdx = i;
      break;
    }
  }

  const startLine = openBraceIdx + 1;
  let braceCount = 0;
  let foundBrace = false;

  for (let i = openBraceIdx; i < lines.length; i++) {
    const line = lines[i];
    braceCount += (line.match(/{/g) || []).length;
    braceCount -= (line.match(/}/g) || []).length;

    if (braceCount > 0) {
      foundBrace = true;
    }

    if (foundBrace && braceCount === 0) {
      return {
        startLine,
        endLine: i + 1,
        type: "loop",
        description: `Loop (lines ${startLine}-${i + 1})`
      };
    }
  }

  return {
    startLine,
    endLine: lines.length,
    type: "loop",
    description: `Loop (lines ${startLine}-${lines.length})`
  };
};

const findTryCatchBlock = (lines: string[], startIdx: number): CodeBlock => {
  // Find the line with the opening brace
  let openBraceIdx = startIdx;
  for (let i = startIdx; i < lines.length; i++) {
    if (lines[i].includes("{")) {
      openBraceIdx = i;
      break;
    }
  }

  const startLine = openBraceIdx + 1;
  let braceCount = 0;
  let foundBrace = false;
  let endIdx = openBraceIdx;

  // Find the try block
  for (let i = openBraceIdx; i < lines.length; i++) {
    const line = lines[i];
    braceCount += (line.match(/{/g) || []).length;
    braceCount -= (line.match(/}/g) || []).length;

    if (braceCount > 0) {
      foundBrace = true;
    }

    if (foundBrace && braceCount === 0) {
      endIdx = i;
      break;
    }
  }

  // Check for catch and finally blocks
  if (endIdx + 1 < lines.length) {
    const nextLine = lines[endIdx + 1].trim();
    if (/^catch\s*\(/.test(nextLine) || /^finally\s*[:{]/.test(nextLine)) {
      const catchBlock = findTryCatchBlock(lines, endIdx + 1);
      return {
        startLine,
        endLine: catchBlock.endLine,
        type: "try_catch",
        description: `Try-Catch (lines ${startLine}-${catchBlock.endLine})`
      };
    }
  }

  return {
    startLine,
    endLine: endIdx + 1,
    type: "try_catch",
    description: `Try-Catch (lines ${startLine}-${endIdx + 1})`
  };
};

const findObjectBlock = (lines: string[], startIdx: number): CodeBlock => {
  // Find the line with the opening brace
  let openBraceIdx = startIdx;
  for (let i = startIdx; i < lines.length; i++) {
    if (lines[i].includes("{")) {
      openBraceIdx = i;
      break;
    }
  }

  const startLine = openBraceIdx + 1;
  let braceCount = 0;
  let foundBrace = false;

  for (let i = openBraceIdx; i < lines.length; i++) {
    const line = lines[i];
    braceCount += (line.match(/{/g) || []).length;
    braceCount -= (line.match(/}/g) || []).length;

    if (braceCount > 0) {
      foundBrace = true;
    }

    if (foundBrace && braceCount === 0) {
      return {
        startLine,
        endLine: i + 1,
        type: "object",
        description: `Object (lines ${startLine}-${i + 1})`
      };
    }
  }

  return {
    startLine,
    endLine: lines.length,
    type: "object",
    description: `Object (lines ${startLine}-${lines.length})`
  };
};

const findArrayBlock = (lines: string[], startIdx: number): CodeBlock => {
  // Find the line with the opening bracket
  let openBracketIdx = startIdx;
  for (let i = startIdx; i < lines.length; i++) {
    if (lines[i].includes("[")) {
      openBracketIdx = i;
      break;
    }
  }

  const startLine = openBracketIdx + 1;
  let bracketCount = 0;
  let foundBracket = false;

  for (let i = openBracketIdx; i < lines.length; i++) {
    const line = lines[i];
    bracketCount += (line.match(/\[/g) || []).length;
    bracketCount -= (line.match(/\]/g) || []).length;

    if (bracketCount > 0) {
      foundBracket = true;
    }

    if (foundBracket && bracketCount === 0) {
      return {
        startLine,
        endLine: i + 1,
        type: "array",
        description: `Array (lines ${startLine}-${i + 1})`
      };
    }
  }

  return {
    startLine,
    endLine: lines.length,
    type: "array",
    description: `Array (lines ${startLine}-${lines.length})`
  };
};

// ============================================================================
// PARENT BLOCK DETECTION
// ============================================================================

const findParentBlock = (lines: string[], lineIdx: number): CodeBlock | null => {
  // Look backwards to find an opening brace
  let braceCount = 0;

  for (let i = lineIdx; i >= 0; i--) {
    const line = lines[i];
    braceCount -= (line.match(/{/g) || []).length;
    braceCount += (line.match(/}/g) || []).length;

    if (braceCount > 0) {
      // Found an unmatched opening brace, now find its start
      for (let j = i; j >= 0; j--) {
        const checkLine = lines[j].trim();
        if (
          isFunctionStart(checkLine) ||
          isClassStart(checkLine) ||
          isConditionalStart(checkLine) ||
          isLoopStart(checkLine) ||
          isTryStart(checkLine) ||
          isObjectStart(checkLine)
        ) {
          // Found the block start, now find its end
          if (isFunctionStart(checkLine)) {
            return findFunctionBlock(lines, j);
          }
          if (isClassStart(checkLine)) {
            return findClassBlock(lines, j);
          }
          if (isConditionalStart(checkLine)) {
            return findConditionalBlock(lines, j);
          }
          if (isLoopStart(checkLine)) {
            return findLoopBlock(lines, j);
          }
          if (isTryStart(checkLine)) {
            return findTryCatchBlock(lines, j);
          }
          if (isObjectStart(checkLine)) {
            return findObjectBlock(lines, j);
          }
        }
      }
      break;
    }
  }

  return null;
};
