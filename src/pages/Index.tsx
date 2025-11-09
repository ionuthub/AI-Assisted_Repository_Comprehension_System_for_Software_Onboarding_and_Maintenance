import { useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { motion } from "framer-motion";
import { Code2, ExternalLink, Heart } from "lucide-react";
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
      
      const skillPrompts: Record<string, string> = {
        beginner: "Explain this code in simple terms that a beginner can understand. Use everyday analogies and avoid jargon. Focus on WHAT it does and WHY it's useful.",
        intermediate: "Explain this code for someone with programming experience. Use proper technical terms, discuss patterns, and mention best practices.",
        advanced: "Provide an in-depth technical analysis. Discuss architectural decisions, performance implications, trade-offs, and potential improvements."
      };

      const prompt = `${skillPrompts[skillLevel] || skillPrompts.beginner}\n\nCode to explain:\n\`\`\`\n${code}\n\`\`\``;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 500,
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

const Index = () => {
  const { toast } = useToast();
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
        const nextProject = await fetchRepositoryProject(repoUrl.trim());
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
        path
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
      <div className="min-h-screen bg-background flex flex-col">
        <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:h-20 md:px-8">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-lg font-bold md:text-xl">AI Code Tutor</span>
          </motion.div>

          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item, idx) => (
              <motion.button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {item.label}
              </motion.button>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12 md:px-8 md:py-20">
        <motion.section
          className="mx-auto max-w-4xl text-center mb-12 md:mb-16 flex flex-col justify-center min-h-[60vh]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl mb-6">
            Understand unfamiliar code in minutes
          </h1>
          <p className="text-lg text-muted-foreground md:text-xl leading-relaxed">
            Paste a GitHub repository or describe an idea. We will fetch the files, highlight the structure,
            and help you reason about each line without managing any accounts.
          </p>
        </motion.section>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
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
                onAnalyze={(url) => {
                  setRepoUrl(url);
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

      <footer className="border-t border-border bg-secondary/30 mt-20">
        <div className="container mx-auto px-4 py-12 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="mb-4">
                <span className="font-bold">AI Code Tutor</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Learn code faster with AI-powered explanations tailored to your skill level.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <button className="hover:text-foreground transition-colors flex items-center gap-1">
                    Analyze Repos <ExternalLink className="h-3 w-3" />
                  </button>
                </li>
                <li>
                  <button className="hover:text-foreground transition-colors flex items-center gap-1">
                    Generate Projects <ExternalLink className="h-3 w-3" />
                  </button>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="/faq" className="hover:text-foreground transition-colors">FAQ</a>
                </li>
                <li>
                  <a href="/terms" className="hover:text-foreground transition-colors">Terms of Service</a>
                </li>
                <li>
                  <a href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</a>
                </li>
              </ul>
            </motion.div>
          </div>

          <motion.div
            className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <p>© 2025 AI Code Tutor. All rights reserved.</p>
            <div className="flex items-center gap-2 mt-4 md:mt-0">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500 fill-red-500" />
              <span>for developers</span>
            </div>
          </motion.div>
        </div>
      </footer>
      </div>
    </ErrorBoundary>
  );
};

export default Index;
