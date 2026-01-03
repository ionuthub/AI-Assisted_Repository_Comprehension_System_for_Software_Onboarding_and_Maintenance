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
import { generateW3SchoolsExplanation, generateW3SchoolsFileExplanation } from "@/lib/w3schoolsExplainer";
import type { ChatMessage } from "@/components/ExplanationPanel";
import { detectCodeBlock } from "@/lib/blockDetector";
import { analyzeProject } from "@/lib/projectAnalyzer";
import { useToast } from "@/hooks/use-toast";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { TAB_MODES, SKILL_LEVELS } from "@/constants/appConstants";
import type { SkillLevel, TabMode } from "@/constants/appConstants";
import { useProjectStore } from "@/store/useProjectStore";
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

const fetchAIExplanationStream = async (
  messages: ChatMessage[],
  skillLevel: SkillLevel,
  systemContext: string,
  onChunk: (text: string) => void
): Promise<void> => {
  try {
    const response = await fetch('/api/explain-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, skillLevel, systemContext, stream: true })
    });

    if (!response.ok) throw new Error('Streaming failed');

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    if (!reader) return;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      onChunk(decoder.decode(value));
    }
  } catch (error) {
    console.error("Streaming error:", error);
    onChunk("I'm sorry, I'm having trouble connecting to the AI brain right now.");
  }
};

import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { toast } = useToast();
  const { t } = useTranslation();

  const {
    mode, setMode,
    project, setProject,
    fileCache, setFileCache,
    updateFileCache,
    selectedFile, setSelectedFile,
    selectedLine, setSelectedLine,
    selectedLines, setSelectedLines,
    skillLevel, setSkillLevel,
    chatMessages, setChatMessages,
    isExplaining, setIsExplaining,
    isLoading, setIsLoading,
    isFileLoading, setIsFileLoading,
    resetSelection
  } = useProjectStore();

  const [repoUrl, setRepoUrl] = useState("");
  const [projectIdea, setProjectIdea] = useState("");
  const [uploadedFolderName, setUploadedFolderName] = useState<string | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const [githubToken, setGithubToken] = useState<string | null>(null);
  const [manualGithubToken, setManualGithubToken] = useState<string | null>(null);
  const [session, setSession] = useState<unknown>(null);

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


  const handleFolderInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    resetSelection();
    setIsFileLoading(true);

    try {
      const fileArray = Array.from(files);
      const folderName = (fileArray[0] as File & { webkitRelativePath?: string }).webkitRelativePath?.split("/")?.[0] ?? "Uploaded Folder";

      const folderFiles: ProjectFile[] = await Promise.all(
        fileArray.map(async (file) => ({
          path: (file as File & { webkitRelativePath?: string }).webkitRelativePath ?? file.name,
          language: inferLanguageFromFilename(file.name),
          size: file.size ?? null,
          content: await file.text()
        }))
      );

      const cache: Record<string, ProjectFile> = {};
      folderFiles.forEach(f => { if (f.content) cache[f.path] = f; });

      setProject({
        summary: { name: folderName, description: `Local: ${folderName}`, source: "uploaded", language: null },
        files: folderFiles
      });
      setFileCache(cache);

      const first = folderFiles.find(f => f.content);
      if (first) {
        setSelectedFile(first.path);
        const explanation = generateW3SchoolsFileExplanation(first.path, first.content || "", skillLevel);
        setChatMessages([{ role: 'model', content: explanation }]);
      }
    } catch (error) {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setIsFileLoading(false);
      if (folderInputRef.current) folderInputRef.current.value = "";
    }
  };

  const handleAnalyze = async () => {
    resetSelection();
    if (mode === "github" && !repoUrl.trim()) return toast({ title: "Repo URL required", variant: "destructive" });
    if (mode === "generate" && !projectIdea.trim()) return toast({ title: "Idea required", variant: "destructive" });

    setIsLoading(true);
    try {
      if (mode === "github") {
        const next = await fetchRepositoryProject(repoUrl.trim(), manualGithubToken || githubToken);
        setProject(next);
        if (next.files.length > 0) setSelectedFile(next.files[0].path);
      } else if (mode === "generate") {
        const next = generateProject(projectIdea.trim(), skillLevel);
        setProject(next);
        const cache: Record<string, ProjectFile> = {};
        next.files.forEach(f => { if (f.content) cache[f.path] = f; });
        setFileCache(cache);
        if (next.files.length > 0) setSelectedFile(next.files[0].path);
      }
    } catch (e) {
      toast({ title: "Analysis failed", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (path: string) => {
    if (!project) return;
    resetSelection();
    setSelectedFile(path);

    if (fileCache[path]?.content) {
      const explanation = generateW3SchoolsFileExplanation(path, fileCache[path].content || "", skillLevel);
      setChatMessages([{ role: 'model', content: explanation }]);
      return;
    }

    if (project.summary.source === "github") {
      setIsFileLoading(true);
      try {
        const fetched = await fetchFileContent(
          project.summary.owner!,
          project.summary.repo!,
          project.summary.branch ?? "main",
          path,
          manualGithubToken || githubToken
        );
        updateFileCache(path, fetched);
        const explanation = generateW3SchoolsFileExplanation(path, fetched.content || "", skillLevel);
        setChatMessages([{ role: 'model', content: explanation }]);
      } catch (e) {
        toast({ title: "Fetch failed", variant: "destructive" });
      } finally {
        setIsFileLoading(false);
      }
    }
  };

  const handleSkillLevelChange = (nextLevel: SkillLevel) => {
    setSkillLevel(nextLevel);
    resetSelection();

    if (selectedFile && currentFileContent) {
      const explanation = generateW3SchoolsFileExplanation(selectedFile, currentFileContent, nextLevel);
      setChatMessages([{ role: 'model', content: explanation }]);
    }
  };

  const handleChatSendMessage = async (content: string) => {
    const newUserMsg: ChatMessage = { role: 'user', content };
    const updated: ChatMessage[] = [...chatMessages, newUserMsg, { role: 'model', content: '' }];
    setChatMessages(updated);
    setIsExplaining(true);

    let fullText = "";
    const summary = project ? analyzeProject(project).explanation.slice(0, 5).join("\n") : "";

    await fetchAIExplanationStream(updated.slice(0, -1), skillLevel, summary, (chunk) => {
      fullText += chunk;
      const streamingMsgs: ChatMessage[] = [...updated.slice(0, -1), { role: 'model', content: fullText }];
      setChatMessages(streamingMsgs);
    });
    setIsExplaining(false);
  };

  const handleLineSelect = async (lineNumber: number) => {
    if (!currentFileContent) return;
    const block = detectCodeBlock(currentFileContent, lineNumber);
    const lines = new Set<number>();
    for (let i = block.startLine; i <= block.endLine; i++) lines.add(i);

    setSelectedLine(lineNumber);
    setSelectedLines(lines);
    setIsExplaining(true);

    const snippet = currentFileContent.split(/\r?\n/).slice(block.startLine - 1, block.endLine).join("\n");
    const prompt = `Explain these lines (${block.startLine}-${block.endLine}) in ${selectedFile}:\n\n\`\`\`\n${snippet}\n\`\`\``;

    setChatMessages([{ role: 'user', content: prompt }, { role: 'model', content: '' }]);

    let fullText = "";
    const summary = project ? analyzeProject(project).explanation.slice(0, 5).join("\n") : "";

    await fetchAIExplanationStream([{ role: 'user', content: prompt }], skillLevel, summary, (chunk) => {
      fullText += chunk;
      setChatMessages([{ role: 'user', content: prompt }, { role: 'model', content: fullText }]);
    });
    setIsExplaining(false);
  };

  const handleRefactorRequest = async () => {
    if (!selectedLine || !currentFileContent) return;
    const block = detectCodeBlock(currentFileContent, selectedLine);
    const snippet = currentFileContent.split(/\r?\n/).slice(block.startLine - 1, block.endLine).join("\n");

    const prompt = `Refactor this code block from ${selectedFile} for better quality/performance. Show the refactored code and explain why:\n\n\`\`\`\n${snippet}\n\`\`\``;
    handleChatSendMessage(prompt);
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
                <ProjectOverviewComponent
                  overview={analyzeProject(project)}
                  project={project}
                  onFileSelect={handleFileSelect}
                />
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
                    isLoading={isExplaining}
                    messages={chatMessages}
                    onSendMessage={handleChatSendMessage}
                    onRefactor={handleRefactorRequest}
                    skillLevel={skillLevel}
                    hasSelection={!!selectedLine}
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
