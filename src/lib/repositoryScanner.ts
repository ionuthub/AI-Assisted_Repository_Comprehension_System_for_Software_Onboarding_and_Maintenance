import { ProjectFile } from "@/types/project";
import { inferLanguageFromFilename } from "./languages";

export interface FolderNode {
  name: string;
  path: string;
  type: "folder" | "file";
  size?: number;
  language?: string | null;
  children?: FolderNode[];
}

export interface TechStackItem {
  name: string;
  category: "frontend" | "backend" | "language" | "styling" | "database" | "tooling" | "other";
  description: string;
  whyUsed: string;
}

export interface RepositoryScanResult {
  fileCount: number;
  totalSize: number;
  languages: Record<string, { count: number; size: number }>;
  techStack: TechStackItem[];
  keyFiles: { path: string; purpose: string }[];
  folderTree: FolderNode;
  complexityScore: "easy" | "medium" | "hard";
  architectureSummary: string;
}

const TECH_SIGNATURES: {
  name: string;
  category: TechStackItem["category"];
  description: string;
  whyUsed: string;
  dependencyKeywords?: string[];
  filePattern?: RegExp;
  contentKeywords?: string[];
}[] = [
  {
    name: "React",
    category: "frontend",
    description: "A popular open-source JavaScript library for building user interfaces.",
    whyUsed: "React allows developers to build complex, interactive UIs using modular, reusable puzzle pieces called components. It manages visual rendering efficiently through a Virtual DOM.",
    dependencyKeywords: ["react", "react-dom"],
    filePattern: /\.(jsx|tsx)$/
  },
  {
    name: "Next.js",
    category: "frontend",
    description: "A server-side React framework that handles routing, rendering, and API routes.",
    whyUsed: "Next.js is used to build production-grade React apps with server-side rendering, search engine optimization (SEO), and simplified routing out-of-the-box.",
    dependencyKeywords: ["next"],
    filePattern: /next\.config\.(js|mjs|ts)/
  },
  {
    name: "Vue",
    category: "frontend",
    description: "A progressive, approachable JavaScript framework for building user interfaces.",
    whyUsed: "Vue provides an intuitive template syntax and reactivity model. It is easier to pick up than React for beginners while remaining powerful enough for large projects.",
    dependencyKeywords: ["vue"],
    filePattern: /\.vue$/
  },
  {
    name: "Angular",
    category: "frontend",
    description: "A comprehensive, TypeScript-based framework for building client web apps.",
    whyUsed: "Angular provides a strictly structured, batteries-included environment (routing, client utilities, state) making it ideal for robust, enterprise-grade applications.",
    dependencyKeywords: ["@angular/core"],
    filePattern: /angular\.json/
  },
  {
    name: "Svelte",
    category: "frontend",
    description: "A modern compiler that converts UI components into tiny, vanilla JavaScript.",
    whyUsed: "Unlike React or Vue, Svelte doesn't run a virtual DOM library at runtime. Instead, it compiles code down to pure DOM manipulations, resulting in ultra-fast page speeds.",
    dependencyKeywords: ["svelte"],
    filePattern: /\.svelte$/
  },
  {
    name: "Express",
    category: "backend",
    description: "A minimal and flexible Node.js web application server-side framework.",
    whyUsed: "Express is the standard foundation for Node servers, providing quick route handling, middleware pipelines, and server responses.",
    dependencyKeywords: ["express"]
  },
  {
    name: "FastAPI",
    category: "backend",
    description: "A high-performance Python framework for building REST APIs based on type hints.",
    whyUsed: "FastAPI is extremely fast, automatically generates interactive API documentation (Swagger/OpenAPI), and enforces Python type safety.",
    dependencyKeywords: ["fastapi"],
    contentKeywords: ["FastAPI", "import fastapi"]
  },
  {
    name: "Django",
    category: "backend",
    description: "A high-level Python web framework that encourages rapid, structured development.",
    whyUsed: "Django is a 'batteries-included' framework with an integrated admin portal, Object-Relational Mapper (ORM), and authentication systems pre-configured.",
    dependencyKeywords: ["django"],
    filePattern: /manage\.py/
  },
  {
    name: "Flask",
    category: "backend",
    description: "A lightweight WSGI web application framework in Python.",
    whyUsed: "Flask is a micro-framework, meaning it leaves database configurations, form validations, and layouts up to the developer, offering maximum architectural freedom.",
    dependencyKeywords: ["flask"],
    contentKeywords: ["import Flask", "from flask import"]
  },
  {
    name: "TypeScript",
    category: "language",
    description: "A strongly typed programming language that builds on top of JavaScript.",
    whyUsed: "TypeScript prevents logic and syntax bugs before compilation by enforcing data types. It speeds up onboarding by making files self-documenting.",
    dependencyKeywords: ["typescript"],
    filePattern: /tsconfig\.json/
  },
  {
    name: "Python",
    category: "language",
    description: "An interpreted, high-level, general-purpose coding language known for readability.",
    whyUsed: "Python is readable, beginner-friendly, and supports machine learning, scripting, backend, and data science workflows.",
    filePattern: /\.py$/
  },
  {
    name: "Tailwind CSS",
    category: "styling",
    description: "A utility-first CSS framework for rapid UI styling.",
    whyUsed: "Tailwind eliminates writing custom CSS classes by providing pre-packaged utility utility classes (like `flex`, `pt-4`, `shadow-lg`) directly inside markup code.",
    dependencyKeywords: ["tailwindcss"],
    filePattern: /tailwind\.config\.(js|ts)/
  },
  {
    name: "Supabase",
    category: "database",
    description: "An open-source Firebase alternative providing databases, auth, and edge functions.",
    whyUsed: "Supabase handles backend infrastructure (PostgreSQL database, user authentication, and real-time listeners) without needing a custom custom backend API server.",
    dependencyKeywords: ["@supabase/supabase-js"],
    filePattern: /supabase\/config\.toml/
  },
  {
    name: "Firebase",
    category: "database",
    description: "Google's app development platform for databases, analytics, and messaging.",
    whyUsed: "Firebase delivers real-time NoSQL storage (Firestore), quick authentication setups, and cloud hosting with minimal custom configuration.",
    dependencyKeywords: ["firebase"],
    filePattern: /firebase\.json/
  },
  {
    name: "Zustand",
    category: "tooling",
    description: "A small, fast, and scalable barebones state-management solution for React.",
    whyUsed: "Zustand avoids React's complex boilerplate (like Redux) by offering a hook-based state store with simple actions and minimal rendering side-effects.",
    dependencyKeywords: ["zustand"]
  },
  {
    name: "Vite",
    category: "tooling",
    description: "A modern, ultra-fast frontend build tool and dev server.",
    whyUsed: "Vite uses native ES modules to compile code changes instantaneously, providing a faster development experience than traditional build tools like Webpack.",
    dependencyKeywords: ["vite"],
    filePattern: /vite\.config\.(js|ts)/
  },
  {
    name: "Docker",
    category: "tooling",
    description: "A platform for containerizing applications to run consistently anywhere.",
    whyUsed: "Docker packages code, runtimes, and system configurations into a single image, ensuring the project executes exactly the same on a local machine as in production.",
    filePattern: /Dockerfile|\.dockerignore/
  }
];

const KEY_FILE_RULES: { pattern: RegExp; purpose: string }[] = [
  { pattern: /^package\.json$/, purpose: "Project dependencies and scripts configuration" },
  { pattern: /^tsconfig\.json$/, purpose: "TypeScript compiler options and configuration" },
  { pattern: /^vite\.config\.(ts|js)$/, purpose: "Vite build tool and development server configuration" },
  { pattern: /^tailwind\.config\.(ts|js)$/, purpose: "Tailwind CSS styling configuration and theme rules" },
  { pattern: /^index\.html$/, purpose: "Main HTML entry point for the web application" },
  { pattern: /^src\/main\.(tsx|ts|jsx|js)$/, purpose: "Main JavaScript entry point that boots the React app" },
  { pattern: /^src\/App\.(tsx|ts|jsx|js)$/, purpose: "Root UI Component containing primary layouts and routes" },
  { pattern: /^requirements\.txt$/, purpose: "Python dependencies configuration list" },
  { pattern: /^manage\.py$/, purpose: "Django administrative task controller and entry point" },
  { pattern: /^app\.py$/, purpose: "Main Flask backend server entry point" },
  { pattern: /^main\.py$/, purpose: "Main Python execution entry point" },
  { pattern: /^next\.config\.(js|mjs|ts)$/, purpose: "Next.js routing, image loader, and build configuration" },
  { pattern: /^src\/index\.css$/, purpose: "Global CSS rules and styling variables setup" },
  { pattern: /^\.env\.example$/, purpose: "Template specifying required environment variables" }
];

export const buildFolderTree = (files: ProjectFile[]): FolderNode => {
  const root: FolderNode = { name: "Root", path: "", type: "folder", children: [] };

  files.forEach(file => {
    const parts = file.path.split('/').filter(Boolean);
    let current = root;

    parts.forEach((part, index) => {
      const isLast = index === parts.length - 1;
      const currentPath = parts.slice(0, index + 1).join('/');

      if (!current.children) {
        current.children = [];
      }

      let existingNode = current.children.find(child => child.name === part);

      if (!existingNode) {
        existingNode = {
          name: part,
          path: currentPath,
          type: isLast ? "file" : "folder",
          size: isLast ? (file.size ?? 0) : undefined,
          language: isLast ? file.language : undefined,
          children: isLast ? undefined : []
        };
        current.children.push(existingNode);
      }

      current = existingNode;
    });
  });

  const sortTree = (node: FolderNode) => {
    if (node.children) {
      node.children.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === "folder" ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
      node.children.forEach(sortTree);
    }
  };

  sortTree(root);
  return root;
};

export const scanRepository = (files: ProjectFile[]): RepositoryScanResult => {
  const fileCount = files.length;
  let totalSize = 0;
  const languages: Record<string, { count: number; size: number }> = {};
  const techStack: TechStackItem[] = [];
  const keyFiles: { path: string; purpose: string }[] = [];

  // Parse package.json dependencies
  const packageJsonFile = files.find(f => f.path === "package.json" || f.path.endsWith("/package.json"));
  let dependencies: string[] = [];
  if (packageJsonFile?.content) {
    try {
      const parsed = JSON.parse(packageJsonFile.content);
      const deps = {
        ...(parsed.dependencies || {}),
        ...(parsed.devDependencies || {})
      };
      dependencies = Object.keys(deps);
    } catch (e) {
      console.warn("Failed to parse package.json dependencies for scanning", e);
    }
  }

  // Parse requirements.txt lines
  const requirementsFile = files.find(f => f.path === "requirements.txt" || f.path.endsWith("/requirements.txt"));
  let pythonDependencies: string[] = [];
  if (requirementsFile?.content) {
    pythonDependencies = requirementsFile.content
      .split(/\r?\n/)
      .map(line => line.split("==")[0].trim().toLowerCase())
      .filter(Boolean);
  }

  const allDeps = [...dependencies, ...pythonDependencies];

  // Detect frameworks/technologies
  TECH_SIGNATURES.forEach(sig => {
    let detected = false;

    // Rule 1: Check dependencies list
    if (sig.dependencyKeywords && sig.dependencyKeywords.some(keyword => allDeps.includes(keyword))) {
      detected = true;
    }

    // Rule 2: Check file extensions/names pattern
    if (!detected && sig.filePattern) {
      detected = files.some(file => sig.filePattern!.test(file.path));
    }

    // Rule 3: Check contents keyword matching (sample first few lines of files to keep client performance fast)
    if (!detected && sig.contentKeywords) {
      detected = files.some(file => {
        if (!file.content) return false;
        const textSample = file.content.slice(0, 1000);
        return sig.contentKeywords!.some(kw => textSample.includes(kw));
      });
    }

    if (detected) {
      techStack.push({
        name: sig.name,
        category: sig.category,
        description: sig.description,
        whyUsed: sig.whyUsed
      });
    }
  });

  // Calculate languages and key files
  files.forEach(file => {
    const size = file.size ?? 0;
    totalSize += size;

    // Count language
    const lang = file.language || inferLanguageFromFilename(file.path) || "Unknown";
    if (!languages[lang]) {
      languages[lang] = { count: 0, size: 0 };
    }
    languages[lang].count += 1;
    languages[lang].size += size;

    // Detect Key Files
    const relativeFilename = file.path.replace(/\\/g, '/'); // normalize slashes
    const match = KEY_FILE_RULES.find(rule => rule.pattern.test(relativeFilename));
    if (match) {
      keyFiles.push({
        path: file.path,
        purpose: match.purpose
      });
    }
  });

  // Sort key files: entry points first, configs later
  keyFiles.sort((a, b) => {
    const aVal = a.path.includes("main") || a.path.includes("App") || a.path.includes("index") ? 0 : 1;
    const bVal = b.path.includes("main") || b.path.includes("App") || b.path.includes("index") ? 0 : 1;
    return aVal - bVal;
  });

  // Folder Tree
  const folderTree = buildFolderTree(files);

  // Compute overall complexity level
  let complexityScore: "easy" | "medium" | "hard" = "easy";
  if (fileCount > 30 || totalSize > 1024 * 1024) {
    complexityScore = "hard";
  } else if (fileCount > 10 || totalSize > 150 * 1024) {
    complexityScore = "medium";
  }

  // Build a smart architecture summary text
  const primaryLang = Object.entries(languages)
    .sort((a, b) => b[1].count - a[1].count)[0]?.[0] || "Unknown Language";
  
  const frontendTechs = techStack.filter(t => t.category === "frontend").map(t => t.name).join(", ");
  const backendTechs = techStack.filter(t => t.category === "backend").map(t => t.name).join(", ");

  let archSummary = `This repository is written in **${primaryLang}**. It consists of **${fileCount}** files spanning **${(totalSize / 1024).toFixed(1)} KB** of code.`;
  
  if (frontendTechs) {
    archSummary += ` The frontend interface is powered by **${frontendTechs}**.`;
  }
  if (backendTechs) {
    archSummary += ` The backend server features **${backendTechs}**.`;
  }
  
  if (techStack.some(t => t.name === "Tailwind CSS")) {
    archSummary += ` User styling is modularly configured via utility-first **Tailwind CSS**.`;
  }
  if (techStack.some(t => t.name === "TypeScript")) {
    archSummary += ` Type definitions and strict parameters are enforced using **TypeScript**.`;
  }
  
  archSummary += ` The workspace structure displays folder layouts configured for standard deployment builds.`;

  return {
    fileCount,
    totalSize,
    languages,
    techStack,
    keyFiles,
    folderTree,
    complexityScore,
    architectureSummary: archSummary
  };
};
