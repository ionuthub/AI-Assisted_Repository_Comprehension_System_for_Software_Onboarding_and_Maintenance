import type { Project, ProjectFile, ProjectSummary } from "@/types/project";

const toTitleCase = (input: string) => {
  const normalized = input.trim();
  if (!normalized) return "Generated Project";
  return normalized
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const toPascalCase = (input: string) => {
  return toTitleCase(input).replace(/\s+/g, "");
};

const createSummary = (idea: string, skillLevel: "beginner" | "intermediate" | "advanced"): ProjectSummary => {
  const title = toTitleCase(idea);
  const description = `An ${skillLevel} friendly project generated from the idea: ${idea.trim()}`;
  return {
    name: title,
    description,
    source: "generated",
    language: "TypeScript",
    branch: "main",
  };
};

const detectProjectType = (idea: string): "react" | "nextjs" | "vue" | "backend" => {
  const lower = idea.toLowerCase();
  if (lower.includes("next") || lower.includes("fullstack") || lower.includes("server")) return "nextjs";
  if (lower.includes("vue")) return "vue";
  if (lower.includes("api") || lower.includes("backend") || lower.includes("server")) return "backend";
  return "react";
};

const createFiles = (idea: string, skillLevel: "beginner" | "intermediate" | "advanced"): ProjectFile[] => {
  const projectType = detectProjectType(idea);
  const componentName = toPascalCase(idea) || "Hero";
  const hookName = `use${componentName}`;

  const readme = `# ${toTitleCase(idea)}\n\nThis project was generated locally based on the idea: **${idea.trim()}**.\n\n## Getting Started\n\n- Install dependencies with \`npm install\`\n- Run the development server with \`npm run dev\`\n- Open http://localhost:5173 to view it\n\n## Project Structure\n\nThis is a ${projectType === "nextjs" ? "Next.js full-stack" : projectType === "backend" ? "backend API" : "React"} project focused on ${skillLevel}-level developers.\n\n## Features\n\n- Includes reusable components and utilities\n- Modular architecture for easy extension\n- Skill-level appropriate patterns and practices\n- Ready for further development\n\n## Next Steps\n\n1. Explore the code structure\n2. Understand the main components\n3. Modify and extend as needed\n4. Deploy when ready\n`;

  const main = `import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { ${componentName} } from "./${componentName}";

const App = () => (
  <main className="app">
    <${componentName} />
  </main>
);

createRoot(document.getElementById("root")!).render(<App />);
`;

  const component = `import React, { useMemo } from "react";
import { ${hookName} } from "./${hookName}";

export const ${componentName} = () => {
  const { headline, bulletPoints } = ${hookName}();

  return (
    <section className="feature-card">
      <h1>{headline}</h1>
      <ul>
        {bulletPoints.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    </section>
  );
};
`;

  const hook = `import { useMemo } from "react";

type SkillLevel = "beginner" | "intermediate" | "advanced";

const copyBySkillLevel: Record<SkillLevel, string[]> = {
  beginner: [
    "Explains core concepts plainly",
    "Keeps the UI small and readable",
    "Encourages experimentation"
  ],
  intermediate: [
    "Highlights modular structure",
    "Demonstrates custom hook usage",
    "Focuses on maintainable patterns"
  ],
  advanced: [
    "Mentions architectural trade-offs",
    "Keeps an eye on performance",
    "Suggests extension points"
  ],
};

export const use${componentName} = (skillLevel: SkillLevel = "${skillLevel}") => {
  return useMemo(() => {
    const baseline = "${toTitleCase(idea)}";
    const bulletPoints = copyBySkillLevel[skillLevel];

    return {
      headline: baseline,
      bulletPoints,
    };
  }, [skillLevel]);
};
`;

  const styles = `.app {\n  font-family: system-ui, sans-serif;\n  min-height: 100vh;\n  display: grid;\n  place-items: center;\n  background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%);\n  color: #0f172a;\n}\n\n.feature-card {\n  background: white;\n  border-radius: 1.5rem;\n  padding: 2.5rem;\n  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.15);\n  max-width: 36rem;\n}\n\n.feature-card h1 {\n  font-size: clamp(2rem, 5vw, 3rem);\n  margin-bottom: 1.5rem;\n}\n\n.feature-card ul {\n  display: grid;\n  gap: 0.75rem;\n  padding-left: 1.25rem;\n}\n\n.feature-card li {\n  font-size: 1rem;\n  line-height: 1.5;\n}\n`;

  const files: ProjectFile[] = [
    { path: "README.md", language: "Markdown", content: readme },
    { path: "src/main.tsx", language: "TypeScript", content: main },
    { path: `src/${componentName}.tsx`, language: "TypeScript", content: component },
    { path: `src/${hookName}.ts`, language: "TypeScript", content: hook },
    { path: "src/styles.css", language: "CSS", content: styles },
  ];

  // Add package.json
  const packageJson = `{
  "name": "${toPascalCase(idea).toLowerCase()}",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.23",
    "@types/react-dom": "^18.3.7",
    "@vitejs/plugin-react-swc": "^3.11.0",
    "typescript": "^5.8.3",
    "vite": "^5.4.19"
  }
}`;
  files.push({ path: "package.json", language: "JSON", content: packageJson });

  // Add TypeScript config
  const tsconfig = `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "resolveJsonModule": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}`;
  files.push({ path: "tsconfig.json", language: "JSON", content: tsconfig });

  // Add .gitignore
  const gitignore = `# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Environment
.env
.env.local
.env.*.local`;
  files.push({ path: ".gitignore", language: "Text", content: gitignore });

  // Add index.html
  const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${toTitleCase(idea)}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;
  files.push({ path: "index.html", language: "HTML", content: indexHtml });

  // Add vite.config.ts
  const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
})`;
  files.push({ path: "vite.config.ts", language: "TypeScript", content: viteConfig });

  return files;
};

export const generateProject = (
  idea: string,
  skillLevel: "beginner" | "intermediate" | "advanced"
): Project => ({
  summary: createSummary(idea, skillLevel),
  files: createFiles(idea, skillLevel),
});

// File-level analysis and explanation
type SkillLevelType = "beginner" | "intermediate" | "advanced";

interface FileAnalysis {
  purpose: string;
  keyFunctions: string[];
  whatToExpect: string[];
  mainConcepts: string[];
}

const detectFileType = (fileName: string, content: string): string => {
  const lower = fileName.toLowerCase();
  
  if (lower.includes("test") || lower.includes("spec")) return "test";
  if (lower.includes("config") || lower.includes("setup")) return "config";
  if (lower.includes("type") || lower.includes("interface")) return "types";
  if (lower.includes("hook") || lower.includes("use")) return "hook";
  if (lower.includes("component") || lower.endsWith(".tsx") || lower.endsWith(".jsx")) return "component";
  if (lower.includes("util") || lower.includes("helper")) return "utility";
  if (lower.includes("service") || lower.includes("api")) return "service";
  if (lower.includes("reducer") || lower.includes("store")) return "state";
  if (lower.includes("style") || lower.endsWith(".css")) return "styles";
  if (lower.includes("readme") || lower.endsWith(".md")) return "documentation";
  
  return "general";
};

const extractKeyFunctions = (content: string): string[] => {
  const functions: string[] = [];
  
  // Match function declarations
  const funcMatches = content.match(/(?:export\s+)?(?:async\s+)?function\s+(\w+)/g) || [];
  funcMatches.forEach(match => {
    const name = match.replace(/(?:export\s+)?(?:async\s+)?function\s+/, "");
    if (name && !functions.includes(name)) functions.push(name);
  });
  
  // Match const functions
  const constMatches = content.match(/(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s*)?\(/g) || [];
  constMatches.forEach(match => {
    const name = match.replace(/(?:export\s+)?const\s+/, "").replace(/\s*=\s*(?:async\s*)?\(/, "");
    if (name && !functions.includes(name)) functions.push(name);
  });
  
  // Match arrow functions
  const arrowMatches = content.match(/(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/g) || [];
  arrowMatches.forEach(match => {
    const name = match.replace(/(?:export\s+)?const\s+/, "").replace(/\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/, "");
    if (name && !functions.includes(name)) functions.push(name);
  });
  
  return functions.slice(0, 5);
};

const extractMainConcepts = (content: string): string[] => {
  const concepts: string[] = [];
  
  if (content.includes("useState")) concepts.push("React State");
  if (content.includes("useEffect")) concepts.push("Side Effects");
  if (content.includes("useContext")) concepts.push("Context API");
  if (content.includes("useReducer")) concepts.push("State Reducer");
  if (content.includes("async") || content.includes("await")) concepts.push("Async Operations");
  if (content.includes("Promise")) concepts.push("Promises");
  if (content.includes("try") && content.includes("catch")) concepts.push("Error Handling");
  if (content.includes(".map(") || content.includes(".filter(")) concepts.push("Array Methods");
  if (content.includes("class ")) concepts.push("Classes");
  if (content.includes("interface ") || content.includes("type ")) concepts.push("TypeScript Types");
  if (content.includes("export")) concepts.push("Module Exports");
  if (content.includes("import")) concepts.push("Module Imports");
  
  return concepts.slice(0, 6);
};

export const analyzeFile = (
  fileName: string,
  content: string,
  skillLevel: SkillLevelType
): FileAnalysis => {
  const fileType = detectFileType(fileName, content);
  const keyFunctions = extractKeyFunctions(content);
  const mainConcepts = extractMainConcepts(content);
  
  let purpose = "";
  let whatToExpect: string[] = [];
  
  switch (fileType) {
    case "component":
      purpose = `This is a React component file that defines UI elements and their behavior.`;
      whatToExpect = [
        "React component definition (function or class)",
        "Props interface or prop destructuring",
        "JSX markup for rendering UI",
        "Event handlers and state management",
        "Styling or className assignments"
      ];
      break;
      
    case "hook":
      purpose = `This is a custom React Hook that encapsulates reusable logic.`;
      whatToExpect = [
        "Hook function starting with 'use'",
        "React hooks like useState, useEffect, useContext",
        "Custom logic and state management",
        "Return value with state and functions",
        "Possible side effects or data fetching"
      ];
      break;
      
    case "service":
      purpose = `This file contains API calls and data fetching logic.`;
      whatToExpect = [
        "API endpoint definitions",
        "Fetch or axios calls",
        "Request/response handling",
        "Error handling and retries",
        "Data transformation and parsing"
      ];
      break;
      
    case "utility":
      purpose = `This file contains helper functions and utilities used throughout the project.`;
      whatToExpect = [
        "Pure functions for common tasks",
        "Data transformation and formatting",
        "Validation and checking functions",
        "Constants and configuration",
        "Reusable logic shared across components"
      ];
      break;
      
    case "types":
      purpose = `This file defines TypeScript types and interfaces.`;
      whatToExpect = [
        "Interface definitions",
        "Type aliases",
        "Enum definitions",
        "Generic types",
        "Type exports for other files"
      ];
      break;
      
    case "state":
      purpose = `This file manages application state and data flow.`;
      whatToExpect = [
        "State reducer functions",
        "Action type definitions",
        "Initial state setup",
        "State update logic",
        "Context provider or store configuration"
      ];
      break;
      
    case "config":
      purpose = `This file contains configuration and setup code.`;
      whatToExpect = [
        "Configuration constants",
        "Environment variables",
        "Setup functions",
        "Default settings",
        "Build or runtime configuration"
      ];
      break;
      
    case "test":
      purpose = `This file contains unit tests or integration tests.`;
      whatToExpect = [
        "Test suite definitions",
        "Test cases and assertions",
        "Mock data and fixtures",
        "Setup and teardown functions",
        "Test utilities and helpers"
      ];
      break;
      
    default:
      purpose = `This file contains code that helps the application function.`;
      whatToExpect = [
        "Function or class definitions",
        "Logic and algorithms",
        "Data processing",
        "Module exports",
        "Integration with other parts of the app"
      ];
  }
  
  return {
    purpose,
    keyFunctions,
    whatToExpect,
    mainConcepts
  };
};

export const generateFileExplanation = (
  fileName: string,
  content: string,
  skillLevel: SkillLevelType
): string => {
  const analysis = analyzeFile(fileName, content, skillLevel);
  
  let explanation = "";
  
  if (skillLevel === "beginner") {
    explanation = `
## 📄 ${fileName}

**What is this file?**
${analysis.purpose}

**What you'll find here:**
${analysis.whatToExpect.map(item => `• ${item}`).join("\n")}

**Key things to look for:**
${analysis.mainConcepts.map(concept => `• **${concept}** - Look for this pattern in the code`).join("\n")}

${analysis.keyFunctions.length > 0 ? `
**Main functions in this file:**
${analysis.keyFunctions.map(func => `• \`${func}()\``).join(", ")}
` : ""}

**How to read this file:**
Start from the top and work your way down. Look for the main function or component definition, then explore how it uses other functions and data.
    `.trim();
  } else if (skillLevel === "intermediate") {
    explanation = `
## 📄 ${fileName}

**Purpose:**
${analysis.purpose}

**Structure & Patterns:**
${analysis.whatToExpect.map(item => `• ${item}`).join("\n")}

**Key Concepts:**
${analysis.mainConcepts.join(" • ")}

${analysis.keyFunctions.length > 0 ? `
**Exported Functions/Components:**
${analysis.keyFunctions.map(func => `• \`${func}()\``).join(", ")}
` : ""}

**Architecture Notes:**
This file follows standard patterns for ${detectFileType(fileName, content)} files. Pay attention to how it handles state, side effects, and data flow.
    `.trim();
  } else {
    explanation = `
## 📄 ${fileName}

**Purpose & Responsibility:**
${analysis.purpose}

**Implementation Details:**
${analysis.whatToExpect.map(item => `• ${item}`).join("\n")}

**Technical Concepts:**
${analysis.mainConcepts.join(" • ")}

${analysis.keyFunctions.length > 0 ? `
**Public API:**
${analysis.keyFunctions.map(func => `• \`${func}()\``).join(", ")}
` : ""}

**Design Considerations:**
Analyze the file for performance implications, memory usage, and architectural patterns. Consider how this module integrates with the rest of the system and potential optimization opportunities.
    `.trim();
  }
  
  return explanation;
};
