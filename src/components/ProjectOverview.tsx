import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Code2, Zap, BookOpen, GitBranch, Map } from "lucide-react";
import type { ProjectOverview } from "@/lib/projectAnalyzer";
import type { Project } from "@/types/project";
import DependencyGraph from "./DependencyGraph";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProjectOverviewProps {
  overview: ProjectOverview;
  project: Project;
  onFileSelect?: (path: string) => void;
}

export default function ProjectOverviewComponent({ overview, project, onFileSelect }: ProjectOverviewProps) {
  return (
    <Card className="p-0 mb-6 bg-card border-border overflow-hidden shadow-xl">
      <Tabs defaultValue="overview" className="w-full">
        <div className="bg-secondary/30 px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-xl">
              <Map className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Mission Briefing</h2>
              <p className="text-xs text-muted-foreground">{overview.projectType}</p>
            </div>
          </div>

          <TabsList className="bg-background/50 border border-border">
            <TabsTrigger value="overview" className="gap-2 text-xs">
              <Lightbulb className="w-3.5 h-3.5" /> Overview
            </TabsTrigger>
            <TabsTrigger value="path" className="gap-2 text-xs">
              <BookOpen className="w-3.5 h-3.5" /> Learning Path
            </TabsTrigger>
            <TabsTrigger value="graph" className="gap-2 text-xs">
              <GitBranch className="w-3.5 h-3.5" /> Project Map
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="p-6">
          <TabsContent value="overview" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
              <div className="space-y-6">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {overview.explanation.map((line, idx) => {
                    if (line === "") return <div key={idx} className="h-2" />;
                    if (line.startsWith("**")) return <h4 key={idx} className="font-bold text-lg mt-4 mb-2">{line.replace(/\*\*/g, "")}</h4>;
                    if (line.startsWith("•")) return <div key={idx} className="ml-4 flex items-center gap-2 mb-1 opacity-90 text-sm"><span className="text-primary">•</span>{line.replace("•", "").trim()}</div>;
                    return <p key={idx} className="opacity-90 leading-relaxed mb-4 text-sm">{line}</p>;
                  })}
                </div>
              </div>

              <div className="space-y-6">
                <Card className="p-4 bg-secondary/20 border-border">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Complexity Score</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant={overview.difficulty === 'easy' ? 'default' : overview.difficulty === 'medium' ? 'secondary' : 'destructive'} className="text-xs px-3">
                      {overview.difficulty.toUpperCase()}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground italic">Based on {project.files.length} files</span>
                  </div>
                </Card>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                      <Code2 className="w-3 h-3" /> Tech Stack
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {overview.frameworks.map(f => (
                        <Badge key={f} variant="outline" className="text-[10px] bg-background">{f}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                      <Zap className="w-3 h-3" /> Highlights
                    </h4>
                    <div className="space-y-1.5">
                      {overview.keyFeatures.slice(0, 4).map(f => (
                        <div key={f} className="text-[11px] flex items-center gap-2 text-foreground/80">
                          <div className="w-1 h-1 bg-sky-500 rounded-full" /> {f}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="path" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {overview.learningPath.map((step, idx) => (
                <Card key={idx} className="p-4 border-dashed border-primary/20 bg-primary/5">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                    <span className="text-xs font-bold text-primary">{idx + 1}</span>
                  </div>
                  <h5 className="font-bold text-sm mb-1">{step.day}</h5>
                  <p className="text-[11px] text-muted-foreground mb-3">{step.goal}</p>
                  <div className="space-y-1">
                    {step.focus.map(f => (
                      <div key={f} className="text-[10px] bg-background/50 p-1.5 rounded border border-border truncate font-mono">
                        {f}
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="graph" className="mt-0">
            <DependencyGraph project={project} onFileSelect={onFileSelect} />
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
}
