import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Code2, Sparkles, Github, Wand2, ExternalLink, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SkillSelector from "@/components/SkillSelector";
import CodeViewer from "@/components/CodeViewer";
import ExplanationPanel from "@/components/ExplanationPanel";
import FileNavigator from "@/components/FileNavigator";
import ProjectOverviewComponent from "@/components/ProjectOverview";
import type { Project, ProjectFile } from "@/types/project";
import { fetchRepositoryProject, fetchFileContent } from "@/lib/github";
import { generateProject, generateFileExplanation } from "@/lib/generation";
import { analyzeProject } from "@/lib/projectAnalyzer";
import { useToast } from "@/hooks/use-toast";

type SkillLevel = "beginner" | "intermediate" | "advanced";

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
  skillLevel: SkillLevel
): string => {
  const lines = content.split(/\r?\n/);
  const target = lines[lineNumber - 1]?.trim();

  if (!target) {
    return "This line is empty or just has whitespace. Try selecting a line with actual code.";
  }

  const pattern = detectCodePattern(target);

  if (skillLevel === "beginner") {
    const explanations: Record<string, string> = {
      assignment: `This line is like creating a labeled box and putting something inside it. The name of the box is shown, and whatever is after the "=" sign goes into the box. Later, you can use that box's name to get what's inside.`,
      function_call: `This line is like calling someone's name to ask them to do a job. The word before the parentheses ( ) is the name of the helper, and what's inside the parentheses ( ) are the instructions for what to do.`,
      condition: `This line asks a yes-or-no question. If the answer is "yes" (true), the computer does one thing. If the answer is "no" (false), it might do something else or skip ahead.`,
      loop: `This line tells the computer to repeat something multiple times. It keeps doing the same action until a condition says to stop.`,
      return: `This line is like saying "I'm done, here's my answer!" It sends back a result so the code that asked for help can use it.`,
      array_operation: `This line does the same action to every item in a list, one by one. It's like saying "do this to each toy in the toy box."`,
      unknown: `This line executes code. Look at the actual code to see what specific action it's performing.`
    };

    return `**${pattern.type === "unknown" ? "Code Execution" : pattern.type.replace(/_/g, " ").toUpperCase()}**\n\n${explanations[pattern.type] || explanations.unknown}\n\n**The actual code:** \`${target}\``;
  }

  if (skillLevel === "intermediate") {
    const contextBefore = lines
      .slice(Math.max(0, lineNumber - 2), lineNumber - 1)
      .map((line) => line.trim())
      .filter(Boolean);
    const contextAfter = lines
      .slice(lineNumber + 1, lineNumber + 2)
      .map((line) => line.trim())
      .filter(Boolean);

    return `**Line ${lineNumber}: ${pattern.type.replace(/_/g, " ").toUpperCase()}**\n\nThis line executes: \`${target}\`\n\nContext: ${contextBefore.length > 0 ? contextBefore.join(" → ") + " → " : ""}**[THIS LINE]**${contextAfter.length > 0 ? " → " + contextAfter.join(" → ") : ""}\n\nConsider how data flows into this line and where the result is used next.`;
  }

  // Advanced level - keep original detailed analysis
  const contextBefore = lines
    .slice(Math.max(0, lineNumber - 3), lineNumber - 1)
    .map((line) => line.trim())
    .filter(Boolean);
  const contextAfter = lines
    .slice(lineNumber, lineNumber + 2)
    .map((line) => line.trim())
    .filter(Boolean);

  const contextSummary = [...contextBefore, target, ...contextAfter]
    .filter(Boolean)
    .join(" → ");

  return `**Line ${lineNumber}: ${pattern.type.replace(/_/g, " ").toUpperCase()}**\n\nCode: \`${target}\`\n\nContext: ${contextSummary}\n\nAnalyze the architectural implications, potential side effects, and opportunities for optimization or refactoring.`;
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
  try {
    // Call our secure serverless function
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

    // Check if response has content
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (!response.ok) {
      console.error("API error status:", response.status);
      
      // Handle rate limiting specifically
      if (response.status === 429) {
        throw new Error("Too many requests. Please wait a minute and try again.");
      }
      
      // Try to parse error response
      if (isJson) {
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || "AI API request failed");
        } catch (e) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
      }
      
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    // Parse response
    if (!isJson) {
      console.warn("Response is not JSON, using fallback");
      throw new Error("Invalid response format");
    }

    const data = await response.json();
    const explanation = data.explanation;
    
    if (!explanation) {
      throw new Error("No explanation generated");
    }
    
    return explanation;
  } catch (error) {
    console.error("AI explanation error:", error);
    // Fall back to mock API if serverless function fails
    console.log("Falling back to mock API");
    try {
      const { mockExplainCode } = await import('@/lib/mockApi');
      return mockExplainCode(code, skillLevel);
    } catch (mockError) {
      console.error("Mock API also failed:", mockError);
      throw error;
    }
  }
};

const Index = () => {
  const { toast } = useToast();
  const [mode, setMode] = useState<"github" | "generate">("github");
  const [skillLevel, setSkillLevel] = useState<SkillLevel>("beginner");
  const [repoUrl, setRepoUrl] = useState("");
  const [projectIdea, setProjectIdea] = useState("");
  const [project, setProject] = useState<Project | null>(null);
  const [fileCache, setFileCache] = useState<Record<string, ProjectFile>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [lineExplanation, setLineExplanation] = useState<string | null>(null);
  const [fileExplanation, setFileExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);

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
    setLineExplanation(null);
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
      } else {
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
        const explanation = generateFileExplanation(path, cachedFile.content, skillLevel);
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
        const explanation = generateFileExplanation(path, fetched.content, skillLevel);
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
      const explanation = generateFileExplanation(selectedFile, currentFileContent, nextLevel);
      setFileExplanation(explanation);
    }
  };

  const handleLineSelect = async (lineNumber: number) => {
    if (!currentFileContent) {
      toast({
        title: "No content yet",
        description: "Select a file first to load its contents.",
        variant: "destructive"
      });
      return;
    }

    setSelectedLine(lineNumber);
    setIsExplaining(true);

    try {
      const lines = currentFileContent.split(/\r?\n/);
      const targetLine = lines[lineNumber - 1]?.trim() || "";
      const complexity = estimateCodeComplexity(targetLine);

      // Use pattern-based explanation for simple code
      if (complexity === "simple") {
        setLineExplanation(buildLineExplanation(currentFileContent, lineNumber, skillLevel));
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
        setLineExplanation(buildLineExplanation(currentFileContent, lineNumber, skillLevel));
        toast({
          title: "Using offline explanation",
          description: "AI service unavailable. Showing pattern-based explanation instead.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error("Error generating explanation:", error);
      // Fallback to pattern-based explanation
      setLineExplanation(buildLineExplanation(currentFileContent, lineNumber, skillLevel));
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
    { label: "Learn", id: "learn" }
  ];

  const handleNavClick = (id: string) => {
    if (id === "analyze") setMode("github");
    if (id === "generate") setMode("generate");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:h-20 md:px-8">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Code2 className="h-6 w-6 text-primary md:h-7 md:w-7" />
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

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Sparkles className="h-6 w-6 text-primary md:h-7 md:w-7" />
          </motion.div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12 md:px-8 md:py-20">
        <motion.section
          className="mx-auto max-w-4xl text-center mb-12 md:mb-16"
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
          <Tabs value={mode} onValueChange={(value) => setMode(value as "github" | "generate")}>
            <TabsList className="grid w-full grid-cols-2 bg-secondary/50">
              <TabsTrigger value="github" className="gap-2 data-[state=active]:bg-sky-600 data-[state=active]:text-white data-[state=inactive]:text-muted-foreground hover:text-foreground transition-colors">
                <Github className="h-4 w-4" />
                GitHub Repo
              </TabsTrigger>
              <TabsTrigger value="generate" className="gap-2 data-[state=active]:bg-sky-600 data-[state=active]:text-white data-[state=inactive]:text-muted-foreground hover:text-foreground transition-colors">
                <Wand2 className="h-4 w-4" />
                Generate Idea
              </TabsTrigger>
            </TabsList>

            <TabsContent value="github" className="mt-6 space-y-4">
              <Input
                placeholder="https://github.com/facebook/react"
                value={repoUrl}
                onChange={(event) => setRepoUrl(event.target.value)}
                disabled={isLoading}
              />
              <Button onClick={handleAnalyze} disabled={isLoading} className="w-full md:w-auto bg-sky-600 hover:bg-sky-700 text-white">
                {isLoading ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                    Loading repository...
                  </>
                ) : (
                  <>
                    <Github className="mr-2 h-4 w-4" />
                    Analyze repository
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="generate" className="mt-6 space-y-4">
              <Input
                placeholder="A flashcard app with spaced repetition"
                value={projectIdea}
                onChange={(event) => setProjectIdea(event.target.value)}
                disabled={isLoading}
              />
              <Button onClick={handleAnalyze} disabled={isLoading} className="w-full md:w-auto bg-sky-600 hover:bg-sky-700 text-white">
                {isLoading ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                    Drafting project...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate project
                  </>
                )}
              </Button>
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
              <div className="flex items-center gap-2 mb-4">
                <Code2 className="h-5 w-5 text-primary" />
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
                <li>
                  <button className="hover:text-foreground transition-colors flex items-center gap-1">
                    Learn Faster <ExternalLink className="h-3 w-3" />
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
                  <a href="/terms" className="hover:text-foreground transition-colors">Terms of Service</a>
                </li>
                <li>
                  <a href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</a>
                </li>
                <li>
                  <a href="https://github.com/ionuthub/unravel-code-ai" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">GitHub</a>
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
  );
};

export default Index;
