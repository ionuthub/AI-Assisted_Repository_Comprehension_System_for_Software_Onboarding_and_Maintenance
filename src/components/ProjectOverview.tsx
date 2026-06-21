import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Lightbulb,
  Code2,
  Zap,
  BookOpen,
  GitBranch,
  Download,
  FileText,
  Boxes,
  Activity,
  Layers,
  Wrench,
  ChevronRight,
  Search,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import type { ProjectOverview } from "@/lib/projectAnalyzer";
import type { Project } from "@/types/project";
import DependencyGraph from "./DependencyGraph";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { downloadProject } from "@/lib/download";
import { useProjectStore } from "@/store/useProjectStore";

interface ProjectOverviewProps {
  overview: ProjectOverview;
  project: Project;
  onFileSelect?: (path: string) => void;
}

const getLanguageColor = (name: string): string => {
  const colors: Record<string, string> = {
    JavaScript: "#f1e05a",
    TypeScript: "#3178c6",
    HTML: "#e34c26",
    CSS: "#563d7c",
    Python: "#3572A5",
    JSON: "#292929",
    Markdown: "#083fa1",
    Shell: "#89e051",
    C: "#555555",
    "C++": "#f34b7d",
    Rust: "#dea584",
    Go: "#00ADD8"
  };
  return colors[name] || "#6b7280";
};

export default function ProjectOverviewComponent({ overview, project, onFileSelect }: ProjectOverviewProps) {
  const { scanResult, staticAnalyses } = useProjectStore();

  const totalComponents = useMemo(() => {
    return Object.values(staticAnalyses).reduce((sum, file) => sum + (file.components?.length || 0), 0);
  }, [staticAnalyses]);

  const totalFunctions = useMemo(() => {
    return Object.values(staticAnalyses).reduce((sum, file) => sum + (file.functions?.length || 0), 0);
  }, [staticAnalyses]);

  const languageData = useMemo(() => {
    if (!scanResult) return [];
    const total = Object.values(scanResult.languages).reduce((sum, l) => sum + l.size, 0) || 1;
    return Object.entries(scanResult.languages)
      .map(([name, stats]) => ({
        name,
        count: stats.count,
        size: stats.size,
        percentage: (stats.size / total) * 100
      }))
      .sort((a, b) => b.size - a.size);
  }, [scanResult]);

  const achievements = useMemo(() => {
    const list = [];
    if (overview.difficulty === 'easy') {
      list.push({
        icon: "🎓",
        title: "Beginner Friendly",
        desc: "Super simple structure, great for starting out!",
        color: "from-green-500/10 to-emerald-500/10 border-green-500/20 text-green-700 dark:text-green-300"
      });
    } else if (overview.difficulty === 'medium') {
      list.push({
        icon: "⚔️",
        title: "Intermediate Explorer",
        desc: "Good balance of complexity and modular patterns.",
        color: "from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300"
      });
    } else {
      list.push({
        icon: "👑",
        title: "Grandmaster Code",
        desc: "Deep structure and professional design patterns.",
        color: "from-red-500/10 to-rose-500/10 border-red-500/20 text-red-700 dark:text-red-300"
      });
    }

    if (totalComponents > 5) {
      list.push({
        icon: "🧱",
        title: "Lego Master",
        desc: "Nicely broken down into reusable UI components!",
        color: "from-sky-500/10 to-blue-500/10 border-sky-500/20 text-sky-700 dark:text-sky-300"
      });
    }

    if (totalFunctions > 15) {
      list.push({
        icon: "⚡",
        title: "Spellcaster",
        desc: "Loaded with functions to perform complex operations.",
        color: "from-purple-500/10 to-indigo-500/10 border-purple-500/20 text-purple-700 dark:text-purple-300"
      });
    }

    const isTS = languageData.some(l => l.name === 'TypeScript');
    if (isTS) {
      list.push({
        icon: "🛡️",
        title: "Type Shield Active",
        desc: "Written in TypeScript for extra type safety!",
        color: "from-indigo-500/10 to-blue-500/10 border-indigo-500/20 text-indigo-700 dark:text-indigo-300"
      });
    }

    if (scanResult && scanResult.totalSize < 500 * 1024) {
      list.push({
        icon: "🪶",
        title: "Featherweight",
        desc: "Very lightweight codebase, loads in a flash!",
        color: "from-teal-500/10 to-cyan-500/10 border-teal-500/20 text-teal-700 dark:text-teal-300"
      });
    }

    return list;
  }, [overview.difficulty, totalComponents, totalFunctions, languageData, scanResult]);

  const formatBytes = (bytes?: number) => {
    if (bytes === undefined || bytes === null) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const simplicityPercentage = overview.difficulty === 'easy' ? 95 : overview.difficulty === 'medium' ? 70 : 40;
  const modularityPercentage = totalComponents > 0 ? Math.min(95, 45 + totalComponents * 8) : 40;
  const docPercentage = scanResult?.keyFiles && scanResult.keyFiles.length > 0 ? Math.min(95, 55 + scanResult.keyFiles.length * 8) : 45;

  const radius1 = 45; // Simplicity
  const radius2 = 33; // Modularity
  const radius3 = 21; // Docs

  const circ1 = 2 * Math.PI * radius1;
  const circ2 = 2 * Math.PI * radius2;
  const circ3 = 2 * Math.PI * radius3;

  const offset1 = circ1 - (simplicityPercentage / 100) * circ1;
  const offset2 = circ2 - (modularityPercentage / 100) * circ2;
  const offset3 = circ3 - (docPercentage / 100) * circ3;

  return (
    <Card id="project-overview" className="p-0 mb-6 bg-card border-border rounded-[4px] overflow-hidden shadow-none">
      <Tabs defaultValue="overview" className="w-full">
        <div className="bg-secondary/35 px-6 py-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-[4px] border border-border">
              <Layers className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground font-mono uppercase tracking-wider">Repository Specs</h2>
              <p className="text-[11px] text-muted-foreground font-mono">Index details and architecture mappings</p>
            </div>
          </div>

          <div className="flex gap-2 items-center flex-wrap">
            {project.summary.source === 'generated' && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-[10px] font-mono h-8 rounded-[4px] border-border hover:border-accent hover:bg-secondary/20 hover:text-foreground bg-background hidden md:flex"
                onClick={() => downloadProject(project)}
              >
                <Download className="w-3.5 h-3.5" /> Download ZIP
              </Button>
            )}
            <TabsList className="bg-background border border-border rounded-[4px] p-0.5">
              <TabsTrigger 
                value="overview" 
                className="gap-1 text-[10px] uppercase font-mono h-7 px-3 rounded-[4px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-bold"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="tech" 
                className="gap-1 text-[10px] uppercase font-mono h-7 px-3 rounded-[4px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-bold"
              >
                Tech Stack
              </TabsTrigger>
              <TabsTrigger 
                value="graph" 
                className="gap-1 text-[10px] uppercase font-mono h-7 px-3 rounded-[4px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-bold"
              >
                Project Map
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <div className="p-6">
          {/* Main Dashboard Stats Cards */}
          {scanResult && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <Card className="bg-secondary/10 border-border p-4 rounded-[4px] shadow-none flex flex-col justify-between h-20">
                <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider font-mono">Files</p>
                <p className="text-xl font-bold font-mono text-foreground">{scanResult.fileCount}</p>
              </Card>

              <Card className="bg-secondary/10 border-border p-4 rounded-[4px] shadow-none flex flex-col justify-between h-20">
                <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider font-mono">Components</p>
                <p className="text-xl font-bold font-mono text-foreground">{totalComponents}</p>
              </Card>

              <Card className="bg-secondary/10 border-border p-4 rounded-[4px] shadow-none flex flex-col justify-between h-20">
                <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider font-mono">Functions</p>
                <p className="text-xl font-bold font-mono text-foreground">{totalFunctions}</p>
              </Card>

              <Card className="bg-secondary/10 border-border p-4 rounded-[4px] shadow-none flex flex-col justify-between h-20">
                <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider font-mono">Repo Size</p>
                <p className="text-lg font-bold font-mono text-foreground">{formatBytes(scanResult.totalSize)}</p>
              </Card>

              <Card className="bg-secondary/10 border-border p-4 rounded-[4px] shadow-none flex flex-col justify-between h-20 col-span-2 md:col-span-1">
                <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider font-mono">Complexity</p>
                <p className="text-sm font-bold font-mono text-foreground uppercase">{scanResult.complexityScore}</p>
              </Card>
            </div>
          )}

          {/* Tab 1: Core Overview */}
          <TabsContent value="overview" className="mt-0 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
              {/* Left Column: Repository Summary */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider block">
                    Summary
                  </span>
                  <p className="text-xs text-foreground/90 font-mono leading-relaxed bg-secondary/10 p-4 border border-border rounded-[4px]">
                    {scanResult?.architectureSummary || overview.description}
                  </p>
                </div>

                {/* Key Files Registry */}
                {scanResult && scanResult.keyFiles.length > 0 && (
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider block">
                      Code Landmarks
                    </span>
                    <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                      {scanResult.keyFiles.map((file) => (
                        <div
                          key={file.path}
                          className="flex items-center justify-between p-3 rounded-[4px] border border-border bg-secondary/5 hover:bg-secondary/10 transition-colors gap-3"
                        >
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-mono font-bold text-primary truncate">
                              {file.path}
                            </span>
                            <span className="text-[10px] font-mono text-muted-foreground truncate mt-1">
                              {file.purpose}
                            </span>
                          </div>
                          {onFileSelect && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-[10px] font-mono px-3 shrink-0 rounded-[4px] border-border hover:border-accent hover:bg-secondary/20 hover:text-foreground bg-background"
                              onClick={() => onFileSelect(file.path)}
                            >
                              Explore
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Code Distribution, Framework */}
              <div className="space-y-6">
                {/* GitHub-style Language Distribution */}
                {languageData.length > 0 && (
                  <Card className="p-4 bg-secondary/10 border-border rounded-[4px] shadow-none">
                    <h4 className="text-[10px] font-bold font-mono uppercase tracking-wider text-muted-foreground mb-4">Languages</h4>
                    <div className="space-y-3">
                      {/* Unified Bar */}
                      <div className="w-full flex h-1.5 rounded-full overflow-hidden bg-secondary/50">
                        {languageData.map((lang) => {
                          const color = getLanguageColor(lang.name);
                          return (
                            <div
                              key={lang.name}
                              style={{ 
                                width: `${lang.percentage}%`,
                                backgroundColor: color 
                              }}
                              className="transition-all duration-300"
                              title={`${lang.name}: ${lang.percentage.toFixed(1)}%`}
                            />
                          );
                        })}
                      </div>

                      {/* Legend Grid */}
                      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 font-mono">
                        {languageData.map((lang) => {
                          const color = getLanguageColor(lang.name);
                          return (
                            <div key={lang.name} className="flex items-center gap-1.5 text-xs">
                              <span 
                                className="w-2 h-2 rounded-full inline-block shrink-0" 
                                style={{ backgroundColor: color }}
                              />
                              <span className="font-semibold text-foreground text-[11px]">{lang.name}</span>
                              <span className="text-muted-foreground text-[10px]">
                                {lang.percentage.toFixed(1)}%
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </Card>
                )}

                {/* Tech context & level */}
                <Card className="p-4 bg-secondary/10 border-border rounded-[4px] shadow-none space-y-4 font-mono text-xs">
                  <div className="flex justify-between items-center pb-3 border-b border-border/60">
                    <span className="text-muted-foreground text-[10px] uppercase tracking-wider font-bold">Framework</span>
                    <span className="text-foreground font-bold">{scanResult?.techStack[0]?.name || "Vanilla Setup"}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-[10px] uppercase tracking-wider font-bold">Difficulty</span>
                    <span className="text-primary font-bold uppercase">{overview.difficulty}</span>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Tab 2: Tech Stack */}
          <TabsContent value="tech" className="mt-0">
            <div className="space-y-4">
              <div className="border-b border-border pb-3">
                <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-foreground">Libraries Registry</h4>
                <p className="text-[10px] text-muted-foreground font-mono">Detected frameworks and dependencies</p>
              </div>
              
              {scanResult && scanResult.techStack.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {scanResult.techStack.map((tech) => (
                    <Card key={tech.name} className="p-4 bg-secondary/10 border-border rounded-[4px] shadow-none space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-primary">{tech.name}</span>
                        <span className="text-[9px] text-muted-foreground uppercase font-mono border border-border px-1.5 py-0.5 rounded bg-background">
                          {tech.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-foreground/80 leading-relaxed font-sans">{tech.description}</p>
                      <div className="text-[10px] text-muted-foreground bg-background/50 p-2 border border-border/40 rounded-[4px] font-mono">
                        <span className="text-foreground font-bold text-[9px] uppercase tracking-wider block mb-0.5">Role</span>
                        {tech.whyUsed}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed border-border rounded-[4px] bg-secondary/5">
                  <p className="text-xs text-muted-foreground italic font-mono">No third-party packages mapped.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Tab 3: Project Map */}
          <TabsContent value="graph" className="mt-0">
            <DependencyGraph project={project} onFileSelect={onFileSelect} />
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
}
