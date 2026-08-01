import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, GitBranch, Sparkles } from "lucide-react";
import CodeViewer from "@/components/CodeViewer";
import FolderTree from "@/components/FolderTree";
import WorkspaceQAView, { type RetrievedEvidence } from "@/components/WorkspaceQAView";
import WorkspaceSearchView from "@/components/WorkspaceSearchView";
import FileInsightsPanel from "@/components/FileInsightsPanel";
import CoveragePanel from "@/components/CoveragePanel";
import SuggestedQuestions from "@/components/SuggestedQuestions";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { TAB_MODES, RETRIEVAL } from "@/constants/appConstants";
import { useProjectStore } from "@/store/useProjectStore";
import SEO from "@/components/SEO";
import { recordMetric } from "@/lib/evaluation/metrics";
import { useProjectManagement } from "@/hooks/useProjectManagement";
import { searchRepository, selectExcerptRegion, SearchResult } from "@/lib/semanticSearch";
import RepositoryOverview from "@/components/RepositoryOverview";
import { analyzeProject } from "@/lib/projectAnalyzer";
import {
  consumeGenerationStream,
  type GenerationCompleteEvent,
} from "@/lib/generationProtocol";

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

/** Ingestion stages in order, for the progress list on the analysing screen. */
const INGESTION_STEPS = [
  { phase: "metadata" as const, label: "Resolving repository metadata" },
  { phase: "tree" as const, label: "Reading the file list" },
  { phase: "fetching" as const, label: "Fetching file contents" },
  { phase: "indexing" as const, label: "Building the search index" },
];

function ingestionStepState(
  step: (typeof INGESTION_STEPS)[number]["phase"],
  current?: string
): "done" | "active" | "pending" {
  if (!current) return step === "metadata" ? "active" : "pending";
  const order = INGESTION_STEPS.map((s) => s.phase);
  const stepIndex = order.indexOf(step);
  const currentIndex = order.indexOf(current as (typeof order)[number]);
  if (stepIndex < currentIndex) return "done";
  if (stepIndex === currentIndex) return "active";
  return "pending";
}

type WorkspaceView = 'overview' | 'code' | 'search' | 'qa';

/**
 * The four views, in the order a user moves through them: orient, locate, read, ask.
 * Search and answer results are reached from the Code tab rather than being tabs of their
 * own, since both are entered from a field rather than by navigation.
 */
const WORKSPACE_TABS: { view: WorkspaceView; label: string; matches: WorkspaceView[] }[] = [
  { view: 'overview', label: 'Overview', matches: ['overview'] },
  { view: 'code', label: 'Code', matches: ['code'] },
  { view: 'qa', label: 'Answers', matches: ['qa', 'search'] },
];

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
  const [workspaceView, setWorkspaceView] = useState<WorkspaceView>('overview');
  // The file explorer and the per-file panel are only meaningful when a file is the
  // subject. An answer or a result list is the whole task and takes the full width;
  // nested inside three columns the answer prose collapsed to roughly 250px.
  const showsFileChrome = workspaceView === 'code';
  const [searchVal, setSearchVal] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [qaVal, setQaVal] = useState("");
  const [qaQuestion, setQaQuestion] = useState("");
  const [qaAnswer, setQaAnswer] = useState("");
  const [qaEvidence, setQaEvidence] = useState<RetrievedEvidence[]>([]);
  const [isQaLoading, setIsQaLoading] = useState(false);
  const [qaGenerationStatus, setQaGenerationStatus] = useState<
    'idle' | 'loading' | 'complete' | 'error'
  >('idle');
  const [qaCompletion, setQaCompletion] = useState<GenerationCompleteEvent | null>(null);

  const [githubUrl, setGithubUrl] = useState("");
  const [recentRepos, setRecentRepos] = useState<RecentRepoItem[]>([]);


  const {
    handleAnalyze,
    handleFileSelect,
    ingestionProgress
  } = useProjectManagement();

  const handleLineSelect = (lineNumber: number, isMultiSelect?: boolean) => {
    if (!currentFileContent) return;
    setSelectedLine(lineNumber);
    // Plain click starts a fresh selection; Ctrl/Cmd/Shift+click toggles the
    // line in or out of the existing one.
    if (!isMultiSelect) {
      setSelectedLines(new Set([lineNumber]));
      return;
    }
    const next = new Set(selectedLines);
    if (next.has(lineNumber)) next.delete(lineNumber);
    else next.add(lineNumber);
    setSelectedLines(next);
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
    handleAnalyze(githubUrl, "");
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
    setQaGenerationStatus('loading');
    setQaCompletion(null);
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
            omittedCharacters: region.omittedCharacters,
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

      if (!response.ok) {
        const failure = await response.json().catch(() => ({}));
        throw new Error(failure.error || `Generation request failed (${response.status})`);
      }

      if (!response.body) throw new Error('Response body was empty');

      let fullText = "";
      const completion = await consumeGenerationStream(response.body, (text) => {
        fullText += text;
        setQaAnswer(fullText);
      });
      if (!fullText.trim()) throw new Error('Generation completed without an answer');

      setQaAnswer(fullText);
      setQaCompletion(completion);
      setQaGenerationStatus('complete');
      // The evidence count is recorded with the timing so an ungrounded answer is
      // identifiable in the exported metrics rather than indistinguishable from a
      // grounded one.
      const outputTokens = completion.usageMetadata?.candidatesTokenCount;
      recordMetric(
        'qa_response',
        performance.now() - qaStart,
        `question ${questionText.length} chars, ${evidenceFileCount} evidence files, ` +
          `finish ${completion.finishReason}, output tokens ${outputTokens ?? 'unknown'}`
      );
    } catch (error) {
      console.error("QA error:", error);
      setQaGenerationStatus('error');
      setQaCompletion(null);
      setQaAnswer(
        `Answer generation did not complete: ${
          error instanceof Error ? error.message : 'unknown generation error'
        }. Please try again.`
      );
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
        description="Understand unfamiliar codebases using a repository overview, semantic search, and answers grounded in the files they came from."
      />
      <div className="flex flex-col relative overflow-hidden min-h-[82vh]">
        <main className="flex-1 container mx-auto px-4 py-8 md:px-8 flex flex-col">
          {!project ? (
            (isLoading || isFileLoading) ? (
              // Screen 2: Analysing
              <div className="max-w-2xl w-full mx-auto py-12 animate-fade-in space-y-6">
                <div className="space-y-2">
                  <h1 className="text-panel text-foreground">Analysing repository</h1>
                  <p className="text-body text-muted-foreground max-w-[54ch]">
                    Reading the file list, fetching source, and building the search index.
                    Larger repositories take longer.
                  </p>
                </div>

                <ol className="space-y-3">
                  {INGESTION_STEPS.map((step) => {
                    const state = ingestionStepState(step.phase, ingestionProgress?.phase);
                    return (
                      <li key={step.phase} className="flex items-start gap-3">
                        <span
                          className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                            state === "done" ? "bg-primary" : state === "active" ? "bg-primary animate-pulse" : "bg-secondary"
                          }`}
                          aria-hidden="true"
                        />
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <p className={`text-ui ${state === "pending" ? "text-muted-foreground" : "text-foreground"}`}>
                            {step.label}
                            {state === "done" && <span className="sr-only"> — complete</span>}
                          </p>

                          {step.phase === "fetching" && ingestionProgress?.phase === "fetching" && (
                            <div className="space-y-1.5">
                              <div
                                className="h-2 rounded-full bg-secondary overflow-hidden"
                                role="progressbar"
                                aria-valuemin={0}
                                aria-valuemax={ingestionProgress.total || 1}
                                aria-valuenow={ingestionProgress.completed}
                                aria-label="Fetching repository files"
                              >
                                <div
                                  className="h-full bg-primary transition-all duration-200"
                                  style={{ width: `${Math.round((ingestionProgress.completed / (ingestionProgress.total || 1)) * 100)}%` }}
                                />
                              </div>
                              <p className="text-meta text-muted-foreground">
                                {ingestionProgress.completed} of {ingestionProgress.total} files
                                {ingestionProgress.currentPath && ` · ${ingestionProgress.currentPath}`}
                              </p>
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
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
                    Search and questions work across most source and configuration files.
                    Import analysis on the overview covers JavaScript and TypeScript only.
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
                  <button
                    type="button"
                    onClick={() => {
                      setGithubUrl(EXAMPLE_REPOSITORY);
                      setMode(TAB_MODES.GITHUB);
                      handleAnalyze(EXAMPLE_REPOSITORY, "");
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
                                handleAnalyze(repo.url, "");
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
              {/* Workspace chrome: repository identity, the four views, and a way out */}
              <div className="border-b border-border px-4 py-2.5 flex flex-wrap items-center gap-x-6 gap-y-3 shrink-0 bg-card">
                <div className="flex items-center gap-2 min-w-0">
                  <GitBranch className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                  <span className="text-path font-mono text-foreground truncate max-w-[220px]">
                    {project.summary.owner ? `${project.summary.owner}/${project.summary.name}` : project.summary.name}
                  </span>
                </div>

                <nav aria-label="Workspace views">
                  <ul className="flex items-center gap-1">
                    {WORKSPACE_TABS.map((tab) => {
                      const isCurrent = tab.matches.includes(workspaceView);
                      return (
                        <li key={tab.view}>
                          <button
                            type="button"
                            aria-current={isCurrent ? "page" : undefined}
                            onClick={() => {
                              if (tab.view === 'overview') setSelectedFile(null);
                              if (tab.view === 'code' && !selectedFile && project.files.length > 0) {
                                setSelectedFile(project.files[0].path);
                              }
                              setWorkspaceView(tab.view);
                            }}
                            className={`px-3 py-1.5 rounded text-ui transition-colors ${
                              isCurrent
                                ? "bg-surface-raised text-foreground font-semibold"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {tab.label}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                <div className="flex flex-1 flex-wrap items-center justify-end gap-2.5 min-w-0">
                  <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-[200px]">
                    <label htmlFor="workspace-search" className="sr-only">Search the indexed code</label>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <Input
                      id="workspace-search"
                      placeholder="Search the code"
                      value={searchVal}
                      onChange={(e) => setSearchVal(e.target.value)}
                      className="pl-9 h-10 text-ui bg-input border-border rounded-md"
                    />
                  </form>

                  <form onSubmit={handleQASubmit} className="relative w-full sm:w-[220px]">
                    <label htmlFor="workspace-ask" className="sr-only">Ask a question about this repository</label>
                    <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" aria-hidden="true" />
                    <Input
                      id="workspace-ask"
                      placeholder="Ask a question"
                      value={qaVal}
                      onChange={(e) => setQaVal(e.target.value)}
                      className="pl-9 h-10 text-ui bg-input border-border rounded-md"
                    />
                  </form>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setProject(null);
                      setSelectedFile(null);
                      setWorkspaceView('overview');
                    }}
                    className="h-10 px-4 text-ui rounded-md border-border bg-card text-foreground hover:border-primary/60 hover:bg-surface-raised"
                  >
                    New repository
                  </Button>
                </div>
              </div>

               {/* Conditional Panels Layout */}
               <div className="flex-1 flex overflow-hidden">
                  {workspaceView === 'overview' ? (
                    // Screen 2: Repository Overview - Full width, no sidebars, no clutter
                    <div className="flex-1 h-full overflow-y-auto bg-background/30 flex justify-center">
                      <div className="max-w-5xl w-full p-6 animate-fade-in space-y-8">
                        <RepositoryOverview
                          project={project}
                          overview={overview}
                          staticAnalyses={staticAnalyses}
                          onFileSelect={(path) => {
                            handleFileSelect(path);
                            setWorkspaceView('code');
                          }}
                        />

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
                     {/* The explorer and the file panel belong to file-centred views. An
                         answer or a result list is the whole task, so they take the full
                         width rather than being squeezed into the middle column. */}
                     {showsFileChrome && (
                     <div className="w-[260px] md:w-[280px] shrink-0 border-r border-border/80 h-full overflow-y-auto bg-secondary/5">
                       <FolderTree
                         tree={scanResult?.folderTree || { name: "Root", path: "", type: "folder", children: [] }}
                         selectedFile={selectedFile}
                         onFileSelect={(path) => {
                           handleFileSelect(path);
                           setWorkspaceView('code');
                         }}
                       />
                     </div>
                     )}

                     {/* Middle Panel: Workspace Content (Flex 1) */}
                     <div className="flex-1 h-full overflow-hidden bg-background/30 flex flex-col">
                       {workspaceView === 'code' && (
                         <div className="h-full flex flex-col">
                           <div className="flex-1 min-h-0">
                             <CodeViewer
                               isLoading={isFileLoading}
                               fileName={selectedFile}
                               fileContent={currentFileContent}
                               onLineSelect={handleLineSelect}
                               selectedLine={selectedLine}
                               selectedLines={selectedLines}
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
                             handleFileSelect(path);
                             setWorkspaceView('code');
                           }}
                         />
                       )}

                       {workspaceView === 'qa' && (
                         <WorkspaceQAView
                           question={qaQuestion}
                           answer={qaAnswer}
                           isLoading={isQaLoading}
                           generationStatus={qaGenerationStatus}
                           completion={qaCompletion}
                           evidence={qaEvidence}
                           excludedPaths={excludedPathReasons}
                           indexedFileCount={project.ingestion?.filesWithContent ?? project.files.length}
                           totalFileCount={project.ingestion?.totalRepositoryFiles ?? project.files.length}
                           onBackToOverview={() => setWorkspaceView('overview')}
                           onFileSelect={(path) => {
                             handleFileSelect(path);
                             setWorkspaceView('code');
                           }}
                         />
                       )}
                     </div>

                     {showsFileChrome && (
                     <div className="w-[300px] md:w-[320px] shrink-0 border-l border-border/80 h-full overflow-y-auto">
                       <FileInsightsPanel
                         path={selectedFile}
                         analysis={selectedFile ? staticAnalyses[selectedFile] : null}
                         onFileSelect={(path) => {
                           handleFileSelect(path);
                           setWorkspaceView('code');
                         }}
                         onAsk={runQuestion}
                       />
                     </div>
                     )}
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
