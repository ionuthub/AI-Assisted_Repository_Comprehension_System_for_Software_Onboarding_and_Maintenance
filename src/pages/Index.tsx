import { useMemo, useRef, useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { motion } from "framer-motion";
import { Code2, ExternalLink, Heart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SkillSelector from "@/components/SkillSelector";
import CodeViewer from "@/components/CodeViewer";
import ExplanationPanel from "@/components/ExplanationPanel";
import FileNavigator from "@/components/FileNavigator";
import ProjectOverviewComponent from "@/components/ProjectOverview";
import ErrorBoundary from "@/components/ErrorBoundary";
import GitHubTab from "@/components/tabs/GitHubTab";
import GenerateTab from "@/components/tabs/GenerateTab";
import UploadTab from "@/components/tabs/UploadTab";
import type { Project, ProjectFile } from "@/types/project";
import { fetchRepositoryProject, fetchFileContent } from "@/lib/github";
import { generateProject } from "@/lib/generation";
import { generateW3SchoolsExplanation, generateW3SchoolsFileExplanation, generateBlockExplanation } from "@/lib/w3schoolsExplainer";
import { detectCodeBlock } from "@/lib/blockDetector";
import { analyzeProject } from "@/lib/projectAnalyzer";
import { useToast } from "@/hooks/use-toast";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { TAB_MODES, SKILL_LEVELS, ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants/appConstants";
import type { SkillLevel, TabMode } from "@/constants/appConstants";
import SEO from "@/components/SEO";

const inferLanguageFromFilename = (fileName: string): string | null => {
  const extension = fileName.split(".").pop()?.toLowerCase();
  if (!extension) {
    return null;
  }

  const map: Record<string, string> = {
    ts: "TypeScript",
    tsx: "TypeScript",
    js: "JavaScript",
    jsx: "JavaScript",
    py: "Python",
    rs: "Rust",
    rb: "Ruby",
    go: "Go",
    java: "Java",
    cs: "C#",
    php: "PHP",
    swift: "Swift",
    kt: "Kotlin",
    m: "Objective-C",
    cpp: "C++",
    c: "C",
    h: "C",
    hs: "Haskell",
    scala: "Scala",
    sql: "SQL",
    md: "Markdown",
    json: "JSON",
    yml: "YAML",
    yaml: "YAML",
    html: "HTML",
    css: "CSS"
  };

  return map[extension] ?? null;
};

const detectCodePattern = (line: string): { type: string; description: string } => {
  const trimmed = line.trim();

  // Assignment patterns
  if (/^(const|let|var)\s+\w+\s*=/.test(trimmed)) {
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

const buildLineExplanation = (
  content: string,
  lineNumber: number,
  skillLevel: SkillLevel,
  fileName: string = "code.js"
): string => {
  // Use W3Schools-style explanations
  return generateW3SchoolsExplanation(content, lineNumber, skillLevel, fileName);
};

const estimateCodeComplexity = (line: string): "simple" | "complex" => {
  // Simple patterns: basic assignments, simple function calls, returns
  const simplePatterns = [
    /^(const|let|var)\s+\w+\s*=\s*[^{\[\(]*$/,  // Simple assignment
    /^return\s+[^{\[\(]*$/,                        // Simple return
    /^\w+\s*=\s*[^{\[\(]*$/,                      // Simple reassignment
    /^if\s*\([^{]*\)\s*$/,                        // Simple condition
    /^\}\s*$/,                                     // Closing brace
    /^\{\s*$/,                                     // Opening brace
  ];

  const isSimple = simplePatterns.some(pattern => pattern.test(line));
  return isSimple ? "simple" : "complex";
};

const fetchAIExplanation = async (
  code: string,
  skillLevel: SkillLevel
): Promise<string> => {
  // In development, try serverless function first (for Vercel preview)
  // In production, serverless function will be used
  if (!import.meta.env.DEV) {
    try {
      const response = await fetch('/api/explain-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code,
          skillLevel
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.explanation) {
          return data.explanation;
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn(`Serverless function failed with status ${response.status}:`, errorData);
      }
    } catch (error) {
      console.warn("Serverless function failed, trying direct API:", error);
    }
  }

  // Try direct Gemini API call (for local development)
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (geminiKey) {
    try {
      console.log("Calling Gemini API directly");

      // Enhanced skill-based prompts with structured output
      const skillPrompts: Record<string, string> = {
        beginner: `You are a friendly coding tutor explaining code to a beginner. Structure your explanation as follows:

**What it does:**
Explain in simple, everyday language what this code accomplishes.

**How it works:**
Break down the logic step-by-step using analogies (like recipes, instructions, or everyday tasks).

**Key concepts:**
List 2-3 programming concepts used here (like variables, functions, loops) with brief, jargon-free explanations.

**Real-world example:**
Give a relatable example of where this pattern is used in real applications.`,

        intermediate: `You are an experienced developer explaining code to an intermediate programmer. Structure your explanation as follows:

**Purpose:**
Clearly state what this code does and its role in the larger system.

**Implementation:**
Explain the approach, patterns, and techniques used.

**Best practices:**
Highlight any design patterns, coding standards, or best practices demonstrated.

**Things to note:**
Point out important details, edge cases, or potential gotchas.

**Related concepts:**
Mention related programming concepts or patterns they should know.`,

        advanced: `You are a senior architect reviewing code. Provide a technical analysis structured as follows:

**Architecture & Design:**
Analyze the design decisions, patterns, and architectural implications.

**Performance & Optimization:**
Discuss time/space complexity, performance characteristics, and optimization opportunities.

**Trade-offs:**
Explain the trade-offs made in this implementation and alternative approaches.

**Production considerations:**
Cover scalability, maintainability, testing, and potential issues in production.

**Improvements:**
Suggest specific refactoring or enhancement opportunities.`
      };

      const prompt = `${skillPrompts[skillLevel] || skillPrompts.beginner}\n\nCode to explain:\n\`\`\`\n${code}\n\`\`\`\n\nProvide a clear, well-structured explanation following the format above.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1200,
            }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const explanation = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (explanation) {
          console.log("✅ Gemini API success");
          return explanation;
        }
      } else {
        const error = await response.text();
        console.error("Gemini API error:", response.status, error);
      }
    } catch (error) {
      console.error("Direct Gemini API failed:", error);
    }
  }

  // Fall back to mock API
  console.log("Using mock API fallback");
  try {
    const { mockExplainCode } = await import('@/lib/mockApi');
    return mockExplainCode(code, skillLevel);
  } catch (mockError) {
    console.error("Mock API also failed:", mockError);
    throw new Error("Unable to generate explanation");
  }
};

import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [mode, setMode] = useState<TabMode>(TAB_MODES.GITHUB);
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(SKILL_LEVELS.BEGINNER);
  const [repoUrl, setRepoUrl] = useState("");
  const [projectIdea, setProjectIdea] = useState("");
  const [uploadedFolderName, setUploadedFolderName] = useState<string | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [fileCache, setFileCache] = useState<Record<string, ProjectFile>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [selectedLines, setSelectedLines] = useState<Set<number>>(new Set());
  const [lineExplanation, setLineExplanation] = useState<string | null>(null);
  const [fileExplanation, setFileExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const [githubToken, setGithubToken] = useState<string | null>(null);
  const [manualGithubToken, setManualGithubToken] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const getGithubToken = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('github_access_token')
          .eq('id', session.user.id)
          .single();

        if (data?.github_access_token) {
          setGithubToken(data.github_access_token);
        }
      }
    };
    getGithubToken();
  }, []);

  const displayedFiles = useMemo(() => {
    if (!project) return [];
    return project.files.map((file) => {
      const cached = fileCache[file.path];
      return cached ? { ...file, ...cached } : file;
    });
  }, [project, fileCache]);

  const selectedFileEntry = selectedFile
    ? displayedFiles.find((file) => file.path === selectedFile) ?? null
    : null;

  const currentFileContent = selectedFileEntry?.content ?? null;

  const resetInteractionState = () => {
    setSelectedLine(null);
    setSelectedLines(new Set());
    setLineExplanation(null);
  };

  const handleFolderInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (!files || files.length === 0) {
      setProject(null);
      setUploadedFolderName(null);
      setFileCache({});
      setSelectedFile(null);
      setFileExplanation(null);
      toast({
        title: "No files selected",
        description: "Pick a folder to analyze.",
        variant: "destructive"
      });
      return;
    }

    resetInteractionState();
    setIsFileLoading(true);

    try {
      const fileArray = Array.from(files);
      const firstFile = fileArray[0] as File & { webkitRelativePath?: string };
      const folderName = firstFile.webkitRelativePath?.split("/")?.[0] ?? "Uploaded Folder";

      const folderFiles: ProjectFile[] = await Promise.all(
        fileArray.map(async (file) => {
          const extendedFile = file as File & { webkitRelativePath?: string };
          const relativePath = extendedFile.webkitRelativePath ?? file.name;
          const content = await file.text();

          return {
            path: relativePath,
            language: inferLanguageFromFilename(file.name),
            size: file.size ?? null,
            content
          };
        })
      );

      const cache: Record<string, ProjectFile> = {};
      folderFiles.forEach((file) => {
        if (file.content) {
          cache[file.path] = file;
        }
      });

      setUploadedFolderName(folderName);
      setProject({
        summary: {
          name: folderName,
          description: `Local folder upload: ${folderName}`,
          source: "uploaded",
          language: null
        },
        files: folderFiles
      });
      setFileCache(cache);

      const firstFileWithContent = folderFiles.find((file) => file.content);
      if (firstFileWithContent) {
        setSelectedFile(firstFileWithContent.path);
        const explanation = generateW3SchoolsFileExplanation(
          firstFileWithContent.path,
          firstFileWithContent.content ?? "",
          skillLevel
        );
        setFileExplanation(explanation);
      } else {
        setSelectedFile(null);
        setFileExplanation(null);
      }
    } catch (error) {
      console.error("Error processing uploaded folder:", error);
      setProject(null);
      setUploadedFolderName(null);
      setFileCache({});
      setSelectedFile(null);
      setFileExplanation(null);
      const message = error instanceof Error ? error.message : "Failed to process folder.";
      toast({
        title: "Upload failed",
        description: message,
        variant: "destructive"
      });
    } finally {
      setIsFileLoading(false);
      if (folderInputRef.current) {
        folderInputRef.current.value = "";
      }
    }
  };

  const handleAnalyze = async () => {
    resetInteractionState();

    if (mode === "github" && !repoUrl.trim()) {
      toast({
        title: "Repository required",
        description: "Enter a public GitHub repository URL to continue.",
        variant: "destructive"
      });
      return;
    }

    if (mode === "generate" && !projectIdea.trim()) {
      toast({
        title: "Idea required",
        description: "Describe the project you would like to generate.",
        variant: "destructive"
      });
      return;
    }

    if (mode === "upload" && !project) {
      toast({
        title: "Folder required",
        description: "Upload a folder to continue.",
        variant: "destructive"
      });
      return;
    }

    if (mode === "upload") {
      if (!project || project.files.length === 0) {
        toast({
          title: "No files found",
          description: "Upload a folder with supported files to analyze.",
          variant: "destructive"
        });
        return;
      }

      if (!selectedFile && project.files.length > 0) {
        setSelectedFile(project.files[0].path);
      }

      const fileToExplain = selectedFile
        ? project.files.find((file) => file.path === selectedFile)
        : project.files.find((file) => file.content);

      if (fileToExplain?.content) {
        const explanation = generateW3SchoolsFileExplanation(fileToExplain.path, fileToExplain.content, skillLevel);
        setFileExplanation(explanation);
      }

      toast({
        title: "Folder ready",
        description: uploadedFolderName
          ? `${uploadedFolderName} is uploaded and ready to explore.`
          : "Uploaded folder processed successfully."
      });
      return;
    }

    setIsLoading(true);
    setIsFileLoading(false);
    setProject(null);
    setFileCache({});
    setSelectedFile(null);

    try {
      if (mode === "github") {
        const nextProject = await fetchRepositoryProject(repoUrl.trim(), manualGithubToken || githubToken);
        setProject(nextProject);
        if (nextProject.files.length > 0) {
          setSelectedFile(nextProject.files[0].path);
        }
        toast({
          title: "Repository loaded",
          description: `${nextProject.summary.owner}/${nextProject.summary.name} is ready to explore.`
        });
      } else if (mode === "generate") {
        console.log("Generating project with idea:", projectIdea.trim(), "skill level:", skillLevel);
        const nextProject = generateProject(projectIdea.trim(), skillLevel);
        console.log("Generated project:", nextProject);
        const initialCache: Record<string, ProjectFile> = {};
        nextProject.files.forEach((file) => {
          if (file.content) {
            initialCache[file.path] = file;
          }
        });
        console.log("Files generated:", nextProject.files.length);
        setProject(nextProject);
        setFileCache(initialCache);
        if (nextProject.files.length > 0) {
          setSelectedFile(nextProject.files[0].path);
        }
        toast({
          title: "Project generated",
          description: `A starter project with ${nextProject.files.length} files has been created locally for you.`
        });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load project.";
      toast({
        title: "Something went wrong",
        description: message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (path: string) => {
    if (!project) return;
    resetInteractionState();
    setSelectedFile(path);

    if (fileCache[path]?.content) {
      // Generate file explanation for cached content
      const cachedFile = fileCache[path];
      if (cachedFile.content) {
        const explanation = generateW3SchoolsFileExplanation(path, cachedFile.content, skillLevel);
        setFileExplanation(explanation);
      }
      return;
    }

    const source = project.summary.source;

    if (source !== "github") {
      const existing = project.files.find((file) => file.path === path);
      if (existing?.content) {
        setFileCache((prev) => ({
          ...prev,
          [path]: existing
        }));
      }
      return;
    }

    if (!project.summary.owner || !project.summary.repo) {
      toast({
        title: "Missing metadata",
        description: "Unable to retrieve repository owner or name.",
        variant: "destructive"
      });
      return;
    }

    setIsFileLoading(true);
    try {
      const fetched = await fetchFileContent(
        project.summary.owner,
        project.summary.repo,
        project.summary.branch ?? "main",
        path,
        manualGithubToken || githubToken
      );

      setFileCache((prev) => ({
        ...prev,
        [path]: fetched
      }));

      // Generate file explanation
      if (fetched.content) {
        const explanation = generateW3SchoolsFileExplanation(path, fetched.content, skillLevel);
        setFileExplanation(explanation);
      }

      setProject((prev) =>
        prev
          ? {
            ...prev,
            files: prev.files.map((file) =>
              file.path === path ? { ...file, ...fetched } : file
            )
          }
          : prev
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to load file content.";
      toast({
        title: "File fetch failed",
        description: message,
        variant: "destructive"
      });
    } finally {
      setIsFileLoading(false);
    }
  };

  const handleSkillLevelChange = (nextLevel: SkillLevel) => {
    setSkillLevel(nextLevel);
    resetInteractionState();

    // Regenerate file explanation with new skill level
    if (selectedFile && currentFileContent) {
      const explanation = generateW3SchoolsFileExplanation(selectedFile, currentFileContent, nextLevel);
      setFileExplanation(explanation);
    }
  };

  const handleLineSelect = async (lineNumber: number, isMultiSelect?: boolean) => {
    if (!currentFileContent) {
      toast({
        title: "No content yet",
        description: "Select a file first to load its contents.",
        variant: "destructive"
      });
      return;
    }

    // Handle multi-line selection
    let newSelectedLines: Set<number>;

    if (isMultiSelect) {
      // Custom multi-select: add/remove individual lines
      newSelectedLines = new Set(selectedLines);
      if (newSelectedLines.has(lineNumber)) {
        newSelectedLines.delete(lineNumber);
      } else {
        newSelectedLines.add(lineNumber);
      }
    } else {
      // Smart block selection: select entire code block
      const block = detectCodeBlock(currentFileContent, lineNumber);
      newSelectedLines = new Set<number>();
      for (let i = block.startLine; i <= block.endLine; i++) {
        newSelectedLines.add(i);
      }
    }

    setSelectedLine(lineNumber);
    setSelectedLines(newSelectedLines);
    setIsExplaining(true);

    try {
      const lines = currentFileContent.split(/\r?\n/);
      const sortedLines = Array.from(newSelectedLines).sort((a, b) => a - b);

      // If multiple lines selected, use block explanation
      if (sortedLines.length > 1) {
        const blockExplanation = generateBlockExplanation(
          currentFileContent,
          sortedLines[0],
          sortedLines[sortedLines.length - 1],
          skillLevel,
          selectedFile || "code.js"
        );
        setLineExplanation(blockExplanation);
        setIsExplaining(false);
        return;
      }

      // Single line explanation
      const targetLine = lines[sortedLines[0] - 1]?.trim() || "";
      const complexity = estimateCodeComplexity(targetLine);

      // Use pattern-based explanation for simple code
      if (complexity === "simple") {
        setLineExplanation(buildLineExplanation(currentFileContent, sortedLines[0], skillLevel, selectedFile || "code.js"));
        setIsExplaining(false);
        return;
      }

      // Use AI for complex code
      try {
        const aiExplanation = await fetchAIExplanation(targetLine, skillLevel);
        setLineExplanation(aiExplanation);
      } catch (aiError) {
        console.warn("AI explanation failed, using pattern-based fallback:", aiError);
        // Fallback to pattern-based explanation
        setLineExplanation(buildLineExplanation(currentFileContent, sortedLines[0], skillLevel, selectedFile || "code.js"));
        toast({
          title: "Using offline explanation",
          description: "AI service unavailable. Showing pattern-based explanation instead.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error("Error generating explanation:", error);
      // Fallback to pattern-based explanation
      setLineExplanation(buildLineExplanation(currentFileContent, lineNumber, skillLevel, selectedFile || "code.js"));
      toast({
        title: "Error",
        description: "Could not generate explanation",
        variant: "destructive"
      });
    } finally {
      setIsExplaining(false);
    }
  };

  const navItems = [
    { label: "Analyze", id: "analyze" },
    { label: "Generate", id: "generate" },
    { label: "Upload", id: "upload" }
  ];

  const handleNavClick = (id: string) => {
    if (id === "analyze") setMode(TAB_MODES.GITHUB);
    if (id === "generate") setMode(TAB_MODES.GENERATE);
    if (id === "upload") setMode(TAB_MODES.UPLOAD);
  };

  // Register keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: "k",
      ctrl: true,
      meta: true,
      callback: () => {
        // Focus on the input field for the current mode
        const input = document.querySelector(
          `input[placeholder*="${mode === TAB_MODES.GITHUB ? "github" : mode === TAB_MODES.GENERATE ? "flashcard" : "Select"}"]`
        ) as HTMLInputElement;
        input?.focus();
      }
    }
  ]);

  return (
    <ErrorBoundary>
      <SEO
        title="Analyze & Understand Code"
        description="Understand unfamiliar code in minutes. Paste a GitHub repository or describe an idea and let AI explain it to you."
      />
      <div className="flex flex-col relative overflow-hidden">
        {/* Abstract Background Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl -z-10 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -z-10 animate-bounce [animation-duration:10s]" />

        <main className="flex-1 container mx-auto px-4 py-12 md:px-8 md:py-24">
          <motion.section
            className="mx-auto max-w-5xl text-center mb-16 md:mb-24 flex flex-col justify-center min-h-[50vh]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-block px-4 py-1.5 mb-6 text-sm font-medium tracking-wide uppercase bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-full w-fit mx-auto"
            >
              {t('hero.badge')}
            </motion.div>

            <h1 className="text-5xl font-extrabold tracking-tight md:text-7xl mb-8 leading-[1.1]">
              {t('hero.titleMain')} <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-600 via-blue-500 to-indigo-600 dark:from-sky-400 dark:to-indigo-400">
                {t('hero.titleSub')}
              </span>
            </h1>

            <p className="text-xl text-muted-foreground md:text-2xl leading-relaxed max-w-3xl mx-auto mb-10">
              {t('hero.description')}
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                className="h-14 px-8 text-lg font-semibold bg-sky-600 hover:bg-sky-700 text-white shadow-lg shadow-sky-500/20"
                onClick={() => {
                  const tabsElement = document.getElementById("main-tabs");
                  tabsElement?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {t('hero.getStarted')}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-lg font-semibold"
                asChild
              >
                <a href="/faq">{t('hero.howItWorks')}</a>
              </Button>
            </div>
          </motion.section>

          <motion.div
            id="main-tabs"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >

            <Card className="p-8 md:p-12">
              <Tabs
                value={mode}
                onValueChange={(value) => setMode(value as TabMode)}
              >
                <TabsList className="grid w-full grid-cols-3 bg-secondary/50">
                  <TabsTrigger value={TAB_MODES.GITHUB} className="gap-2 data-[state=active]:bg-sky-600 data-[state=active]:text-white data-[state=inactive]:text-muted-foreground hover:text-foreground transition-colors">
                    GitHub Repo
                  </TabsTrigger>
                  <TabsTrigger value={TAB_MODES.GENERATE} className="gap-2 data-[state=active]:bg-sky-600 data-[state=active]:text-white data-[state=inactive]:text-muted-foreground hover:text-foreground transition-colors">
                    Generate Idea
                  </TabsTrigger>
                  <TabsTrigger value={TAB_MODES.UPLOAD} className="gap-2 data-[state=active]:bg-sky-600 data-[state=active]:text-white data-[state=inactive]:text-muted-foreground hover:text-foreground transition-colors">
                    Upload Folder
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={TAB_MODES.GITHUB}>
                  <GitHubTab
                    isLoading={isLoading}
                    onAnalyze={(url, token) => {
                      setRepoUrl(url);
                      if (token) setManualGithubToken(token);
                      handleAnalyze();
                    }}
                  />
                </TabsContent>

                <TabsContent value={TAB_MODES.GENERATE}>
                  <GenerateTab
                    isLoading={isLoading}
                    onGenerate={(idea) => {
                      setProjectIdea(idea);
                      handleAnalyze();
                    }}
                  />
                </TabsContent>

                <TabsContent value={TAB_MODES.UPLOAD}>
                  <UploadTab
                    isLoading={isLoading}
                    uploadedFolderName={uploadedFolderName}
                    onFolderSelect={(files) => handleFolderInputChange({
                      target: { files }
                    } as ChangeEvent<HTMLInputElement>)}
                    onAnalyze={handleAnalyze}
                    isProjectLoaded={!!project}
                  />
                </TabsContent>
              </Tabs>

              <div className="mt-8">
                <SkillSelector
                  selectedLevel={skillLevel}
                  onLevelChange={handleSkillLevelChange}
                  disabled={isLoading || isFileLoading}
                />
              </div>
            </Card>
          </motion.div>

          {project && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <ProjectOverviewComponent overview={analyzeProject(project)} />
              </motion.div>
              <motion.section
                className="mt-16 grid gap-6 grid-cols-1 md:grid-cols-[260px_1fr_400px] lg:grid-cols-[300px_1fr_450px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, staggerChildren: 0.1 }}
              >
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <FileNavigator
                    files={displayedFiles}
                    selectedFile={selectedFile}
                    onFileSelect={handleFileSelect}
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <CodeViewer
                    isLoading={isFileLoading}
                    fileName={selectedFile}
                    fileContent={currentFileContent}
                    onLineSelect={handleLineSelect}
                    selectedLine={selectedLine}
                    selectedLines={selectedLines}
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <ExplanationPanel
                    isLoading={isFileLoading}
                    skillLevel={skillLevel}
                    selectedFile={selectedFile}
                    selectedLine={selectedLine}
                    lineExplanation={lineExplanation}
                    fileExplanation={fileExplanation}
                  />
                </motion.div>
              </motion.section>
            </>
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
};


export default Index;
