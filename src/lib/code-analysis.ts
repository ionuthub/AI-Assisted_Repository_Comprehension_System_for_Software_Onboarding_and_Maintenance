
import { SkillLevel } from "@/constants/appConstants";
import { generateW3SchoolsExplanation } from "@/lib/w3schoolsExplainer";

export const detectCodePattern = (line: string): { type: string; description: string } => {
    const trimmed = line.trim();

    // Assignment patterns
    if (/^(const|let|var)\s+\w+\s*=\s*/.test(trimmed)) {
        const varName = trimmed.match(/^(const|let|var)\s+(\w+)/)?.[2];
        return {
            type: "assignment",
            description: `Creating a box called "${varName}" and putting something inside it`
        };
    }

    // Function calls
    if (/\w+\s*\(.*\)/.test(trimmed) && !trimmed.startsWith("function") && !trimmed.startsWith("const")) {
        const funcName = trimmed.match(/(\w+)\s*\(/)?.[1];
        return {
            type: "function_call",
            description: `Asking "${funcName}" to do something`
        };
    }

    // If/else conditions
    if (/^if\s*\(/.test(trimmed)) {
        return {
            type: "condition",
            description: "Making a decision based on a question"
        };
    }

    // Loops
    if (/^(for|while)\s*\(/.test(trimmed)) {
        return {
            type: "loop",
            description: "Repeating something over and over"
        };
    }

    // Return statement
    if (/^return\s/.test(trimmed)) {
        return {
            type: "return",
            description: "Giving back an answer"
        };
    }

    // Array/Object operations
    if (/\.map\(|.filter\(|.forEach\(/.test(trimmed)) {
        return {
            type: "array_operation",
            description: "Doing something to each item in a list"
        };
    }

    return {
        type: "unknown",
        description: "Executing code"
    };
};

export const estimateCodeComplexity = (line: string): "simple" | "complex" => {
    // Simple patterns: basic assignments, simple function calls, returns
    const simplePatterns = [
        /^(const|let|var)\s+\w+\s*=\s*[^{\[(]*$/,  // Simple assignment
        /^return\s+[^{\[(]*$/,                        // Simple return
        /^\w+\s*=\s*[^{\[(]*$/,                      // Simple reassignment
        /^if\s*\([^{]*\)\s*$/,                        // Simple condition
        /^\}\s*$/,                                     // Closing brace
        /^\{\s*$/,                                     // Opening brace
    ];

    const isSimple = simplePatterns.some(pattern => pattern.test(line));
    return isSimple ? "simple" : "complex";
};

export const buildLineExplanation = (
    content: string,
    lineNumber: number,
    skillLevel: SkillLevel,
    fileName: string = "code.js"
): string => {
    return generateW3SchoolsExplanation(content, lineNumber, skillLevel, fileName);
};
