import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const Index = () => {
  const { t } = useTranslation();
  const {
    mode, setMode,
    project,
    fileCache,
    selectedFile,
    selectedLine,
    selectedLines,
    skillLevel,
    chatMessages,
    isExplaining,
    isLoading,
    isFileLoading,
  } = useProjectStore();

  const { isAuthenticated, user } = useSupabaseOAuth();
  const { githubToken, manualGithubToken, setManualGithubToken } = useGitHubAuth();

  const [repoUrl, setRepoUrl] = useState("");
  const [projectIdea, setProjectIdea] = useState("");

  const {
    uploadedFolderName,
    handleFolderInputChange,
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
                    onGenerate={(idea) => {
                      setProjectIdea(idea);
                      handleAnalyze("", idea, null);
                    }}
                  />
                </TabsContent>

                <TabsContent value={TAB_MODES.UPLOAD}>
                  {isAuthenticated ? (
                    <UploadTab
                      isLoading={isLoading}
                      uploadedFolderName={uploadedFolderName}
                      onFolderSelect={(files) => handleFolderInputChange({
                        target: { files }
                      } as any)}
                      onAnalyze={() => handleAnalyze("", "", null)}
                      isProjectLoaded={!!project}
                    />
                  ) : (
                    <LockedFeature
                      title="Analyze Local Projects"
                      description="Upload your local project folders to get instant architecture reviews and code explanations."
                    />
                  )}
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
                    onFileSelect={(path) => handleFileSelect(path, manualGithubToken || githubToken)}
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
                    onLineSelect={(line) => handleLineSelect(line, currentFileContent || '')}
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
                    onRefactor={() => handleRefactorRequest(selectedLine, currentFileContent)}
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
