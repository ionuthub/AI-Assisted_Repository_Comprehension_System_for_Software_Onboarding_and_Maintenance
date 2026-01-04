import type { Project } from "@/types/project";

export interface ProjectOverview {
  projectType: string;
  description: string;
  frameworks: string[];
  keyFeatures: string[];
  whyThisFramework: string;
  beginnerFriendly: boolean;
  difficulty: "easy" | "medium" | "hard";
  explanation: string[];
  learningPath: { day: string; goal: string; focus: string[] }[];
}

const detectProjectType = (files: string[], packageJson?: any): string => {
  const fileContent = files.join(" ").toLowerCase();

  // Web frameworks
  if (packageJson?.dependencies?.react || fileContent.includes("react")) {
    return "React Web App";
  }
  if (packageJson?.dependencies?.vue || fileContent.includes("vue")) {
    return "Vue Web App";
  }
  if (packageJson?.dependencies?.angular || fileContent.includes("angular")) {
    return "Angular Web App";
  }
  if (packageJson?.dependencies?.next || fileContent.includes("next")) {
    return "Next.js Full-Stack App";
  }
  if (packageJson?.dependencies?.svelte || fileContent.includes("svelte")) {
    return "Svelte Web App";
  }

  // Backend
  if (packageJson?.dependencies?.express || fileContent.includes("express")) {
    return "Node.js Express Server";
  }
  if (packageJson?.dependencies?.fastapi || fileContent.includes("fastapi")) {
    return "Python FastAPI Server";
  }
  if (packageJson?.dependencies?.django || fileContent.includes("django")) {
    return "Django Web Application";
  }

  // Mobile
  if (fileContent.includes("react native")) {
    return "React Native Mobile App";
  }
  if (fileContent.includes("flutter")) {
    return "Flutter Mobile App";
  }

  // Default
  if (fileContent.includes(".tsx") || fileContent.includes(".jsx")) {
    return "React Application";
  }
  if (fileContent.includes(".ts") || fileContent.includes(".js")) {
    return "JavaScript Application";
  }
  if (fileContent.includes(".py")) {
    return "Python Application";
  }

  return "Web Application";
};

const getFrameworkExplanation = (projectType: string): { frameworks: string[]; why: string } => {
  const explanations: Record<string, { frameworks: string[]; why: string }> = {
    "React Web App": {
      frameworks: ["React", "JavaScript/TypeScript"],
      why: "React is used because it makes building interactive websites easier. It lets you create reusable pieces (called components) that update automatically when data changes. Think of it like LEGO blocks - you build small pieces and combine them to make something bigger."
    },
    "Vue Web App": {
      frameworks: ["Vue", "JavaScript"],
      why: "Vue is a beginner-friendly framework that makes building interactive websites simple. It's easier to learn than React and has clear documentation. It helps you organize your code into small, reusable pieces."
    },
    "Angular Web App": {
      frameworks: ["Angular", "TypeScript"],
      why: "Angular is a complete framework for building large, complex web applications. It provides everything you need in one package. It's used by big companies for enterprise applications."
    },
    "Next.js Full-Stack App": {
      frameworks: ["Next.js", "React", "Node.js"],
      why: "Next.js combines React (frontend) with Node.js (backend) in one project. This means you can build both the user interface AND the server logic in the same codebase. It's great for learning full-stack development."
    },
    "Svelte Web App": {
      frameworks: ["Svelte", "JavaScript"],
      why: "Svelte is a newer, simpler framework that compiles your code to pure JavaScript. It's very beginner-friendly and produces smaller, faster websites than other frameworks."
    },
    "Node.js Express Server": {
      frameworks: ["Node.js", "Express"],
      why: "Express is a simple framework for building servers with JavaScript. It handles requests from websites and sends back data. It's perfect for beginners learning backend development."
    },
    "Python FastAPI Server": {
      frameworks: ["Python", "FastAPI"],
      why: "FastAPI is a modern Python framework for building APIs (backend servers). It's fast, easy to learn, and has great documentation. Python is known for being beginner-friendly."
    },
    "Django Web Application": {
      frameworks: ["Python", "Django"],
      why: "Django is a complete Python framework that includes everything for building websites. It's used by Instagram, Spotify, and other big companies. It's great for learning professional web development."
    },
    "React Native Mobile App": {
      frameworks: ["React Native", "JavaScript"],
      why: "React Native lets you build mobile apps using JavaScript and React. You can write code once and run it on both iPhone and Android. It's great for learning mobile development."
    },
    "Flutter Mobile App": {
      frameworks: ["Flutter", "Dart"],
      why: "Flutter is Google's framework for building beautiful mobile apps. It uses Dart language and is very beginner-friendly. You can build for iOS and Android with one codebase."
    }
  };

  return explanations[projectType] || {
    frameworks: ["JavaScript/TypeScript"],
    why: "This project uses modern web technologies to build interactive applications."
  };
};

const getKeyFeatures = (files: string[], projectType: string): string[] => {
  const features: string[] = [];

  if (files.some(f => f.includes("package.json"))) {
    features.push("Uses npm packages for dependencies");
  }
  if (files.some(f => f.includes("tsconfig"))) {
    features.push("Uses TypeScript for type safety");
  }
  if (files.some(f => f.includes("tailwind") || files.some(f => f.includes("css")))) {
    features.push("Has styling with CSS or Tailwind");
  }
  if (files.some(f => f.includes("test") || f.includes("spec"))) {
    features.push("Includes automated tests");
  }
  if (files.some(f => f.includes("docker"))) {
    features.push("Can run in Docker containers");
  }
  if (files.some(f => f.includes("api") || f.includes("server"))) {
    features.push("Has backend API endpoints");
  }
  if (files.some(f => f.includes("database") || f.includes("db"))) {
    features.push("Uses a database");
  }
  if (files.some(f => f.includes("auth") || f.includes("login"))) {
    features.push("Has user authentication");
  }

  return features.length > 0 ? features : ["Standard project structure"];
};

const getDifficulty = (projectType: string, fileCount: number): "easy" | "medium" | "hard" => {
  if (projectType.includes("Next.js") || projectType.includes("Angular") || projectType.includes("Django")) {
    return "hard";
  }
  if (projectType.includes("Express") || projectType.includes("FastAPI")) {
    return "medium";
  }
  if (fileCount > 20) {
    return "hard";
  }
  if (fileCount > 10) {
    return "medium";
  }
  return "easy";
};

export const analyzeProject = (project: Project): ProjectOverview => {
  const filePaths = project.files.map(f => f.path);
  const packageJsonFile = project.files.find(f => f.path === "package.json");
  const packageJson = packageJsonFile?.content ? JSON.parse(packageJsonFile.content) : null;

  const projectType = detectProjectType(filePaths, packageJson);
  const { frameworks, why: whyFramework } = getFrameworkExplanation(projectType);
  const keyFeatures = getKeyFeatures(filePaths, projectType);
  const difficulty = getDifficulty(projectType, filePaths.length);

  const description = `This is a ${projectType} project. It has ${project.files.length} code files.`;

  const explanation = [
    `📦 **Project Type**: ${projectType}`,
    ``,
    `**What is this?**`,
    `This project is a ${projectType.toLowerCase()}. It's designed to ${getProjectPurpose(projectType)}.`,
    ...(project.summary.source === 'generated' ? [
      ``,
      `⚠️ **Note (Proof of Concept)**:`,
      `This is a starter template generated to demonstrate the project structure and best practices for your idea.`,
      `It contains the core configuration and a sample UI component, but does **not** contain the full implementation of the business logic.`
    ] : []),
    ``,
    `**Why use ${frameworks[0]}?**`,
    whyFramework,
    ``,
    `**Key Technologies:**`,
    ...frameworks.map(f => `• ${f}`),
    ``,
    `**What's Inside:**`,
    ...keyFeatures.map(f => `• ${f}`),
    ``,
    `**Difficulty Level:** ${difficulty === "easy" ? "🟢 Beginner-Friendly" : difficulty === "medium" ? "🟡 Intermediate" : "🔴 Advanced"}`,
    ``,
    `**How to Get Started:**`,
    `1. Read the README.md file to understand the project`,
    `2. Look at the main files to see how the code is organized`,
    `3. Click on individual lines to get explanations`,
    `4. Try running the project locally to see it in action`
  ];

  const learningPath = [
    {
      day: "Day 1: The Core",
      goal: "Understand the skeleton and entry points.",
      focus: filePaths.filter(p => p.includes("index") || p.includes("App") || p.includes("main")).slice(0, 3)
    },
    {
      day: "Day 2: Logic & Data",
      goal: "Dive into how the app handles information.",
      focus: filePaths.filter(p => !p.includes("css") && !p.includes("index") && (p.includes("lib") || p.includes("utils") || p.includes("store"))).slice(0, 3)
    },
    {
      day: "Day 3: UI & UX",
      goal: "Explore the visual components and user flow.",
      focus: filePaths.filter(p => p.includes("component") || p.includes("page")).slice(0, 3)
    }
  ];

  return {
    projectType,
    description,
    frameworks,
    keyFeatures,
    whyThisFramework: whyFramework,
    beginnerFriendly: difficulty === "easy",
    difficulty,
    explanation,
    learningPath
  };
};

const getProjectPurpose = (projectType: string): string => {
  const purposes: Record<string, string> = {
    "React Web App": "create interactive user interfaces for websites",
    "Vue Web App": "build responsive and interactive web applications",
    "Angular Web App": "develop large-scale enterprise web applications",
    "Next.js Full-Stack App": "build complete web applications with frontend and backend",
    "Svelte Web App": "create fast and lightweight web applications",
    "Node.js Express Server": "handle requests and serve data to web applications",
    "Python FastAPI Server": "provide APIs for mobile and web applications",
    "Django Web Application": "build complete web applications with Python",
    "React Native Mobile App": "create mobile apps for iOS and Android",
    "Flutter Mobile App": "build beautiful mobile applications"
  };

  return purposes[projectType] || "build web applications";
};
