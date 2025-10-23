export type ComplexityLevel = "simple" | "medium" | "complex";

export interface LineComplexity {
  line: number;
  complexity: ComplexityLevel;
  reason: string;
}

const SIMPLE_PATTERNS = [
  /^\/\//, // Comments
  /^\/\*/, // Block comments
  /^import\s+/, // Imports
  /^export\s+/, // Exports
  /^const\s+\w+\s*=\s*['"0-9]/, // Simple assignments
  /^let\s+\w+\s*=\s*['"0-9]/, // Simple assignments
  /^return\s+['"0-9\w]/, // Simple returns
  /^\}/, // Closing braces
  /^\{/, // Opening braces
  /^else/, // Else statements
  /^break/, // Break statements
  /^continue/, // Continue statements
];

const COMPLEX_PATTERNS = [
  /\?\s*.*\s*:/, // Ternary operators
  /async\s+/, // Async functions
  /await\s+/, // Await
  /try\s*\{/, // Try blocks
  /catch\s*\(/, // Catch blocks
  /finally\s*\{/, // Finally blocks
  /Promise/, // Promises
  /\.then\(/, // Promise chains
  /\.catch\(/, // Error handling
  /reduce\(/, // Array reduce
  /recursion|recursive/, // Recursion
  /\[.*\]\.map\(/, // Complex array operations
  /\[.*\]\.filter\(/, // Complex filtering
  /switch\s*\(/, // Switch statements
  /&&|\|\|/, // Logical operators (complex conditions)
  /\?\?/, // Nullish coalescing
  /\.\.\./, // Spread operator
  /destructur/, // Destructuring
  /class\s+/, // Classes
  /extends\s+/, // Inheritance
  /interface\s+/, // Interfaces
  /type\s+/, // Type definitions
  /generic|<.*>/, // Generics
];

const MEDIUM_PATTERNS = [
  /^if\s*\(/, // If statements
  /^for\s*\(/, // For loops
  /^while\s*\(/, // While loops
  /^function\s+/, // Function declarations
  /=>\s*\{/, // Arrow functions with body
  /\.map\(/, // Map operations
  /\.filter\(/, // Filter operations
  /\.forEach\(/, // ForEach operations
  /new\s+/, // Constructor calls
  /this\./, // This keyword
  /super\./, // Super keyword
  /const\s+\w+\s*=\s*\{/, // Object literals
  /const\s+\w+\s*=\s*\[/, // Array literals
];

export const detectLineComplexity = (line: string): { complexity: ComplexityLevel; reason: string } => {
  const trimmed = line.trim();

  // Empty or comment lines
  if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("*")) {
    return { complexity: "simple", reason: "Comment or empty line" };
  }

  // Check complex patterns first
  for (const pattern of COMPLEX_PATTERNS) {
    if (pattern.test(trimmed)) {
      const reason = getComplexityReason(trimmed, "complex");
      return { complexity: "complex", reason };
    }
  }

  // Check simple patterns
  for (const pattern of SIMPLE_PATTERNS) {
    if (pattern.test(trimmed)) {
      const reason = getComplexityReason(trimmed, "simple");
      return { complexity: "simple", reason };
    }
  }

  // Check medium patterns
  for (const pattern of MEDIUM_PATTERNS) {
    if (pattern.test(trimmed)) {
      const reason = getComplexityReason(trimmed, "medium");
      return { complexity: "medium", reason };
    }
  }

  // Default to medium for unknown patterns
  return { complexity: "medium", reason: "Standard code statement" };
};

const getComplexityReason = (line: string, level: ComplexityLevel): string => {
  const reasons: Record<ComplexityLevel, Record<string, string>> = {
    simple: {
      comment: "Comment line",
      import: "Import statement",
      export: "Export statement",
      assignment: "Simple variable assignment",
      return: "Simple return statement",
      brace: "Code block boundary",
      default: "Simple statement"
    },
    medium: {
      if: "Conditional logic",
      loop: "Loop statement",
      function: "Function definition",
      arrow: "Arrow function",
      array: "Array operation",
      object: "Object creation",
      default: "Standard statement"
    },
    complex: {
      ternary: "Ternary operator (conditional expression)",
      async: "Asynchronous operation",
      promise: "Promise handling",
      reduce: "Complex array reduction",
      recursion: "Recursive function",
      destructuring: "Destructuring assignment",
      generics: "Generic types",
      class: "Class definition",
      default: "Complex code pattern"
    }
  };

  if (line.includes("//")) return reasons[level].comment;
  if (line.includes("import")) return reasons[level].import;
  if (line.includes("export")) return reasons[level].export;
  if (line.includes("async")) return reasons[level].async;
  if (line.includes("await")) return reasons[level].async;
  if (line.includes("Promise")) return reasons[level].promise;
  if (line.includes("?")) return reasons[level].ternary;
  if (line.includes("reduce")) return reasons[level].reduce;
  if (line.includes("class")) return reasons[level].class;
  if (line.includes("=>")) return reasons[level].arrow;
  if (line.includes("function")) return reasons[level].function;
  if (line.includes("if")) return reasons[level].if;
  if (line.includes("for") || line.includes("while")) return reasons[level].loop;

  return reasons[level].default;
};

export const analyzeCodeComplexity = (content: string): LineComplexity[] => {
  const lines = content.split(/\r?\n/);
  return lines.map((line, index) => {
    const { complexity, reason } = detectLineComplexity(line);
    return {
      line: index + 1,
      complexity,
      reason
    };
  });
};

export const getComplexityColor = (complexity: ComplexityLevel): string => {
  switch (complexity) {
    case "simple":
      return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30";
    case "medium":
      return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/30";
    case "complex":
      return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30";
  }
};

export const getComplexityBadge = (complexity: ComplexityLevel): string => {
  switch (complexity) {
    case "simple":
      return "🟢 Simple";
    case "medium":
      return "🟡 Medium";
    case "complex":
      return "🔴 Complex";
  }
};
