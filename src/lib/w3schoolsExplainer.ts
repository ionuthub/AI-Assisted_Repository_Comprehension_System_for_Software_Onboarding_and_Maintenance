/**
 * W3Schools-style Code Explainer
 * 
 * Produces clear, friendly, educational explanations that:
 * - Feel like reading a short W3Schools tutorial
 * - Use section headers and plain-English explanations
 * - Explain what each line does, why it's written that way, and how it connects
 * - Include notes, best practices, and next steps
 * - Adapt to skill level (beginner, intermediate, advanced)
 */

type SkillLevel = "beginner" | "intermediate" | "advanced";

interface CodeContext {
  lineNumber: number;
  targetLine: string;
  beforeLines: string[];
  afterLines: string[];
  allContent: string;
  fileName: string;
}

// ============================================================================
// PATTERN DETECTION
// ============================================================================

const detectPattern = (line: string) => {
  const trimmed = line.trim();

  if (/^import\s+/.test(trimmed)) return "import";
  if (/^export\s+/.test(trimmed)) return "export";
  if (/^const\s+\w+\s*=\s*/.test(trimmed)) return "const_assignment";
  if (/^let\s+\w+\s*=\s*/.test(trimmed)) return "let_assignment";
  if (/^var\s+\w+\s*=\s*/.test(trimmed)) return "var_assignment";
  if (/^\w+\s*=\s*/.test(trimmed)) return "reassignment";
  if (/^if\s*\(/.test(trimmed)) return "if_statement";
  if (/^else\s*if\s*\(/.test(trimmed)) return "else_if";
  if (/^else\s*/.test(trimmed)) return "else";
  if (/^for\s*\(/.test(trimmed)) return "for_loop";
  if (/^while\s*\(/.test(trimmed)) return "while_loop";
  if (/^function\s+\w+/.test(trimmed)) return "function_declaration";
  if (/^const\s+\w+\s*=\s*\(.*\)\s*=>/.test(trimmed)) return "arrow_function";
  if (/^return\s+/.test(trimmed)) return "return";
  if (/\.map\(/.test(trimmed)) return "map_method";
  if (/\.filter\(/.test(trimmed)) return "filter_method";
  if (/\.forEach\(/.test(trimmed)) return "forEach_method";
  if (/\.reduce\(/.test(trimmed)) return "reduce_method";
  if (/async\s+function/.test(trimmed)) return "async_function";
  if (/await\s+/.test(trimmed)) return "await";
  if (/try\s*\{/.test(trimmed)) return "try_block";
  if (/catch\s*\(/.test(trimmed)) return "catch_block";
  if (/class\s+\w+/.test(trimmed)) return "class_declaration";
  if (/interface\s+\w+/.test(trimmed)) return "interface";
  if (/type\s+\w+\s*=/.test(trimmed)) return "type_alias";
  if (/\/\//.test(trimmed)) return "comment";
  if (/\/\*/.test(trimmed)) return "block_comment";
  if (trimmed === "" || trimmed === "{" || trimmed === "}") return "whitespace";

  return "general_code";
};

// ============================================================================
// BEGINNER EXPLANATIONS (Simple, Friendly, Analogies)
// ============================================================================

const beginnerExplanation = (context: CodeContext): string => {
  const { targetLine, lineNumber, beforeLines, afterLines } = context;
  const pattern = detectPattern(targetLine);

  let explanation = "";
  let whatItDoes = "";
  let whyItMatters = "";
  let example = "";

  switch (pattern) {
    case "import":
      whatItDoes =
        "This line brings in code from another file or library. Think of it like borrowing a tool from a toolbox before you use it.";
      whyItMatters =
        "You need to import things before you can use them in your code. It's like saying 'I want to use this helper function, so bring it in here.'";
      example =
        "If you write `import { useState } from 'react'`, you're saying 'I want to use the `useState` tool from the React library.'";
      break;

    case "const_assignment":
      whatItDoes =
        "This line creates a box with a label and puts something inside it. The label is the variable name, and what's after the `=` is what goes in the box.";
      whyItMatters =
        "Variables let you store information so you can use it later. `const` means the box can't be changed once you put something in it.";
      example =
        "If you write `const name = 'Alice'`, you're creating a box labeled 'name' that holds the text 'Alice'. Later, you can use `name` to get that text back.";
      break;

    case "let_assignment":
      whatItDoes =
        "This line creates a box with a label and puts something inside it. Unlike `const`, you can change what's in the box later.";
      whyItMatters =
        "Use `let` when you know the value might change. Use `const` when it shouldn't change. This helps prevent mistakes.";
      example =
        "If you write `let count = 0`, you can later do `count = 1` to change it. With `const`, you couldn't do that.";
      break;

    case "if_statement":
      whatItDoes =
        "This line asks a yes-or-no question. If the answer is 'yes' (true), the code inside the curly braces `{}` runs. If 'no' (false), it skips that code.";
      whyItMatters =
        "Conditions let your code make decisions. Without them, your code would always do the same thing every time.";
      example =
        "If you write `if (age >= 18)`, you're asking 'Is the age 18 or older?' If yes, run the code inside. If no, skip it.";
      break;

    case "for_loop":
      whatItDoes =
        "This line tells the computer to repeat something multiple times. It's like saying 'Do this action for each item in a list.'";
      whyItMatters =
        "Loops save you from writing the same code over and over. Instead of writing the same line 100 times, you write it once in a loop.";
      example =
        "If you write `for (let i = 0; i < 5; i++)`, you're saying 'Start with i = 0, and keep going while i is less than 5. Each time, add 1 to i.'";
      break;

    case "function_declaration":
    case "arrow_function":
      whatItDoes =
        "This line creates a reusable block of code that does a specific job. You give it a name, and later you can call that name to run the code.";
      whyItMatters =
        "Functions let you organize your code and reuse it. Instead of writing the same code in 10 places, you write it once in a function and call it 10 times.";
      example =
        "If you write `function greet(name) { return 'Hello, ' + name; }`, you're creating a helper that greets people. Later, you can call `greet('Alice')` to get 'Hello, Alice'.";
      break;

    case "return":
      whatItDoes =
        "This line says 'I'm done with this function, and here's my answer!' It sends a result back to whoever called the function.";
      whyItMatters =
        "Return statements let functions give you information. Without them, functions couldn't send results back to your code.";
      example =
        "If you write `return age + 1`, you're saying 'Send back the value of age plus 1 to whoever called this function.'";
      break;

    case "map_method":
      whatItDoes =
        "This line does the same action to every item in a list, one by one. It's like saying 'For each toy in the toy box, do this thing.'";
      whyItMatters =
        "Map is a powerful way to transform lists. Instead of writing a loop, you can use map to transform all items at once.";
      example =
        "If you write `numbers.map(n => n * 2)`, you're saying 'For each number in the list, multiply it by 2 and create a new list with the results.'";
      break;

    case "async_function":
      whatItDoes =
        "This line creates a function that can wait for things to finish before continuing. It's like saying 'This function might need to wait for something, so be patient.'";
      whyItMatters =
        "Async functions let your code wait for slow operations (like getting data from the internet) without freezing everything else.";
      example =
        "If you write `async function fetchData()`, you're saying 'This function might need to wait for data to come back from the internet.'";
      break;

    case "await":
      whatItDoes =
        "This line pauses the function and waits for something to finish. It's like saying 'Wait here until this task is done, then continue.'";
      whyItMatters =
        "Await lets you write code that looks normal, even though it's waiting for slow things to happen.";
      example =
        "If you write `const data = await fetch(url)`, you're saying 'Wait for the data to come back from that URL, then put it in the data box.'";
      break;

    case "try_block":
      whatItDoes =
        "This line starts a 'try' section where you put code that might have problems. If something goes wrong, the code will jump to the 'catch' section.";
      whyItMatters =
        "Try-catch lets you handle errors gracefully. Instead of your program crashing, you can catch the error and do something about it.";
      example =
        "If you write `try { doSomethingRisky(); }`, you're saying 'Try to do this thing, but if it fails, don't crash the whole program.'";
      break;

    case "class_declaration":
      whatItDoes =
        "This line creates a blueprint for making objects. It's like a template that says 'Objects of this type have these properties and these abilities.'";
      whyItMatters =
        "Classes let you organize related data and functions together. Instead of having loose variables, you bundle them into objects.";
      example =
        "If you write `class Dog { }`, you're creating a blueprint for dog objects. Later, you can create specific dogs using this blueprint.";
      break;

    default:
      whatItDoes = "This line executes code that performs an action.";
      whyItMatters = "Understanding what each line does helps you understand how the whole program works.";
      example = `The code is: \`${targetLine}\``;
  }

  explanation = `
## What This Line Does

${whatItDoes}

## Why It Matters

${whyItMatters}

## Example

${example}

## The Actual Code

\`\`\`
${targetLine}
\`\`\`

## Try It Out

Click on other lines to see more explanations. Each line is a small piece of the puzzle!
  `.trim();

  return explanation;
};

// ============================================================================
// INTERMEDIATE EXPLANATIONS (Context, Patterns, Best Practices)
// ============================================================================

const intermediateExplanation = (context: CodeContext): string => {
  const { targetLine, lineNumber, beforeLines, afterLines } = context;
  const pattern = detectPattern(targetLine);

  let explanation = "";
  let purpose = "";
  let context_flow = "";
  let pattern_info = "";
  let best_practice = "";

  switch (pattern) {
    case "import":
      purpose = "Imports a module or specific exports from another file or library.";
      pattern_info =
        "Named imports (`{ useState }`) import specific exports. Default imports (`import React`) import the default export.";
      best_practice =
        "Import only what you need to keep bundle size small. Use named imports for clarity.";
      break;

    case "const_assignment":
      purpose = "Declares an immutable variable. The value cannot be reassigned.";
      pattern_info =
        "Prefer `const` by default. Use `let` only when you need to reassign. Avoid `var` in modern JavaScript.";
      best_practice =
        "Using `const` prevents accidental mutations and makes your code more predictable. It's a best practice in modern JavaScript.";
      break;

    case "if_statement":
      purpose = "Conditionally executes code based on a boolean expression.";
      pattern_info =
        "The condition is evaluated to true or false. Falsy values: `false`, `0`, `null`, `undefined`, `NaN`, empty string. Everything else is truthy.";
      best_practice =
        "Keep conditions simple and readable. Use early returns to reduce nesting. Consider using ternary operators for simple cases.";
      break;

    case "for_loop":
      purpose = "Iterates over a range of values or array indices.";
      pattern_info =
        "The loop has three parts: initialization, condition, and increment. Consider using `.forEach()`, `.map()`, or `for...of` for cleaner code.";
      best_practice =
        "Use `for...of` for iterating over values, `for...in` for object keys, and `.forEach()` or `.map()` for functional approaches.";
      break;

    case "function_declaration":
    case "arrow_function":
      purpose = "Defines a reusable block of code that can accept parameters and return a value.";
      pattern_info =
        "Arrow functions (`=>`) have implicit returns for single expressions. Regular functions need explicit `return` statements.";
      best_practice =
        "Keep functions small and focused on one task. Use descriptive names. Consider pure functions when possible.";
      break;

    case "map_method":
      purpose = "Transforms each element in an array using a callback function.";
      pattern_info =
        "Map returns a new array without modifying the original. It's a functional programming pattern that's cleaner than for loops.";
      best_practice =
        "Use map for transformations. Use filter for selecting items. Use reduce for aggregating values. Chain them for complex operations.";
      break;

    case "async_function":
      purpose = "Declares a function that returns a Promise and can use `await`.";
      pattern_info =
        "Async functions always return a Promise. They allow you to use `await` to pause execution until a Promise resolves.";
      best_practice =
        "Use async/await for cleaner asynchronous code. Always handle errors with try/catch. Avoid mixing callbacks and async/await.";
      break;

    case "try_block":
      purpose = "Wraps code that might throw an error. Pairs with `catch` to handle errors.";
      pattern_info =
        "If an error occurs in the try block, execution jumps to the catch block. Use `finally` for cleanup code that always runs.";
      best_practice =
        "Catch specific errors when possible. Log errors for debugging. Don't silently ignore errors. Use finally for cleanup.";
      break;

    default:
      purpose = "This line executes code.";
      pattern_info = "Consider the context and how this line relates to surrounding code.";
      best_practice = "Write clear, readable code. Use meaningful variable names. Add comments for complex logic.";
  }

  const contextStr =
    beforeLines.length > 0 || afterLines.length > 0
      ? `
**Context:**
${beforeLines.length > 0 ? `Before: ${beforeLines.join(" → ")}` : ""}
**[Line ${lineNumber}]** ← You are here
${afterLines.length > 0 ? `After: ${afterLines.join(" → ")}` : ""}
  `.trim()
      : "";

  explanation = `
## Purpose

${purpose}

## Pattern & Syntax

${pattern_info}

## Code

\`\`\`
${targetLine}
\`\`\`

${contextStr ? `\n${contextStr}` : ""}

## Best Practice

${best_practice}

## Next Steps

- Look at how this line's output is used in the lines below
- Consider edge cases and error handling
- Think about performance implications for large datasets
  `.trim();

  return explanation;
};

// ============================================================================
// ADVANCED EXPLANATIONS (Architecture, Performance, Optimization)
// ============================================================================

const advancedExplanation = (context: CodeContext): string => {
  const { targetLine, lineNumber, beforeLines, afterLines, fileName } = context;
  const pattern = detectPattern(targetLine);

  let explanation = "";
  let responsibility = "";
  let implementation = "";
  let considerations = "";

  switch (pattern) {
    case "import":
      responsibility =
        "Module resolution and dependency injection. Affects bundle size and load time.";
      implementation =
        "Evaluate whether this is a named import, default import, or side-effect import. Consider tree-shaking implications.";
      considerations =
        "Monitor bundle size. Prefer named imports for better tree-shaking. Consider dynamic imports for code splitting.";
      break;

    case "const_assignment":
      responsibility =
        "Variable binding with immutability guarantees. Affects memory allocation and garbage collection.";
      implementation =
        "The value is bound at declaration time. Reassignment is prevented at runtime. Consider const-correctness patterns.";
      considerations =
        "Immutability enables compiler optimizations. Consider using Object.freeze() for deep immutability. Evaluate memory usage for large objects.";
      break;

    case "if_statement":
      responsibility =
        "Control flow branching. Affects execution path and performance characteristics.";
      implementation =
        "Branch prediction in modern CPUs. Consider short-circuit evaluation and guard clauses to optimize.";
      considerations =
        "Profile branch prediction behavior. Use early returns to reduce nesting. Consider polymorphism or strategy patterns for complex branching.";
      break;

    case "for_loop":
      responsibility =
        "Iteration and state mutation. Performance-critical in tight loops.";
      implementation =
        "Consider loop unrolling, vectorization, and cache locality. Evaluate functional alternatives for readability vs. performance.";
      considerations =
        "Profile loop performance. Consider algorithmic complexity (O(n), O(n²), etc.). Use appropriate data structures for iteration.";
      break;

    case "map_method":
      responsibility =
        "Functional transformation with immutability. Creates new array allocation.";
      implementation =
        "Allocates new array. Calls callback for each element. Consider memory implications for large arrays.";
      considerations =
        "Evaluate memory usage for large datasets. Consider lazy evaluation with generators. Profile performance vs. imperative loops.";
      break;

    case "async_function":
      responsibility =
        "Asynchronous execution context. Manages Promise lifecycle and error propagation.";
      implementation =
        "Implicitly wraps return value in Promise. Enables await syntax. Affects call stack and event loop behavior.";
      considerations =
        "Consider concurrent vs. sequential execution. Profile Promise overhead. Evaluate error handling strategy. Monitor for memory leaks in long-running async operations.";
      break;

    case "try_block":
      responsibility =
        "Error boundary and exception handling. Affects control flow and performance.";
      implementation =
        "Sets up exception handler. Catches synchronous and Promise rejections (if in async context). Consider performance cost of exception handling.";
      considerations =
        "Exception handling has performance cost. Use for exceptional cases, not control flow. Consider Result types or Either monads for functional error handling.";
      break;

    default:
      responsibility = "Executes code with specific semantics and side effects.";
      implementation = "Analyze the operation's complexity and side effects.";
      considerations =
        "Profile performance. Consider architectural implications. Evaluate testability and maintainability.";
  }

  const contextStr =
    beforeLines.length > 0 || afterLines.length > 0
      ? `
**Execution Context:**
${beforeLines.slice(-2).join(" → ")} → **[Line ${lineNumber}]** → ${afterLines.slice(0, 2).join(" → ")}
  `.trim()
      : "";

  explanation = `
## Responsibility & Semantics

${responsibility}

## Implementation Details

${implementation}

## Code

\`\`\`
${targetLine}
\`\`\`

${contextStr ? `\n${contextStr}` : ""}

## Design Considerations

${considerations}

## Optimization Opportunities

- Profile this code path for performance bottlenecks
- Consider algorithmic improvements or data structure changes
- Evaluate trade-offs between readability and performance
- Review for potential memory leaks or resource management issues
- Consider architectural patterns that might improve this section
  `.trim();

  return explanation;
};

// ============================================================================
// PUBLIC API
// ============================================================================

export const generateW3SchoolsExplanation = (
  content: string,
  lineNumber: number,
  skillLevel: SkillLevel,
  fileName: string = "code.js"
): string => {
  const lines = content.split(/\r?\n/);
  const targetLine = lines[lineNumber - 1]?.trim() || "";

  if (!targetLine) {
    return "This line is empty or contains only whitespace. Select a line with actual code to see an explanation.";
  }

  const beforeLines = lines
    .slice(Math.max(0, lineNumber - 3), lineNumber - 1)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("//"));

  const afterLines = lines
    .slice(lineNumber, Math.min(lines.length, lineNumber + 3))
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("//"));

  const context: CodeContext = {
    lineNumber,
    targetLine,
    beforeLines,
    afterLines,
    allContent: content,
    fileName,
  };

  switch (skillLevel) {
    case "beginner":
      return beginnerExplanation(context);
    case "intermediate":
      return intermediateExplanation(context);
    case "advanced":
      return advancedExplanation(context);
    default:
      return beginnerExplanation(context);
  }
};

export const generateW3SchoolsFileExplanation = (
  fileName: string,
  content: string,
  skillLevel: SkillLevel
): string => {
  const lines = content.split(/\r?\n/).filter((l) => l.trim());
  const codeLineCount = lines.length;

  // Detect file type
  const isComponent =
    fileName.includes("component") ||
    fileName.endsWith(".tsx") ||
    fileName.endsWith(".jsx");
  const isHook = fileName.includes("hook") || fileName.includes("use");
  const isService =
    fileName.includes("service") ||
    fileName.includes("api") ||
    fileName.includes("fetch");
  const isUtil =
    fileName.includes("util") || fileName.includes("helper");
  const isTest = fileName.includes("test") || fileName.includes("spec");

  let fileType = "General JavaScript/TypeScript File";
  let overview = "";
  let whatToExpect = "";
  let howToRead = "";

  if (isComponent) {
    fileType = "React Component";
    overview =
      "This file defines a React component - a reusable piece of UI that can be displayed on the page.";
    whatToExpect =
      "You'll find the component function, JSX markup for rendering, props handling, state management with hooks, and event handlers.";
    howToRead =
      "Start by looking at the component function signature. Then scan the JSX to see what gets rendered. Look for hooks like `useState` or `useEffect` to understand state and side effects.";
  } else if (isHook) {
    fileType = "Custom React Hook";
    overview =
      "This file defines a custom hook - reusable logic that can be shared across multiple components.";
    whatToExpect =
      "The function name starts with 'use'. It uses built-in React hooks internally. It returns state and functions that components can use.";
    howToRead =
      "Read the function name to understand what it does. Look for built-in hooks like `useState`, `useEffect`, or `useContext`. See what it returns - that's the public API.";
  } else if (isService) {
    fileType = "API Service / Data Fetching";
    overview =
      "This file handles communication with external APIs or data sources.";
    whatToExpect =
      "API endpoint definitions, fetch or axios calls, request/response handling, error handling, and data transformation.";
    howToRead =
      "Look for the main functions that fetch data. See what endpoints they call. Check how errors are handled. Look for data transformation logic.";
  } else if (isUtil) {
    fileType = "Utility / Helper Functions";
    overview =
      "This file contains helper functions used throughout the project.";
    whatToExpect =
      "Pure functions for common tasks, data formatting, validation, calculations, and reusable logic.";
    howToRead =
      "Each function is independent. Read the function names and parameters to understand what they do. Look for comments explaining complex logic.";
  } else if (isTest) {
    fileType = "Test Suite";
    overview =
      "This file contains tests that verify the code works correctly.";
    whatToExpect =
      "Test cases with descriptions, setup and teardown code, assertions, and mock data.";
    howToRead =
      "Each test describes what it's testing. Read the test description first. Then look at the assertions to see what's being verified.";
  }

  if (skillLevel === "beginner") {
    return `
## 📄 ${fileType}: ${fileName}

### What Is This File?

${overview}

### What You'll Find Here

${whatToExpect}

### How to Read This File

${howToRead}

### Tips for Understanding

- Start at the top and work your way down
- Look for function names - they often tell you what the code does
- Read comments - they explain the tricky parts
- Click on individual lines to see detailed explanations
- Don't worry if you don't understand everything at first - that's normal!

### Next Steps

1. Identify the main function or component
2. Look for imports at the top to see what this file uses
3. Read through the logic step by step
4. Click on lines you don't understand
5. Try modifying the code to see what happens
    `.trim();
  } else if (skillLevel === "intermediate") {
    return `
## 📄 ${fileType}: ${fileName}

### Purpose

${overview}

### Structure & Patterns

${whatToExpect}

### Key Concepts to Look For

- **Imports/Exports**: How this file connects to others
- **Main Functions**: The public API of this file
- **State Management**: How data is stored and updated
- **Error Handling**: How problems are managed
- **Side Effects**: What happens when functions run

### Architecture Notes

This file follows standard patterns for ${fileType.toLowerCase()} files. Pay attention to:
- How data flows through the functions
- Where state is managed
- How errors are handled
- What gets exported and why

### Analysis Approach

1. Scan imports to understand dependencies
2. Identify exported functions/components - these are the public API
3. Trace data flow through the code
4. Look for error handling and edge cases
5. Consider how this file integrates with the rest of the system

### Click on Lines to Explore

Each line has a detailed explanation. Focus on:
- Complex logic or patterns you're unfamiliar with
- Areas where data transforms
- Error handling sections
    `.trim();
  } else {
    return `
## 📄 ${fileType}: ${fileName}

### Responsibility & Semantics

${overview}

### Implementation Patterns

${whatToExpect}

### Architectural Analysis

**File Type**: ${fileType}
**Lines of Code**: ${codeLineCount}

**Key Considerations**:
- Module boundaries and coupling
- Performance characteristics
- Error handling strategy
- Testability and maintainability
- Reusability and extensibility

### Design Review Checklist

- [ ] Is the module's responsibility clear and focused?
- [ ] Are dependencies minimized and explicit?
- [ ] Is error handling comprehensive?
- [ ] Are there performance bottlenecks?
- [ ] Is the code testable?
- [ ] Could this be refactored for better clarity?
- [ ] Are there opportunities for composition or abstraction?

### Performance & Optimization

- Profile this module for bottlenecks
- Consider algorithmic improvements
- Evaluate memory usage patterns
- Review for potential memory leaks
- Consider caching or memoization opportunities

### Integration Points

Analyze how this module:
- Depends on other modules
- Is used by other modules
- Handles errors and edge cases
- Manages state and side effects
    `.trim();
  }
};

// ============================================================================
// BLOCK-LEVEL EXPLANATIONS
// ============================================================================

/**
 * Generates explanation for an entire code block (multiple lines)
 * Analyzes the block as a cohesive unit rather than individual lines
 */
export const generateBlockExplanation = (
  content: string,
  startLine: number,
  endLine: number,
  skillLevel: SkillLevel,
  fileName: string = "code.js"
): string => {
  const lines = content.split(/\r?\n/);
  const blockLines = lines.slice(startLine - 1, endLine);
  const blockContent = blockLines.join("\n");

  if (blockLines.length === 0) {
    return "This block is empty.";
  }

  // Detect the block type
  const firstLine = blockLines[0]?.trim() || "";
  const blockType = detectBlockType(firstLine);

  // Generate skill-level-appropriate explanation
  if (skillLevel === "beginner") {
    return generateBeginnerBlockExplanation(blockContent, blockType, blockLines);
  } else if (skillLevel === "intermediate") {
    return generateIntermediateBlockExplanation(blockContent, blockType, blockLines);
  } else {
    return generateAdvancedBlockExplanation(blockContent, blockType, blockLines);
  }
};

const detectBlockType = (firstLine: string): string => {
  if (/^(async\s+)?function\s+\w+/.test(firstLine)) return "function";
  if (/^const\s+\w+\s*=\s*\(.*\)\s*=>/.test(firstLine)) return "arrow_function";
  if (/^class\s+\w+/.test(firstLine)) return "class";
  if (/^if\s*\(/.test(firstLine)) return "conditional";
  if (/^for\s*\(/.test(firstLine)) return "loop";
  if (/^while\s*\(/.test(firstLine)) return "loop";
  if (/^try\s*\{/.test(firstLine)) return "try_catch";
  if (/^const\s+\w+\s*=\s*\{/.test(firstLine)) return "object";
  if (/^const\s+\w+\s*=\s*\[/.test(firstLine)) return "array";
  return "code_block";
};

const generateBeginnerBlockExplanation = (
  blockContent: string,
  blockType: string,
  blockLines: string[]
): string => {
  const lineCount = blockLines.length;
  let overview = "";
  let purpose = "";
  let breakdown = "";
  let tips = "";

  switch (blockType) {
    case "function":
    case "arrow_function":
      overview = `This is a **function** - a reusable block of code that does a specific job. When you call this function, it runs all the code inside it.`;
      purpose = `This function has ${lineCount} lines of code. It takes some input (parameters) and does something with it.`;
      breakdown = generateLineByLineBreakdown(blockLines, "beginner");
      tips = `
**How to use this function:**
- Call it by name with the right inputs
- It will run all the code inside
- It might give you back a result (if it has a \`return\` statement)
      `.trim();
      break;

    case "conditional":
      overview = `This is an **if statement** - it asks a yes-or-no question and runs different code depending on the answer.`;
      purpose = `If the condition is true, the code inside runs. If false, it might skip to an \`else\` block or continue.`;
      breakdown = generateLineByLineBreakdown(blockLines, "beginner");
      tips = `
**Understanding the logic:**
- The condition goes in the parentheses \`( )\`
- The code to run goes in the curly braces \`{ }\`
- If the condition is true, the code runs
- If false, it skips to the next part
      `.trim();
      break;

    case "loop":
      overview = `This is a **loop** - it repeats the same code multiple times until a condition says to stop.`;
      purpose = `Instead of writing the same code over and over, you write it once in a loop and let the computer repeat it.`;
      breakdown = generateLineByLineBreakdown(blockLines, "beginner");
      tips = `
**How loops work:**
- Start with an initial value
- Check a condition each time
- Run the code inside the loop
- Update the value
- Repeat until the condition is false
      `.trim();
      break;

    case "try_catch":
      overview = `This is a **try-catch block** - it tries to run code, and if something goes wrong, it catches the error instead of crashing.`;
      purpose = `The code in \`try\` runs first. If an error happens, the code in \`catch\` runs to handle it gracefully.`;
      breakdown = generateLineByLineBreakdown(blockLines, "beginner");
      tips = `
**Error handling:**
- \`try\` block: Code that might have problems
- \`catch\` block: What to do if something goes wrong
- This prevents your program from crashing
      `.trim();
      break;

    default:
      overview = `This is a **code block** with ${lineCount} lines of code.`;
      purpose = `These lines work together to accomplish a task.`;
      breakdown = generateLineByLineBreakdown(blockLines, "beginner");
      tips = `Read through each line to understand what it does and how it connects to the next line.`;
  }

  return `
## 📝 Code Block Overview

${overview}

## What This Block Does

${purpose}

## Line-by-Line Breakdown

${breakdown}

## Tips for Understanding

${tips}

## Try It Out

- Change some values and see what happens
- Add comments to explain what each line does
- Try breaking it into smaller pieces
  `.trim();
};

const generateIntermediateBlockExplanation = (
  blockContent: string,
  blockType: string,
  blockLines: string[]
): string => {
  const lineCount = blockLines.length;
  let overview = "";
  let patterns = "";
  let dataFlow = "";
  let bestPractices = "";

  switch (blockType) {
    case "function":
    case "arrow_function":
      overview = `**Function** (${lineCount} lines) - Encapsulates logic with defined inputs and outputs.`;
      patterns = `
- **Parameters**: Inputs to the function
- **Return statement**: Output value
- **Scope**: Variables inside are local to this function
      `.trim();
      dataFlow = generateDataFlowAnalysis(blockLines);
      bestPractices = `
- Keep functions focused on a single task
- Use descriptive names that explain what it does
- Consider edge cases and error handling
- Document complex logic with comments
      `.trim();
      break;

    case "conditional":
      overview = `**Conditional block** (${lineCount} lines) - Branches execution based on boolean conditions.`;
      patterns = `
- **Condition evaluation**: Checked at runtime
- **Truthy/Falsy values**: Understand what evaluates to true/false
- **Nested conditions**: Can have conditions inside conditions
- **Else chains**: Multiple branches possible
      `.trim();
      dataFlow = generateDataFlowAnalysis(blockLines);
      bestPractices = `
- Keep conditions simple and readable
- Use early returns to reduce nesting
- Consider ternary operators for simple cases
- Test all branches (true and false paths)
      `.trim();
      break;

    case "loop":
      overview = `**Loop** (${lineCount} lines) - Iterates over values or collections.`;
      patterns = `
- **Initialization**: Starting point
- **Condition**: When to stop
- **Increment/Update**: Change each iteration
- **Loop body**: Code that repeats
      `.trim();
      dataFlow = generateDataFlowAnalysis(blockLines);
      bestPractices = `
- Consider \`for...of\` for iterating values
- Consider \`.forEach()\` or \`.map()\` for arrays
- Avoid modifying collection while iterating
- Watch for infinite loops
      `.trim();
      break;

    default:
      overview = `**Code block** (${lineCount} lines) - Multiple statements working together.`;
      patterns = `Analyze the structure and relationships between statements.`;
      dataFlow = generateDataFlowAnalysis(blockLines);
      bestPractices = `Consider refactoring into smaller, focused functions.`;
  }

  return `
## 🔍 Block Analysis

${overview}

## Patterns & Structure

${patterns}

## Data Flow

${dataFlow}

## Best Practices

${bestPractices}

## Code

\`\`\`
${blockContent}
\`\`\`

## Next Steps

- Trace through the execution mentally
- Identify potential edge cases
- Consider performance implications
- Review for code smells or improvements
  `.trim();
};

const generateAdvancedBlockExplanation = (
  blockContent: string,
  blockType: string,
  blockLines: string[]
): string => {
  const lineCount = blockLines.length;
  let responsibility = "";
  let complexity = "";
  let considerations = "";

  switch (blockType) {
    case "function":
    case "arrow_function":
      responsibility = `**Function semantics** - Defines a callable unit with specific responsibility and contract.`;
      complexity = `
- **Closure behavior**: Captures variables from outer scope
- **Call stack implications**: Each call adds to stack
- **Tail call optimization**: Relevant for recursive functions
- **Memory allocation**: Parameters and local variables
      `.trim();
      considerations = `
- Pure vs impure functions
- Side effects and referential transparency
- Memoization opportunities
- Currying and partial application
      `.trim();
      break;

    case "conditional":
      responsibility = `**Control flow branching** - Determines execution path based on runtime conditions.`;
      complexity = `
- **Branch prediction**: CPU optimization consideration
- **Short-circuit evaluation**: Logical operators behavior
- **Polymorphism**: Alternative to complex conditionals
- **Strategy pattern**: Consider for multiple branches
      `.trim();
      considerations = `
- Cyclomatic complexity
- Guard clauses vs nested conditions
- Exhaustiveness checking
- Performance implications of branch prediction
      `.trim();
      break;

    case "loop":
      responsibility = `**Iteration semantics** - Repeats operations over collections or ranges.`;
      complexity = `
- **Time complexity**: O(n), O(n²), etc.
- **Space complexity**: Temporary allocations
- **Cache locality**: Memory access patterns
- **Vectorization**: SIMD optimization potential
      `.trim();
      considerations = `
- Algorithmic efficiency
- Lazy evaluation vs eager evaluation
- Parallel processing opportunities
- Generator functions for memory efficiency
      `.trim();
      break;

    default:
      responsibility = `**Code block semantics** - Multiple statements with interdependencies.`;
      complexity = `Analyze execution flow and state mutations.`;
      considerations = `Consider architectural implications and refactoring opportunities.`;
  }

  return `
## 🏗️ Architectural Analysis

**Block Type**: ${blockType}
**Lines**: ${lineCount}

### Responsibility

${responsibility}

### Complexity Considerations

${complexity}

### Design Review

${considerations}

## Code

\`\`\`
${blockContent}
\`\`\`

## Optimization Opportunities

- Profile for performance bottlenecks
- Identify algorithmic improvements
- Consider data structure changes
- Review for memory leaks
- Evaluate refactoring into smaller units
- Consider design patterns

## Potential Issues

- Edge cases not handled?
- Error conditions?
- Performance degradation at scale?
- Maintainability concerns?
- Testing coverage?
  `.trim();
};

const generateLineByLineBreakdown = (blockLines: string[], skillLevel: string): string => {
  return blockLines
    .map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("//")) return null;
      
      const lineNum = idx + 1;
      const description = describeLineSimple(trimmed);
      return `**Line ${lineNum}**: \`${trimmed}\`\n${description}`;
    })
    .filter(Boolean)
    .join("\n\n");
};

const generateDataFlowAnalysis = (blockLines: string[]): string => {
  const variables = new Set<string>();
  const operations: string[] = [];

  blockLines.forEach((line) => {
    const trimmed = line.trim();
    
    // Extract variable assignments
    const assignMatch = trimmed.match(/(?:const|let|var)\s+(\w+)/);
    if (assignMatch) {
      variables.add(assignMatch[1]);
      operations.push(`Define: ${assignMatch[1]}`);
    }

    // Extract function calls
    const callMatch = trimmed.match(/(\w+)\s*\(/);
    if (callMatch && !["if", "for", "while", "function"].includes(callMatch[1])) {
      operations.push(`Call: ${callMatch[1]}()`);
    }

    // Extract returns
    if (trimmed.startsWith("return")) {
      operations.push("Return value");
    }
  });

  let analysis = "**Variables used**: " + (variables.size > 0 ? Array.from(variables).join(", ") : "none");
  
  if (operations.length > 0) {
    analysis += "\n\n**Operations**:\n" + operations.map((op) => `- ${op}`).join("\n");
  }

  return analysis;
};

const describeLineSimple = (line: string): string => {
  if (/^const\s+\w+\s*=/.test(line)) return "Creates a variable";
  if (/^let\s+\w+\s*=/.test(line)) return "Creates a mutable variable";
  if (/^if\s*\(/.test(line)) return "Checks a condition";
  if (/^for\s*\(/.test(line)) return "Starts a loop";
  if (/^return\s+/.test(line)) return "Returns a value from the function";
  if (/\.map\(/.test(line)) return "Transforms each item in an array";
  if (/\.filter\(/.test(line)) return "Filters items from an array";
  if (/\.forEach\(/.test(line)) return "Runs code for each item";
  if (/await\s+/.test(line)) return "Waits for an async operation";
  if (/throw\s+/.test(line)) return "Throws an error";
  return "Executes code";
};
