import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Code2, Link2, FileCode2, ArrowRightLeft, CornerDownRight } from "lucide-react";
import { useProjectStore } from "@/store/useProjectStore";
import ExplanationPanel from "./ExplanationPanel";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ChatMessage } from "@/types/chat";

interface FileExplanationPanelProps {
  isLoading: boolean;
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  skillLevel: string;
  hasSelection: boolean;
  onFileSelect?: (path: string) => void;
}

export const FileExplanationPanel = ({
  isLoading,
  messages,
  onSendMessage,
  skillLevel,
  hasSelection,
  onFileSelect
}: FileExplanationPanelProps) => {
  const { selectedFile, staticAnalyses } = useProjectStore();

  const analysis = selectedFile ? staticAnalyses[selectedFile] : null;

  return (
    <div className="h-full flex flex-col bg-card border-border overflow-hidden rounded-xl shadow-sm">
      {selectedFile ? (
        <Tabs defaultValue="ai" className="h-full flex flex-col">
          <div className="bg-secondary/30 border-b border-border px-4 py-2.5 flex items-center justify-between">
            <div className="flex flex-col truncate max-w-[65%]">
              <span className="text-xs font-semibold text-foreground truncate" title={selectedFile}>
                {selectedFile.split("/").pop()}
              </span>
              <span className="text-[10px] text-muted-foreground truncate">{selectedFile}</span>
            </div>
            
            <TabsList className="bg-background/80 border border-border/80 h-8 p-0.5">
              <TabsTrigger value="ai" className="text-[10px] px-2.5 py-1 gap-1">
                <Sparkles className="w-3 h-3 text-primary" /> AI Tutor
              </TabsTrigger>
              <TabsTrigger value="structures" className="text-[10px] px-2.5 py-1 gap-1">
                <Code2 className="w-3 h-3" /> Structures
              </TabsTrigger>
              <TabsTrigger value="dependencies" className="text-[10px] px-2.5 py-1 gap-1">
                <ArrowRightLeft className="w-3 h-3" /> Relations
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            {/* AI Tutor Chat Tab */}
            <TabsContent value="ai" className="h-full m-0 border-none">
              <ExplanationPanel
                isLoading={isLoading}
                messages={messages}
                onSendMessage={onSendMessage}
                skillLevel={skillLevel}
                hasSelection={hasSelection}
              />
            </TabsContent>

            {/* Structures Tab (Functions/Classes/Components) */}
            <TabsContent value="structures" className="h-full m-0 p-4 overflow-y-auto space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                  <FileCode2 className="w-3.5 h-3.5 text-sky-500" /> Structures & Components
                </h4>
                
                {analysis && (analysis.components.length > 0 || analysis.functions.length > 0 || analysis.classes.length > 0) ? (
                  <div className="space-y-4">
                    {/* React Components */}
                    {analysis.components.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-muted-foreground block">React Components</span>
                        <div className="flex flex-wrap gap-1.5">
                          {analysis.components.map(comp => (
                            <Badge key={comp} className="bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border-none text-[10px] font-mono">
                              &lt;{comp} /&gt;
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Classes */}
                    {analysis.classes.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-muted-foreground block">Classes</span>
                        <div className="flex flex-wrap gap-1.5">
                          {analysis.classes.map(cls => (
                            <Badge key={cls} className="bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 border-none text-[10px] font-mono">
                              class {cls}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Functions */}
                    {analysis.functions.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-muted-foreground block">Declared Functions</span>
                        <div className="grid gap-1.5">
                          {analysis.functions.map(func => (
                            <div key={func.name} className="bg-secondary/20 border border-border/40 p-2 rounded-lg font-mono text-[10px] space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                {func.isAsync && <span className="text-purple-500 text-[9px] font-bold">async</span>}
                                <span className="text-sky-600 dark:text-sky-400 font-bold">{func.name}</span>
                                <span className="text-muted-foreground">({func.parameters.join(", ")})</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic text-center py-6">
                    No logical structures (functions, components, or classes) detected in this file.
                  </p>
                )}
              </div>
            </TabsContent>

            {/* Relations Tab (Imports, Exports, References) */}
            <TabsContent value="dependencies" className="h-full m-0 p-4 overflow-y-auto space-y-5">
              {/* Imports Section */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-blue-500" /> Outgoing Imports ({analysis?.imports.length || 0})
                </h4>
                
                {analysis && analysis.imports.length > 0 ? (
                  <div className="space-y-1.5">
                    {analysis.imports.map((imp, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col p-2 bg-secondary/15 rounded border border-border/50 text-[10px] gap-1"
                      >
                        <div className="flex items-center gap-1 truncate font-mono text-muted-foreground">
                          <span className="text-foreground font-semibold">{imp.name}</span>
                          <span>from</span>
                          <span className="italic truncate" title={imp.source}>{imp.source}</span>
                        </div>
                        {imp.resolvedPath && onFileSelect && (
                          <div className="flex items-center gap-1">
                            <CornerDownRight className="w-3 h-3 text-muted-foreground/60 shrink-0" />
                            <button
                              onClick={() => onFileSelect(imp.resolvedPath!)}
                              className="text-[9px] text-sky-600 dark:text-sky-400 hover:underline truncate text-left"
                            >
                              Jump to {imp.resolvedPath.split("/").pop()}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic pl-2">No dependencies imported.</p>
                )}
              </div>

              {/* Exports Section */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <CornerDownRight className="w-3.5 h-3.5 text-indigo-500" /> Exports ({analysis?.exports.length || 0})
                </h4>
                {analysis && analysis.exports.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.exports.map(exp => (
                      <Badge key={exp} variant="outline" className="text-[10px] font-mono bg-background">
                        {exp}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic pl-2">No explicit modules exported.</p>
                )}
              </div>

              {/* Incoming References (Used By) Section */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <CornerDownRight className="w-3.5 h-3.5 text-emerald-500" /> Incoming References ({analysis?.usedBy.length || 0})
                </h4>
                {analysis && analysis.usedBy.length > 0 ? (
                  <div className="space-y-1.5">
                    {analysis.usedBy.map(filePath => (
                      <div
                        key={filePath}
                        className="flex items-center justify-between p-2 bg-secondary/15 rounded border border-border/50 text-[10px] gap-2"
                      >
                        <span className="font-mono text-muted-foreground truncate" title={filePath}>
                          {filePath}
                        </span>
                        {onFileSelect && (
                          <Button
                            size="sm"
                            variant="link"
                            className="h-auto p-0 text-[10px] text-sky-600 dark:text-sky-400 font-semibold"
                            onClick={() => onFileSelect(filePath)}
                          >
                            Open
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic pl-2">
                    Not imported by any other files in the project.
                  </p>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      ) : (
        <div className="h-full flex flex-col items-center justify-center text-center p-8">
          <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mb-6">
            <FileCode2 className="w-8 h-8 text-muted-foreground animate-pulse" />
          </div>
          <h5 className="font-bold text-sm mb-2 text-foreground">No File Selected</h5>
          <p className="text-xs text-muted-foreground max-w-[220px]">
            Select a file in the project explorer to view its static structure and AI explanation.
          </p>
        </div>
      )}
    </div>
  );
};

export default FileExplanationPanel;
