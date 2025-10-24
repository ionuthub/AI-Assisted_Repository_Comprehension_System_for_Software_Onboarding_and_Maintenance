import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { detectLineComplexity, getComplexityBadge, getComplexityColor } from "@/lib/complexityDetector";

interface CodeViewerProps {
  isLoading: boolean;
  fileName: string | null;
  fileContent: string | null;
  onLineSelect: (lineNumber: number) => void;
  selectedLine: number | null;
}

const CodeViewer = ({
  isLoading,
  fileName,
  fileContent,
  onLineSelect,
  selectedLine,
}: CodeViewerProps) => {
  const effectiveFileName = fileName ?? "Select a file";
  const contentLines = fileContent?.split(/\r?\n/) ?? [];
  const complexityMap = contentLines.map((line) => detectLineComplexity(line));

  const renderPlaceholder = () => (
    <div className="text-sm md:text-base text-muted-foreground space-y-2">
      <p>Select a file from the list to load its contents.</p>
      <p className="text-xs md:text-sm">Click any line to generate a quick explanation.</p>
    </div>
  );

  return (
    <Card className="h-full bg-code-bg border-border overflow-hidden">
      <div className="bg-secondary/50 px-3 md:px-4 py-2.5 md:py-3 border-b border-border flex items-center justify-between">
        <span className="text-[10px] md:text-sm font-mono text-muted-foreground truncate">
          {effectiveFileName}
        </span>
        <div className="flex gap-1.5 md:gap-2 flex-shrink-0">
          <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-destructive/60" />
          <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-500/60" />
          <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-500/60" />
        </div>
      </div>

      <div className="p-3 md:p-6 overflow-auto max-h-[400px] md:max-h-[600px]">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(18)].map((_, i) => (
              <Skeleton key={i} className="h-3 md:h-4 w-full bg-code-line" />
            ))}
          </div>
        ) : fileContent ? (
          <TooltipProvider>
            <pre className="text-xs md:text-sm font-mono">
              {contentLines.map((line, idx) => {
                const complexity = complexityMap[idx];
                return (
                  <Tooltip key={idx}>
                    <TooltipTrigger asChild>
                      <div
                        onClick={() => onLineSelect(idx + 1)}
                        className={`flex hover:bg-primary/5 active:bg-primary/10 transition-colors cursor-pointer group ${
                          selectedLine === idx + 1 ? "bg-primary/15 border-l-2 border-primary" : ""
                        }`}
                      >
                        <span className="select-none text-code-number w-8 md:w-12 pr-2 md:pr-4 text-right flex-shrink-0 text-[10px] md:text-sm">
                          {idx + 1}
                        </span>
                        <code className="flex-1 text-foreground whitespace-pre-wrap break-words">{line}</code>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <div className="space-y-1">
                        <div className="font-semibold">{getComplexityBadge(complexity.complexity)}</div>
                        <div className="text-xs">{complexity.reason}</div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </pre>
          </TooltipProvider>
        ) : (
          renderPlaceholder()
        )}
      </div>
    </Card>
  );
};

export default CodeViewer;
