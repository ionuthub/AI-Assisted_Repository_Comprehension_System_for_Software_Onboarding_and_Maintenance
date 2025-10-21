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

const createFiles = (idea: string, skillLevel: "beginner" | "intermediate" | "advanced"): ProjectFile[] => {
  const componentName = toPascalCase(idea) || "Hero";
  const hookName = `use${componentName}`;

  const readme = `# ${toTitleCase(idea)}\n\nThis project was generated locally based on the idea: **${idea.trim()}**.\n\n## Getting Started\n\n- Install dependencies with \`npm install\`\n- Run the development server with \`npm run dev\`\n- Open http://localhost:5173 to view it\n\n## Features\n\n- Focused on ${skillLevel}-level developers\n- Includes a reusable React component and a custom hook\n`;

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

  return [
    { path: "README.md", language: "Markdown", content: readme },
    { path: "src/main.tsx", language: "TypeScript", content: main },
    { path: `src/${componentName}.tsx`, language: "TypeScript", content: component },
    { path: `src/${hookName}.ts`, language: "TypeScript", content: hook },
    { path: "src/styles.css", language: "CSS", content: styles },
  ];
};

export const generateProject = (
  idea: string,
  skillLevel: "beginner" | "intermediate" | "advanced"
): Project => ({
  summary: createSummary(idea, skillLevel),
  files: createFiles(idea, skillLevel),
});
