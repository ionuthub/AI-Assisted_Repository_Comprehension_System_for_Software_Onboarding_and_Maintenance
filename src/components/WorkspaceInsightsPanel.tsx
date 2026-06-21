import React, { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileCode, Link2, CornerDownRight, HelpCircle, GitCommit } from "lucide-react";
import type { FileAnalysisResult } from "@/lib/staticAnalysis";

interface WorkspaceInsightsPanelProps {
  selectedFile: string | null;
  analysis: FileAnalysisResult | null;
  fileContent: string | null;
  allFiles: { path: string }[];
  onFileSelect?: (path: string) => void;
}

export default function WorkspaceInsightsPanel({
  selectedFile,
  analysis,
  fileContent,
  allFiles,
  onFileSelect
}: WorkspaceInsightsPanelProps) {
  // Compute related/sibling files (in the same directory)
  const relatedFiles = useMemo(() => {
    if (!selectedFile) return [];
    const parts = selectedFile.split("/");
    parts.pop(); // Remove file name
    const currentDir = parts.join("/");

    return allFiles
      .filter((f) => {
        if (f.path === selectedFile) return false;
        if (!currentDir) return !f.path.includes("/"); // root files
        return f.path.startsWith(currentDir + "/") && f.path.replace(currentDir + "/", "").split("/").length === 1;
      })
      .slice(0, 5);
  }, [selectedFile, allFiles]);

  // Compute a simple client-side file purpose summary based on analysis metadata
  const filePurpose = useMemo(() => {
    if (!selectedFile) return "";
    const name = selectedFile.split("/").pop() || "";
    
    let summary = `This file handles `;
    if (analysis) {
      if (analysis.isApiRoute) {
        summary += "backend API routes and request validation.";
      } else if (analysis.components.length > 0) {
        summary += `rendering user interface components: ${analysis.components.join(", ")}.`;
      } else if (analysis.classes.length > 0) {
        summary += `OOP classes and object models: ${analysis.classes.join(", ")}.`;
      } else if (analysis.functions.length > 0) {
        summary += `helper utilities and core logic functions: ${analysis.functions.map(f => f.name).slice(0, 3).join(", ")}.`;
      } else {
        summary += `code logic for the ${name.split(".")[0]} module.`;
      }
    } else {
      summary += `static setup variables for the workspace.`;
    }
    return summary;
  }, [selectedFile, analysis]);

  if (!selectedFile) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-card border-l border-border/80">
        <div className="w-12 h-12 bg-secondary/50 rounded-full flex items-center justify-center mb-4 border border-border/60">
          <HelpCircle className="w-5 h-5 text-muted-foreground" />
        </div>
        <h5 className="font-bold text-xs mb-1 text-foreground">No File Selected</h5>
        <p className="text-[10px] text-muted-foreground max-w-[200px] leading-relaxed">
          Select a file in the repository explorer tree to display contextual insights here.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-card border-l border-border/80 overflow-hidden text-xs">
      {/* Panel Header */}
      <div className="bg-secondary/20 border-b border-border px-4 py-3 shrink-0">
        <h3 className="font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider text-[10px] text-muted-foreground">
          <FileCode className="w-3.5 h-3.5 text-primary" /> Contextual Insights
        </h3>
        <p className="text-[10px] text-muted-foreground mt-0.5 truncate" title={selectedFile}>
          {selectedFile.split("/").pop()}
        </p>
      </div>

      {/* Panel Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Purpose */}
        <div className="space-y-2">
          <h4 className="font-bold text-foreground text-xs">Purpose</h4>
          <p className="text-[11px] text-foreground/80 leading-relaxed bg-secondary/10 p-3 rounded-[4px] border border-border/40 font-normal">
            {filePurpose}
          </p>
        </div>

        {/* Dependencies (Imports) */}
        <div className="space-y-2.5">
          <h4 className="font-bold text-foreground text-xs flex items-center gap-1">
            <Link2 className="w-3.5 h-3.5 text-muted-foreground" /> Outgoing Imports ({analysis?.imports.length || 0})
          </h4>
          
          {analysis && analysis.imports.length > 0 ? (
            <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-0.5">
              {analysis.imports.map((imp, idx) => (
                <div
                  key={idx}
                  className="flex flex-col p-2 bg-secondary/10 rounded-[2px] border border-border/30 text-[10px] gap-1"
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
                        className="text-[9px] text-primary hover:underline truncate text-left"
                      >
                        Jump to {imp.resolvedPath.split("/").pop()}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[10px] text-muted-foreground italic pl-1">No outgoing imports.</p>
          )}
        </div>

        {/* Used By (References) */}
        <div className="space-y-2.5">
          <h4 className="font-bold text-foreground text-xs flex items-center gap-1">
            <GitCommit className="w-3.5 h-3.5 text-muted-foreground" /> Incoming References ({analysis?.usedBy.length || 0})
          </h4>
          {analysis && analysis.usedBy.length > 0 ? (
            <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-0.5">
              {analysis.usedBy.map((filePath) => (
                <div
                  key={filePath}
                  className="flex items-center justify-between p-2 bg-secondary/10 rounded-[2px] border border-border/30 text-[10px] gap-2"
                >
                  <span className="font-mono text-muted-foreground truncate" title={filePath}>
                    {filePath.split("/").pop()}
                  </span>
                  {onFileSelect && (
                    <Button
                      size="sm"
                      variant="link"
                      className="h-auto p-0 text-[10px] text-primary font-semibold font-mono"
                      onClick={() => onFileSelect(filePath)}
                    >
                      Open
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[10px] text-muted-foreground italic pl-1">Not referenced by other files.</p>
          )}
        </div>

        {/* Related Sibling Files */}
        <div className="space-y-2.5">
          <h4 className="font-bold text-foreground text-xs">Related Files</h4>
          {relatedFiles.length > 0 ? (
            <div className="space-y-1.5">
              {relatedFiles.map((rf) => (
                <div
                  key={rf.path}
                  className="flex items-center justify-between p-2 bg-secondary/10 rounded-[2px] border border-border/30 text-[10px] gap-2"
                >
                  <span className="font-mono text-muted-foreground truncate" title={rf.path}>
                    {rf.path.split("/").pop()}
                  </span>
                  {onFileSelect && (
                    <Button
                      size="sm"
                      variant="link"
                      className="h-auto p-0 text-[10px] text-primary font-semibold font-mono"
                      onClick={() => onFileSelect(rf.path)}
                    >
                      Open
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[10px] text-muted-foreground italic pl-1">No other files in this directory.</p>
          )}
        </div>
      </div>
    </div>
  );
}
