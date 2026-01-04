import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Files, Code, Sparkles } from "lucide-react";
import SkillSelector from "@/components/SkillSelector";
import CodeViewer from "@/components/CodeViewer";
import ExplanationPanel from "@/components/ExplanationPanel";
import FileNavigator from "@/components/FileNavigator";
import ProjectOverviewComponent from "@/components/ProjectOverview";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import GitHubTab from "@/components/tabs/GitHubTab";
import GenerateTab from "@/components/tabs/GenerateTab";
import UploadTab from "@/components/tabs/UploadTab";
import { analyzeProject } from "@/lib/projectAnalyzer";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { TAB_MODES } from "@/constants/appConstants";
import type { TabMode } from "@/constants/appConstants";
import { useProjectStore } from "@/store/useProjectStore";
import SEO from "@/components/SEO";
import { useSupabaseOAuth } from "@/hooks/useSupabaseOAuth";
import { useGitHubAuth } from "@/hooks/useGitHubAuth";
import { useProjectManagement } from "@/hooks/useProjectManagement";
import { useCodeExplanation } from "@/hooks/useCodeExplanation";
import LockedFeature from "@/components/LockedFeature";
import ProjectHistory from "@/components/dashboard/ProjectHistory";
import { useProjects } from "@/hooks/useProjects";

const Index = () => {
  const {
    mode, setMode,
    project, setProject,
    fileCache, setFileCache,
    selectedFile, setSelectedFile,
    selectedLine,
    selectedLines,
    skillLevel,
    chatMessages,
    isExplaining,
    isLoading,
    isFileLoading,
  } = useProjectStore();

  const { isAuthenticated, user } = useSupabaseOAuth();
  const { projects: historyProjects, isLoadingHistory, deleteProject } = useProjects(user, isAuthenticated);
  const { githubToken, manualGithubToken, setManualGithubToken } = useGitHubAuth();

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === TAB_MODES.GITHUB) setMode(TAB_MODES.GITHUB);
    if (tab === TAB_MODES.GENERATE) setMode(TAB_MODES.GENERATE);
    if (tab === TAB_MODES.UPLOAD) setMode(TAB_MODES.UPLOAD);

    // If a tab is requested, scroll to main area
    if (tab) {
      setTimeout(() => {
        document.getElementById("main-tabs")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [searchParams, setMode]);

  const [repoUrl, setRepoUrl] = useState("");
  const [projectIdea, setProjectIdea] = useState("");

  const {
    uploadedFolderName,
    handleFolderInputChange,
    processUploadedFiles,
    handleAnalyze,
    handleFileSelect
  } = useProjectManagement();

  const {
    handleChatSendMessage,
    handleLineSelect,
    handleRefactorRequest,
    handleSkillLevelChange
  } = useCodeExplanation();

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
          {isAuthenticated ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, <span className="text-primary">{user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Developer'}</span>
              </h1>
              <p className="text-muted-foreground">
                Continue your learning journey. Select a repository or upload a new project.
              </p>

              <ProjectHistory
                projects={historyProjects}
                isLoading={isLoadingHistory}
                onSelectProject={(p) => {
                  setProject(p);
                  // Setup cache for the selected project
                  const cache: Record<string, import("@/types/project").ProjectFile> = {};
                  p.files.forEach(f => { if (f.content) cache[f.path] = f; });
                  setFileCache(cache);
                  if (p.files.length > 0) setSelectedFile(p.files[0].path);

                  // Scroll to main area
                  setTimeout(() => {
                    document.getElementById("main-tabs")?.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }}
                onDeleteProject={deleteProject}
              />
            </motion.div>
          ) : (
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
                Enterprise AI Code Intelligence
              </motion.div>

              <h1 className="text-5xl font-extrabold tracking-tight md:text-7xl mb-8 leading-[1.1]">
                Understand unfamiliar code <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-600 via-blue-500 to-indigo-600 dark:from-sky-400 dark:to-indigo-400">
                  in minutes, not hours.
                </span>
              </h1>

              <p className="text-xl text-muted-foreground md:text-2xl leading-relaxed max-w-3xl mx-auto mb-10">
                Stop struggling with context switching. Paste a GitHub repository or describe an idea, and let our neural engine deconstruct the logic for you.
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
                  Get Started Free
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-lg font-semibold"
                  asChild
                >
                  <a href="/faq">How it works</a>
                </Button>
              </div>
            </motion.section>
          )}

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
                    <span className="hidden md:inline">GitHub Repo</span>
                    <span className="inline md:hidden">GitHub</span>
                  </TabsTrigger>
                  <TabsTrigger value={TAB_MODES.GENERATE} className="gap-2 data-[state=active]:bg-sky-600 data-[state=active]:text-white data-[state=inactive]:text-muted-foreground hover:text-foreground transition-colors">
                    <span className="hidden md:inline">Generate Idea</span>
                    <span className="inline md:hidden">Idea</span>
                  </TabsTrigger>
                  <TabsTrigger value={TAB_MODES.UPLOAD} className="gap-2 data-[state=active]:bg-sky-600 data-[state=active]:text-white data-[state=inactive]:text-muted-foreground hover:text-foreground transition-colors">
                    <span className="hidden md:inline">Upload Folder</span>
                    <span className="inline md:hidden">Upload</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={TAB_MODES.GITHUB}>
                  {isAuthenticated ? (
                    <GitHubTab
                      isLoading={isLoading}
                      onAnalyze={(url, token) => {
                        setRepoUrl(url);
                        if (token) setManualGithubToken(token);
                        handleAnalyze(url, "", token || githubToken);
                      }}
                    />
                  ) : (
                    <LockedFeature
                      title="Analyze GitHub Repositories"
                      description="Connect your GitHub account to analyze private repositories, save your history, and get personalized insights."
                    />
                  )}
                </TabsContent>

                <TabsContent value={TAB_MODES.GENERATE}>
                  <GenerateTab
                    isLoading={isLoading}
                    onGenerate={async (idea) => {
                      setProjectIdea(idea);
                      await handleAnalyze("", idea, null);
                      // Auto-redirect by scrolling to project view
                      setTimeout(() => {
                        document.getElementById("project-overview")?.scrollIntoView({ behavior: "smooth" });
                      }, 500);
                    }}
                  />
                </TabsContent>

                <TabsContent value={TAB_MODES.UPLOAD}>
                  <UploadTab
                    isLoading={isLoading}
                    uploadedFolderName={uploadedFolderName}
                    onFolderSelect={(files) => processUploadedFiles(files)}
                    onAnalyze={() => handleAnalyze("", "", null)}
                    isProjectLoaded={!!project}
                    isAuthenticated={isAuthenticated}
                  />
                </TabsContent>
              </Tabs>

              <div className="mt-8">
                <SkillSelector
                  selectedLevel={skillLevel}
                  onLevelChange={(level) => handleSkillLevelChange(level, currentFileContent)}
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
                  onFileSelect={(path) => handleFileSelect(path, manualGithubToken || githubToken)}
                />
              </motion.div>
              {/* Desktop View (Grid) */}
              <motion.section
                className="mt-16 hidden md:grid gap-6 grid-cols-[260px_1fr_400px] lg:grid-cols-[300px_1fr_450px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, staggerChildren: 0.1 }}
              >
                <div className="h-full border rounded-xl overflow-hidden bg-card">
                  <FileNavigator
                    files={displayedFiles}
                    selectedFile={selectedFile}
                    onFileSelect={(path) => handleFileSelect(path, manualGithubToken || githubToken)}
                  />
                </div>

                <div className="h-full min-h-[500px] border rounded-xl overflow-hidden bg-card shadow-sm">
                  <CodeViewer
                    isLoading={isFileLoading}
                    fileName={selectedFile}
                    fileContent={currentFileContent}
                    onLineSelect={(line) => handleLineSelect(line, currentFileContent || '')}
                    selectedLine={selectedLine}
                    selectedLines={selectedLines}
                  />
                </div>

                <div className="h-full border rounded-xl overflow-hidden bg-card">
                  <ExplanationPanel
                    isLoading={isExplaining}
                    messages={chatMessages}
                    onSendMessage={handleChatSendMessage}
                    onRefactor={() => handleRefactorRequest(selectedLine, currentFileContent)}
                    skillLevel={skillLevel}
                    hasSelection={!!selectedLine}
                  />
                </div>
              </motion.section>

              {/* Mobile View (Tabs) */}
              <motion.div
                className="mt-8 md:hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Tabs defaultValue="files" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="files" className="flex gap-2">
                      <Files className="w-4 h-4" /> Files
                    </TabsTrigger>
                    <TabsTrigger value="code" className="flex gap-2">
                      <Code className="w-4 h-4" /> Code
                    </TabsTrigger>
                    <TabsTrigger value="explain" className="flex gap-2">
                      <Sparkles className="w-4 h-4" /> AI
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="files" className="mt-0">
                    <div className="border rounded-xl overflow-hidden bg-card h-[60vh]">
                      <FileNavigator
                        files={displayedFiles}
                        selectedFile={selectedFile}
                        onFileSelect={(path) => {
                          handleFileSelect(path, manualGithubToken || githubToken);
                          // Optional: Auto-switch to code tab on file select check if we want this interaction
                        }}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="code" className="mt-0">
                    <div className="border rounded-xl overflow-hidden bg-card h-[60vh] shadow-sm">
                      <CodeViewer
                        isLoading={isFileLoading}
                        fileName={selectedFile}
                        fileContent={currentFileContent}
                        onLineSelect={(line) => handleLineSelect(line, currentFileContent || '')}
                        selectedLine={selectedLine}
                        selectedLines={selectedLines}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="explain" className="mt-0">
                    <div className="border rounded-xl overflow-hidden bg-card h-[60vh]">
                      <ExplanationPanel
                        isLoading={isExplaining}
                        messages={chatMessages}
                        onSendMessage={handleChatSendMessage}
                        onRefactor={() => handleRefactorRequest(selectedLine, currentFileContent)}
                        skillLevel={skillLevel}
                        hasSelection={!!selectedLine}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </motion.div>
            </>
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default Index;
