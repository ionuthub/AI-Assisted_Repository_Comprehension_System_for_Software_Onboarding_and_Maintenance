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
import WorkspaceQAView from "@/components/WorkspaceQAView";
import WorkspaceSearchView from "@/components/WorkspaceSearchView";
import WorkspaceInsightsPanel from "@/components/WorkspaceInsightsPanel";
import DependencyGraph from "@/components/DependencyGraph";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { TAB_MODES } from "@/constants/appConstants";
import { useProjectStore } from "@/store/useProjectStore";
import SEO from "@/components/SEO";
import { recordMetric } from "@/lib/evaluation/metrics";
import { useGitHubAuth } from "@/hooks/useGitHubAuth";
import { useProjectManagement } from "@/hooks/useProjectManagement";
import { searchRepository, SearchResult } from "@/lib/semanticSearch";
import { detectCodeBlock } from "@/lib/blockDetector";
import ProjectOverviewComponent from "@/components/ProjectOverview";
import { analyzeProject } from "@/lib/projectAnalyzer";

interface RecentRepoItem {
  name: string;
  url?: string;
  date: string;
}

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

  // Workspace dynamic view states
  const [workspaceView, setWorkspaceView] = useState<'overview' | 'code' | 'architecture' | 'search' | 'qa'>('overview');
  const [searchVal, setSearchVal] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [qaVal, setQaVal] = useState("");
  const [qaQuestion, setQaQuestion] = useState("");
  const [qaAnswer, setQaAnswer] = useState("");
  const [isQaLoading, setIsQaLoading] = useState(false);

  const [githubUrl, setGithubUrl] = useState("");
  const [recentRepos, setRecentRepos] = useState<RecentRepoItem[]>([]);

  const zipInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const {
    processUploadedFiles,
    handleAnalyze,
    handleFileSelect
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

  const addRecentRepo = useCallback((name: string, url?: string) => {
    setRecentRepos((prev) => {
      const list = [...prev];
      const existingIndex = list.findIndex(r => r.name === name || (url && r.url === url));
      if (existingIndex !== -1) {
        list.splice(existingIndex, 1);
      }
      list.unshift({ name, url, date: new Date().toLocaleDateString() });
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
      addRecentRepo(name, url);
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
    const results = searchRepository(searchVal, searchIndex, project.files, 10);
    setSearchResults(results);
  };

  // RAG Q&A submit handler
  const handleQASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qaVal.trim() || !project) return;

    const questionText = qaVal;
    setQaVal("");
    setWorkspaceView('qa');
    setQaQuestion(questionText);
    setIsQaLoading(true);
    setQaAnswer("");

    // Timed from before retrieval to after the last streamed token, so the recorded figure
    // is the latency the participant experiences rather than time-to-first-byte.
    const qaStart = performance.now();

    let systemContext = `You are a technical code tutor. Answer the user's question about the codebase. Refer to the provided source code context. Always cite files and explain reasoning. Avoid hallucinated claims.`;

    if (searchIndex) {
      const matches = searchRepository(questionText, searchIndex, project.files, 3);
      if (matches.length > 0) {
        systemContext += "\n\n[Grounded Repository Context for RAG - Answer using this evidence and cite file paths]";
        matches.forEach(res => {
          const fileObj = project.files.find(f => f.path === res.path);
          if (fileObj && fileObj.content) {
            systemContext += `\n\n--- File: ${res.path} ---\n${fileObj.content.slice(0, 2500)}`;
          }
        });
      }
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
      recordMetric('qa_response', performance.now() - qaStart, `question ${questionText.length} chars`);
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
        <main className="flex-1 container mx-auto px-4 py-8 md:px-8 flex flex-col justify-center">
          {!project ? (
            (isLoading || isFileLoading) ? (
              // Screen 2: Analysing - Terminal style progress
              <div className="max-w-xl w-full mx-auto px-6 py-16 flex flex-col justify-center min-h-[50vh] animate-fade-in">
                <div className="bg-card border border-border rounded-[4px] p-6 shadow-none font-mono text-xs text-foreground space-y-2">
                  <div className="text-muted-foreground mb-4 font-bold border-b border-border pb-2 flex items-center justify-between">
                    <span>COMPILING INDEX</span>
                    <span className="animate-pulse text-accent">●</span>
                  </div>
                  <div>&gt; reading repository...</div>
                  <div className="animate-fade-in delay-200">&gt; indexing files...</div>
                  <div className="animate-fade-in delay-500">&gt; extracting imports...</div>
                  <div className="animate-fade-in delay-1000">&gt; building dependency graph...</div>
                  <div className="animate-fade-in delay-1500">&gt; generating summaries...</div>
                  <div className="animate-fade-in delay-2000 text-accent font-bold">✓ ready</div>
                  <div className="animate-pulse inline-block w-1.5 h-3 bg-accent ml-1 mt-2" />
                </div>
              </div>
            ) : (
              // Screen 1: Selection Screen
              <div className="max-w-xl w-full mx-auto px-6 py-16 flex flex-col justify-center min-h-[50vh] animate-fade-in space-y-6">
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold text-foreground font-sans tracking-tight">
                    Repository Comprehension System
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Automated codebase comprehension and dependency mapping.
                  </p>
                </div>

                <div className="bg-card border border-border p-6 rounded-[4px] space-y-4 shadow-none">
                  <form onSubmit={handleGithubAnalyze} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="github-url" className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider font-mono">
                        GitHub repository URL
                      </Label>
                      <Input
                        id="github-url"
                        placeholder="https://github.com/username/repository"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        className="text-xs bg-background border-border rounded-[4px] focus-visible:ring-accent font-mono h-9"
                        disabled={isLoading}
                      />
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                      <Button
                        type="submit"
                        className="bg-accent hover:bg-accent-hover text-background font-bold text-xs h-9 rounded-[4px] px-5 transition-colors border-none"
                        disabled={isLoading}
                      >
                        Analyse Repository
                      </Button>
                      
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
                        className="border border-border bg-transparent text-muted-foreground hover:border-accent hover:bg-secondary/20 hover:text-foreground text-xs h-9 rounded-[4px] px-5 transition-colors"
                        disabled={isLoading}
                      >
                        Upload ZIP
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
                        className="border border-border bg-transparent text-muted-foreground hover:border-accent hover:bg-secondary/20 hover:text-foreground text-xs h-9 rounded-[4px] px-5 transition-colors"
                        disabled={isLoading}
                      >
                        Select Directory
                      </Button>
                    </div>
                  </form>

                  <div className="text-[10px] text-muted-foreground border-t border-border pt-3 font-mono">
                    JS/TS only · Evaluation build · Static Analysis
                  </div>
                </div>

                {/* Recent Repositories */}
                {recentRepos.length > 0 && (
                  <div className="space-y-2 font-mono">
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-1">
                      Recent Repositories
                    </h3>
                    <div className="border border-border rounded-[4px] divide-y divide-border overflow-hidden bg-card">
                      {recentRepos.map((repo) => (
                        <button
                          // Keyed by URL, not index: addRecentRepo moves an existing entry
                          // to the front, so an index key would reuse the wrong node.
                          key={repo.url ?? repo.name}
                          onClick={() => {
                            if (repo.url) {
                              setGithubUrl(repo.url);
                              setMode(TAB_MODES.GITHUB);
                              handleAnalyze(repo.url, "", manualGithubToken || githubToken);
                            }
                          }}
                          className="w-full flex items-center justify-between p-3 hover:bg-secondary/20 transition-colors text-left text-xs font-mono"
                        >
                          <span className="truncate pr-4 text-foreground">{repo.name}</span>
                          <span className="text-[9px] text-muted-foreground shrink-0">{repo.date}</span>
                        </button>
                      ))}
                    </div>
                  </div>
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
                     <Badge variant="outline" className="text-[9px] uppercase font-mono px-1.5 py-0 border-border/80 hidden sm:inline-flex">
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
                       <span className="text-[10px] text-muted-foreground">✕</span>
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
                      <div className="max-w-5xl w-full p-6 animate-fade-in">
                        {overview && (
                          <ProjectOverviewComponent
                            overview={overview}
                            project={project}
                            onFileSelect={(path) => {
                              handleFileSelect(path, manualGithubToken || githubToken);
                            }}
                          />
                        )}
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
                               <div className="bg-code-bg text-foreground border-r border-border/80 h-full px-3.5 flex items-center gap-2 text-[11px] border-t-2 border-t-accent font-mono font-semibold">
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
