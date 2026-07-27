import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  FileCode,
  GitBranch,
  Archive,
  FolderOpen,
  HelpCircle,
  FileText,
  Activity,
  Layers,
  Sparkles,
  Zap
} from "lucide-react";
import CodeViewer from "@/components/CodeViewer";
import FolderTree from "@/components/FolderTree";
import WorkspaceQAView, { type RetrievedEvidence } from "@/components/WorkspaceQAView";
import WorkspaceSearchView from "@/components/WorkspaceSearchView";
import WorkspaceInsightsPanel from "@/components/WorkspaceInsightsPanel";
import DependencyGraph from "@/components/DependencyGraph";
import CoveragePanel from "@/components/CoveragePanel";
import SuggestedQuestions from "@/components/SuggestedQuestions";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { TAB_MODES, RETRIEVAL } from "@/constants/appConstants";
import { useProjectStore } from "@/store/useProjectStore";
import SEO from "@/components/SEO";
import { recordMetric } from "@/lib/evaluation/metrics";
import { useGitHubAuth } from "@/hooks/useGitHubAuth";
import { useProjectManagement } from "@/hooks/useProjectManagement";
import { searchRepository, selectExcerptRegion, SearchResult } from "@/lib/semanticSearch";
import { detectCodeBlock } from "@/lib/blockDetector";
import ProjectOverviewComponent from "@/components/ProjectOverview";
import { analyzeProject } from "@/lib/projectAnalyzer";

interface RecentRepoItem {
  name: string;
  url?: string;
  date: string;
  /** Coverage at the time it was analysed, so the list states what was actually read. */
  indexed?: number;
  total?: number;
}

/** Offered on the start screen so a first-time user is not facing an empty field. */
const EXAMPLE_REPOSITORY = "https://github.com/expressjs/express";

const Index = () => {
  const { toast } = useToast();
  const {
    mode, setMode,
    project, setProject,
    fileCache, setFileCache,
    selectedFile, setSelectedFile,
    selectedLine, setSelectedLine,
    selectedLines, setSelectedLines,
    skillLevel,
    isLoading,
    isFileLoading,
    scanResult,
    staticAnalyses,
    searchIndex
  } = useProjectStore();

  const { githubToken, manualGithubToken, setManualGithubToken } = useGitHubAuth();
  
  const overview = useMemo(() => {
    if (!project) return null;
    return analyzeProject(project);
  }, [project]);

  const [searchParams] = useSearchParams();

  // Path -> why it was not indexed. Lets a path the model names be reported with the reason
  // it is absent ("Over the 50-file limit") rather than a bare "not retrieved", which is the
  // difference between a user being able to act on the gap and merely noticing it.
  const excludedPathReasons = useMemo(() => {
    const map: Record<string, string> = {};
    for (const item of project?.ingestion?.excluded ?? []) map[item.path] = item.reason;
    return map;
  }, [project]);

  // Workspace dynamic view states
  const [workspaceView, setWorkspaceView] = useState<'overview' | 'code' | 'architecture' | 'search' | 'qa'>('overview');
  const [searchVal, setSearchVal] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [qaVal, setQaVal] = useState("");
  const [qaQuestion, setQaQuestion] = useState("");
  const [qaAnswer, setQaAnswer] = useState("");
  const [qaEvidence, setQaEvidence] = useState<RetrievedEvidence[]>([]);
  const [isQaLoading, setIsQaLoading] = useState(false);

  const [githubUrl, setGithubUrl] = useState("");
  const [recentRepos, setRecentRepos] = useState<RecentRepoItem[]>([]);

  const zipInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const {
    processUploadedFiles,
    handleAnalyze,
    handleFileSelect,
    ingestionProgress
  } = useProjectManagement();

  const handleLineSelect = (lineNumber: number) => {
    if (!currentFileContent) return;
    const block = detectCodeBlock(currentFileContent, lineNumber);
    const lines = new Set<number>();
    for (let i = block.startLine; i <= block.endLine; i++) {
      lines.add(i);
    }
    setSelectedLine(lineNumber);
    setSelectedLines(lines);
  };

  // Load recent repositories from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("recent_repos");
    if (saved) {
      try {
        setRecentRepos(JSON.parse(saved));
      } catch (e) {
        console.warn("Failed to parse recent repos", e);
      }
    }
  }, []);

  const addRecentRepo = useCallback((name: string, url?: string, indexed?: number, total?: number) => {
    setRecentRepos((prev) => {
      const list = [...prev];
      const existingIndex = list.findIndex(r => r.name === name || (url && r.url === url));
      if (existingIndex !== -1) {
        list.splice(existingIndex, 1);
      }
      list.unshift({ name, url, date: new Date().toLocaleDateString(), indexed, total });
      const trimmed = list.slice(0, 5);
      localStorage.setItem("recent_repos", JSON.stringify(trimmed));
      return trimmed;
    });
  }, []);

  // Add project to history when loaded
  useEffect(() => {
    if (project) {
      const name = project.summary.name;
      const url = project.summary.source === 'github' ? githubUrl : undefined;
      addRecentRepo(name, url, project.ingestion?.filesWithContent, project.ingestion?.totalRepositoryFiles);
      setWorkspaceView('overview');
    }
  }, [project, githubUrl, addRecentRepo]);

  const handleGithubAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUrl.trim()) {
      toast({ title: "URL required", description: "Please enter a valid GitHub repository URL.", variant: "destructive" });
      return;
    }
    setMode(TAB_MODES.GITHUB);
    handleAnalyze(githubUrl, "", manualGithubToken || githubToken);
  };

  const handleZipClick = () => zipInputRef.current?.click();
  const handleFolderClick = () => folderInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setMode(TAB_MODES.UPLOAD);
      await processUploadedFiles(e.target.files);
    }
  };

  // Search submit handler
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchVal.trim() || !searchIndex || !project) return;
    setWorkspaceView('search');
    setSearchQuery(searchVal);
    const results = searchRepository(searchVal, searchIndex, project.files, RETRIEVAL.SEARCH_RESULT_LIMIT);
    setSearchResults(results);
  };

  const handleQASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const questionText = qaVal;
    setQaVal("");
    await runQuestion(questionText);
  };

  // Retrieval and generation for one question. Separated from the form handler so the
  // suggested questions on the overview run exactly the same path.
  const runQuestion = async (questionText: string) => {
    if (!questionText.trim() || !project) return;

    setWorkspaceView('qa');
    setQaQuestion(questionText);
    setIsQaLoading(true);
    setQaAnswer("");
    setQaEvidence([]);

    // Timed from before retrieval to after the last streamed token, so the recorded figure
    // is the latency the participant experiences rather than time-to-first-byte.
    const qaStart = performance.now();

    let systemContext = `You are a technical code tutor. Answer the user's question about the codebase. Refer to the provided source code context. Always cite files and explain reasoning. Avoid hallucinated claims.`;

    // The evidence actually sent to the model is recorded here and handed to the answer
    // view. Citations must be derived from this, never from parsing the answer text:
    // a path the model invents would otherwise be presented to the reader as a source.
    const evidence: RetrievedEvidence[] = [];
    if (searchIndex) {
      const matches = searchRepository(questionText, searchIndex, project.files, RETRIEVAL.RAG_TOP_K);
      matches.forEach(res => {
        const fileObj = project.files.find(f => f.path === res.path);
        if (fileObj && fileObj.content) {
          if (evidence.length === 0) {
            systemContext += "\n\n[Grounded Repository Context for RAG - Answer using this evidence and cite file paths]";
          }
          // The region most relevant to the question, not the head of the file, so the line
          // range shown as a citation is the text the model actually received.
          const region = selectExcerptRegion(fileObj.content, questionText, RETRIEVAL.RAG_CONTEXT_CHARS);
          systemContext += `\n\n--- File: ${res.path} (lines ${region.startLine}-${region.endLine} of ${region.totalLines}) ---\n${region.text}`;
          evidence.push({
            path: res.path,
            score: res.score,
            excerpt: region.text,
            startLine: region.startLine,
            endLine: region.endLine,
            totalLines: region.totalLines,
            omittedLines: region.omittedLines,
          });
        }
      });
    }
    const evidenceFileCount = evidence.length;
    setQaEvidence(evidence);

    // Retrieval can return nothing, or return files whose content was never loaded. The
    // prompt was previously sent unchanged in that case, so an ungrounded answer was
    // presented in a UI that implies grounding — the exact condition the study's
    // over-trust probes are meant to measure deliberately, not to produce by accident.
    if (evidenceFileCount === 0) {
      systemContext += "\n\n[No repository context could be retrieved for this question. Say so explicitly in the first sentence of your answer, and do not describe specific files, functions or behaviour in this repository.]";
    }

    try {
      const response = await fetch('/api/explain-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: questionText }],
          skillLevel,
          systemContext,
          stream: true
        })
      });

      if (!response.ok) throw new Error('Streaming failed');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('Response body was empty');

      let fullText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        // stream: true keeps a multi-byte character split across chunk boundaries intact;
        // without it such characters decode to U+FFFD in the answer the participant reads.
        fullText += decoder.decode(value, { stream: true });
        setQaAnswer(fullText);
      }
      fullText += decoder.decode();
      setQaAnswer(fullText);
      // The evidence count is recorded with the timing so an ungrounded answer is
      // identifiable in the exported metrics rather than indistinguishable from a
      // grounded one.
      recordMetric('qa_response', performance.now() - qaStart, `question ${questionText.length} chars, ${evidenceFileCount} evidence files`);
    } catch (error) {
      console.error("QA error:", error);
      setQaAnswer("I'm sorry, I encountered an error communicating with the AI service. Please verify server keys and try again.");
    } finally {
      setIsQaLoading(false);
    }
  };

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

  return (
    <ErrorBoundary>
      <SEO
        title="Repository Comprehension System"
        description="Understand unfamiliar codebases using static parsing, dependency graphing, semantic concept search, and grounded Q&A."
      />
      <div className="flex flex-col relative overflow-hidden min-h-[82vh]">
        <main className="flex-1 container mx-auto px-4 py-8 md:px-8 flex flex-col">
          {!project ? (
            (isLoading || isFileLoading) ? (
              // Screen 2: Analysing - Terminal style progress
              <div className="max-w-xl w-full mx-auto px-6 py-16 flex flex-col justify-center min-h-[50vh] animate-fade-in">
                <div className="bg-card border border-border rounded-[4px] p-6 shadow-none font-mono text-xs text-foreground space-y-2">
                  <div className="text-muted-foreground mb-4 font-bold border-b border-border pb-2 flex items-center justify-between">
                    <span>COMPILING INDEX</span>
                    <span className="animate-pulse text-accent">●</span>
                  </div>
                  {/* Reports the actual ingestion stage. The previous version animated a
                      fixed sequence ending in "ready" on a timer, which claimed completion
                      while fetching was still in progress. */}
                  <div className={ingestionProgress ? "text-accent" : ""}>&gt; resolving repository metadata...</div>
                  {ingestionProgress && ingestionProgress.phase !== "metadata" && (
                    <div className="text-accent">&gt; reading file tree...</div>
                  )}
                  {ingestionProgress?.phase === "fetching" && (
                    <>
                      <div>
                        &gt; fetching file contents... {ingestionProgress.completed}/{ingestionProgress.total}
                      </div>
                      <div
                        className="h-1 bg-secondary rounded-full overflow-hidden mt-2"
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={ingestionProgress.total || 1}
                        aria-valuenow={ingestionProgress.completed}
                        aria-label="Fetching repository files"
                      >
                        <div
                          className="h-full bg-accent transition-all duration-200"
                          style={{ width: `${Math.round((ingestionProgress.completed / (ingestionProgress.total || 1)) * 100)}%` }}
                        />
                      </div>
                      {ingestionProgress.currentPath && (
                        <div className="text-muted-foreground truncate">&gt; {ingestionProgress.currentPath}</div>
                      )}
                    </>
                  )}
                  {ingestionProgress?.phase === "indexing" && (
                    <div>&gt; building search index and dependency graph...</div>
                  )}
                  <div className="animate-pulse inline-block w-1.5 h-3 bg-accent ml-1 mt-2" />
                </div>
              </div>
            ) : (
              // Screen 1: Start
              <div className="max-w-2xl w-full mx-auto py-12 animate-fade-in space-y-8">
                <div className="space-y-2">
                  <h1 className="text-3xl font-semibold text-foreground tracking-tight">Analyse a repository</h1>
                  <p className="text-body text-muted-foreground max-w-[54ch]">
                    Paste a public GitHub URL. You get an overview, a searchable index, and
                    answers with the files they came from.
                  </p>
                </div>

                <form onSubmit={handleGithubAnalyze} className="space-y-3">
                  <Label htmlFor="github-url" className="block text-ui font-semibold text-foreground">
                    Repository URL
                  </Label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      id="github-url"
                      placeholder="https://github.com/expressjs/express"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      className="flex-1 h-12 text-path font-mono bg-input border-border rounded-md focus-visible:ring-primary"
                      disabled={isLoading}
                    />
                    <Button
                      type="submit"
                      className="h-12 px-6 text-ui font-semibold rounded-md bg-primary text-primary-foreground hover:bg-primary-glow border-none"
                      disabled={isLoading}
                    >
                      Analyse repository
                    </Button>
                  </div>
                  <p className="text-meta text-muted-foreground">
                    Search and questions work across most source and configuration files. The
                    dependency graph and code analysis cover JavaScript and TypeScript only.
                    Up to 50 files are indexed, and installed dependencies and build output
                    are skipped.
                  </p>
                </form>

                <div className="flex items-center gap-4" aria-hidden="true">
                  <span className="h-px flex-1 bg-border" />
                  <span className="text-meta text-muted-foreground">or</span>
                  <span className="h-px flex-1 bg-border" />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="file"
                    accept=".zip"
                    ref={zipInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleZipClick}
                    className="h-11 px-5 text-ui rounded-md border-border bg-card text-foreground hover:border-primary/60 hover:bg-surface-raised"
                    disabled={isLoading}
                  >
                    Upload a .zip
                  </Button>

                  <input
                    type="file"
                    multiple
                    ref={folderInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isLoading}
                    {...({ webkitdirectory: "true", directory: "true" } as Record<string, string>)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleFolderClick}
                    className="h-11 px-5 text-ui rounded-md border-border bg-card text-foreground hover:border-primary/60 hover:bg-surface-raised"
                    disabled={isLoading}
                  >
                    Choose a folder
                  </Button>

                  <button
                    type="button"
                    onClick={() => {
                      setGithubUrl(EXAMPLE_REPOSITORY);
                      setMode(TAB_MODES.GITHUB);
                      handleAnalyze(EXAMPLE_REPOSITORY, "", manualGithubToken || githubToken);
                    }}
                    className="text-ui text-primary underline underline-offset-2 hover:text-primary-glow disabled:opacity-50"
                    disabled={isLoading}
                  >
                    Try an example: expressjs/express
                  </button>
                </div>

                {recentRepos.length > 0 && (
                  <section className="space-y-3" aria-label="Recent repositories">
                    <h2 className="text-section text-foreground">Recent repositories</h2>
                    <ul className="rounded-md border border-border divide-y divide-border overflow-hidden bg-card">
                      {recentRepos.map((repo) => (
                        <li key={repo.url ?? repo.name}>
                          <button
                            type="button"
                            onClick={() => {
                              if (repo.url) {
                                setGithubUrl(repo.url);
                                setMode(TAB_MODES.GITHUB);
                                handleAnalyze(repo.url, "", manualGithubToken || githubToken);
                              }
                            }}
                            className="w-full flex items-center justify-between gap-4 px-4 py-3 text-left hover:bg-surface-raised transition-colors"
                          >
                            <span className="min-w-0">
                              <span className="block text-path font-mono text-foreground truncate">{repo.name}</span>
                              <span className="block text-meta text-muted-foreground">
                                {repo.indexed !== undefined && repo.total !== undefined
                                  ? `${repo.indexed} of ${repo.total} files indexed · ${repo.date}`
                                  : repo.date}
                              </span>
                            </span>
                            <span className="text-ui text-primary shrink-0" aria-hidden="true">Open</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            )
          ) : (
            // Screen 3: Repository Workspace - Three-panel layout (Explorer | Content | Insights)
            <div className="flex flex-col h-[82vh] border border-border rounded-[4px] bg-card overflow-hidden shadow-none animate-fade-in">
              {/* Workspace Top Bar */}
              <div className="bg-secondary/30 border-b border-border px-4 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-primary shrink-0" />
                     <h2
                       className="font-bold text-sm text-foreground truncate max-w-[150px] cursor-pointer hover:text-accent transition-colors"
                       title="View Repository Overview"
                       onClick={() => {
                         setSelectedFile(null);
                         setWorkspaceView('overview');
                       }}
                     >
                       {project.summary.name}
                     </h2>
                     <Badge variant="outline" className="text-[9px] font-mono px-1.5 py-0 border-border/80 hidden sm:inline-flex">
                       {project.summary.source}
                     </Badge>
                     <Button
                       variant="ghost"
                       size="icon"
                       className="w-5 h-5 ml-1 hover:bg-secondary rounded-md"
                       onClick={() => {
                         setProject(null);
                         setSelectedFile(null);
                         setWorkspaceView('overview');
                       }}
                       title="Close workspace"
                     >
                       <span className="text-xs text-muted-foreground">✕</span>
                     </Button>
                   </div>

                   {/* Unified Top Navigation Tabs */}
                   <div className="flex items-center gap-1 border-l border-border pl-4">
                     <button
                       onClick={() => {
                         setSelectedFile(null);
                         setWorkspaceView('overview');
                       }}
                       className={`text-xs px-2.5 py-1 rounded transition-colors ${
                         workspaceView === 'overview'
                           ? 'bg-secondary text-foreground font-semibold font-mono'
                           : 'text-muted-foreground hover:text-foreground font-mono'
                       }`}
                     >
                       Repository Overview
                     </button>
                     <button
                       onClick={() => {
                         setWorkspaceView('architecture');
                       }}
                       className={`text-xs px-2.5 py-1 rounded transition-colors ${
                         workspaceView === 'architecture'
                           ? 'bg-secondary text-foreground font-semibold font-mono'
                           : 'text-muted-foreground hover:text-foreground font-mono'
                       }`}
                     >
                       Architecture
                     </button>
                     <button
                       onClick={() => {
                         if (!selectedFile && project.files.length > 0) {
                           setSelectedFile(project.files[0].path);
                         }
                         setWorkspaceView('code');
                       }}
                       className={`text-xs px-2.5 py-1 rounded transition-colors ${
                         workspaceView === 'code' || workspaceView === 'search' || workspaceView === 'qa'
                           ? 'bg-secondary text-foreground font-semibold font-mono'
                           : 'text-muted-foreground hover:text-foreground font-mono'
                       }`}
                     >
                       Workspace
                     </button>
                   </div>
                 </div>

                 {/* Inputs: Search and Ask */}
                 <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                   {/* Search Bar */}
                   <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-[180px]">
                     <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                     <Input
                       placeholder="Search repository..."
                       value={searchVal}
                       onChange={(e) => setSearchVal(e.target.value)}
                       className="pl-8 h-8 text-xs bg-secondary/15 border-border/80"
                     />
                   </form>

                   {/* Ask Bar */}
                   <form onSubmit={handleQASubmit} className="relative w-full sm:w-[200px]">
                     <Sparkles className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-accent" />
                     <Input
                       placeholder="Ask about repository..."
                       value={qaVal}
                       onChange={(e) => setQaVal(e.target.value)}
                       className="pl-8 h-8 text-xs bg-secondary/15 border-border/80"
                     />
                   </form>
                 </div>
               </div>

               {/* Conditional Panels Layout */}
               <div className="flex-1 flex overflow-hidden">
                  {workspaceView === 'overview' ? (
                    // Screen 2: Repository Overview - Full width, no sidebars, no clutter
                    <div className="flex-1 h-full overflow-y-auto bg-background/30 flex justify-center">
                      <div className="max-w-5xl w-full p-6 animate-fade-in space-y-8">
                        {overview && (
                          <ProjectOverviewComponent
                            overview={overview}
                            project={project}
                            onFileSelect={(path) => {
                              handleFileSelect(path, manualGithubToken || githubToken);
                            }}
                          />
                        )}

                        {project.ingestion && (
                          <CoveragePanel
                            indexedFiles={project.ingestion.filesWithContent}
                            totalRepositoryFiles={project.ingestion.totalRepositoryFiles}
                            excluded={project.ingestion.excluded}
                            treeTruncated={project.ingestion.treeTruncatedByGitHub}
                          />
                        )}

                        <SuggestedQuestions onAsk={runQuestion} />
                      </div>
                    </div>
                  ) : (
                   // Screen 3: Repository Workspace - Three-panel layout (Explorer | Content | Insights)
                   <>
                     {/* Left Panel: File Explorer (260px) */}
                     <div className="w-[260px] md:w-[280px] shrink-0 border-r border-border/80 h-full overflow-y-auto bg-secondary/5">
                       <FolderTree
                         tree={scanResult?.folderTree || { name: "Root", path: "", type: "folder", children: [] }}
                         selectedFile={selectedFile}
                         onFileSelect={(path) => {
                           handleFileSelect(path, manualGithubToken || githubToken);
                           setWorkspaceView('code');
                         }}
                       />
                     </div>

                     {/* Middle Panel: Workspace Content (Flex 1) */}
                     <div className="flex-1 h-full overflow-hidden bg-background/30 flex flex-col">
                       {workspaceView === 'code' && (
                         <div className="h-full flex flex-col">
                           <div className="flex-1 min-h-0">
                             <CodeViewer
                               isLoading={isFileLoading}
                               fileName={selectedFile}
                               fileContent={currentFileContent}
                               onLineSelect={(line) => handleLineSelect(line)}
                               selectedLine={selectedLine}
                               selectedLines={selectedLines}
                             />
                           </div>
                         </div>
                       )}

                       {workspaceView === 'architecture' && (
                         <div className="h-full flex flex-col bg-code-bg overflow-hidden">
                           {/* VS Code style editor tab */}
                           <div className="bg-secondary/40 border-b border-border/80 h-9 flex items-center justify-between shrink-0 select-none px-1">
                             <div className="flex h-full items-center">
                               <div className="bg-code-bg text-foreground border-r border-border/80 h-full px-3.5 flex items-center gap-2 text-sm border-t-2 border-t-accent font-mono font-semibold">
                                 <Layers className="w-3.5 h-3.5 text-accent shrink-0" />
                                 <span>architecture-map.svg</span>
                               </div>
                             </div>
                             <Button
                               size="sm"
                               variant="ghost"
                               className="h-6 w-6 p-0 hover:bg-secondary/60 text-muted-foreground mr-2 rounded-sm"
                               onClick={() => setWorkspaceView('overview')}
                             >
                               ✕
                             </Button>
                           </div>
                           <div className="flex-1 min-h-0 p-4">
                             <DependencyGraph
                               project={project}
                               onFileSelect={(path) => {
                                 handleFileSelect(path, manualGithubToken || githubToken);
                                 setWorkspaceView('code');
                               }}
                             />
                           </div>
                         </div>
                       )}

                       {workspaceView === 'search' && (
                         <WorkspaceSearchView
                           query={searchQuery}
                           results={searchResults}
                           indexedFileCount={project.ingestion?.filesWithContent ?? project.files.length}
                           totalFileCount={project.ingestion?.totalRepositoryFiles ?? project.files.length}
                           projectFiles={project.files}
                           onBackToOverview={() => setWorkspaceView('overview')}
                           onFileSelect={(path) => {
                             handleFileSelect(path, manualGithubToken || githubToken);
                             setWorkspaceView('code');
                           }}
                         />
                       )}

                       {workspaceView === 'qa' && (
                         <WorkspaceQAView
                           question={qaQuestion}
                           answer={qaAnswer}
                           isLoading={isQaLoading}
                           evidence={qaEvidence}
                           excludedPaths={excludedPathReasons}
                           indexedFileCount={project.ingestion?.filesWithContent ?? project.files.length}
                           totalFileCount={project.ingestion?.totalRepositoryFiles ?? project.files.length}
                           onBackToOverview={() => setWorkspaceView('overview')}
                           onFileSelect={(path) => {
                             handleFileSelect(path, manualGithubToken || githubToken);
                             setWorkspaceView('code');
                           }}
                         />
                       )}
                     </div>

                     {/* Right Panel: Contextual Insights (300px / 320px) */}
                     <div className="w-[300px] md:w-[320px] shrink-0 border-l border-border/80 h-full overflow-y-auto">
                       <WorkspaceInsightsPanel
                         selectedFile={selectedFile}
                         analysis={selectedFile ? staticAnalyses[selectedFile] : null}
                         fileContent={currentFileContent}
                         allFiles={project.files}
                         onFileSelect={(path) => {
                           handleFileSelect(path, manualGithubToken || githubToken);
                           setWorkspaceView('code');
                         }}
                       />
                     </div>
                   </>
                 )}
               </div>
             </div>
           )}
         </main>
       </div>
     </ErrorBoundary>
   );
 };

 export default Index;
