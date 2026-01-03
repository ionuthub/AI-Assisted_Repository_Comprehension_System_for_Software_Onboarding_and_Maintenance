import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Code2 } from "lucide-react";
import { detectLineComplexity, getComplexityBadge } from "@/lib/complexityDetector";
import { detectCodeBlock } from "@/lib/blockDetector";
import { useMemo, useState, memo } from "react";
import type { LineComplexity } from "@/lib/complexityDetector";

interface CodeViewerProps {
  isLoading: boolean;
  fileName: string | null;
  fileContent: string | null;
  onLineSelect: (lineNumber: number, isMultiSelect?: boolean) => void;
  selectedLine: number | null;
  selectedLines: Set<number>;
}

interface CodeLineProps {
  line: string;
  lineNumber: number;
  complexity: LineComplexity;
  isInDetectedBlock: boolean | null;
  isSelected: boolean;
  onLineClick: (lineNumber: number, event: React.MouseEvent) => void;
  onMouseEnter: (lineNumber: number) => void;
  onMouseLeave: () => void;
  detectedBlockDescription?: string;
}

const CodeLine = memo(({
  line,
  lineNumber,
  complexity,
  isInDetectedBlock,
  isSelected,
  onLineClick,
  onMouseEnter,
  onMouseLeave,
  detectedBlockDescription
}: CodeLineProps) => {
  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <div
          onClick={(e) => onLineClick(lineNumber, e)}
          onMouseEnter={() => onMouseEnter(lineNumber)}
          onMouseLeave={onMouseLeave}
          className={`flex transition-colors cursor-pointer group ${isSelected
              ? "bg-primary/15 border-l-2 border-primary"
              : isInDetectedBlock
                ? "bg-primary/8 border-l-2 border-primary/40"
                : "hover:bg-primary/5 active:bg-primary/10"
            }`}
        >
          <span className="select-none text-code-number w-8 md:w-12 pr-2 md:pr-4 text-right flex-shrink-0 text-[10px] md:text-sm">
            {lineNumber}
          </span>
          <code className="flex-1 text-foreground whitespace-pre-wrap break-words">{line}</code>
        </div>
      </TooltipTrigger>
      <TooltipContent side="right" className="max-w-xs">
        <div className="space-y-1">
          <div className="font-semibold">{getComplexityBadge(complexity.complexity)}</div>
          <div className="text-xs">{complexity.reason}</div>
          {detectedBlockDescription && isInDetectedBlock && (
            <div className="text-xs mt-2 pt-2 border-t border-muted-foreground/20">
              <div className="font-semibold text-primary">{detectedBlockDescription}</div>
              <div className="text-xs opacity-80">Click to explain this block</div>
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
});

CodeLine.displayName = "CodeLine";

const CodeViewer = ({
  isLoading,
  fileName,
  fileContent,
  onLineSelect,
  selectedLine,
  selectedLines,
}: CodeViewerProps) => {
  const [hoveredLine, setHoveredLine] = useState<number | null>(null);

  const effectiveFileName = fileName ?? "Select a file";
  const contentLines = useMemo(() => fileContent?.split(/\r?\n/) ?? [], [fileContent]);

  // Memoize complexity map to avoid recalculation on hover
  const complexityMap = useMemo(() => {
    return contentLines.map((line, idx) => ({ ...detectLineComplexity(line), line: idx + 1 }));
  }, [contentLines]);

  // Detect block for hovered line
  const detectedBlock = useMemo(() => {
    if (!hoveredLine || !fileContent) return null;
    return detectCodeBlock(fileContent, hoveredLine);
  }, [hoveredLine, fileContent]);

  const handleLineClick = (lineNumber: number, event: React.MouseEvent) => {
    const isMultiSelect = event.ctrlKey || event.metaKey || event.shiftKey;

    // If not multi-select, select the entire block
    if (!isMultiSelect && fileContent) {
      const block = detectCodeBlock(fileContent, lineNumber);
      onLineSelect(block.startLine, false);
    } else {
      onLineSelect(lineNumber, isMultiSelect);
    }
  };

  const renderPlaceholder = () => (
    <div className="text-sm md:text-base text-muted-foreground space-y-3 flex flex-col items-center justify-center h-full py-12">
      <Code2 className="w-12 h-12 text-muted-foreground/40 mb-2" />
      <div className="space-y-2 text-center">
        <p>Select a file from the list to load its contents.</p>
        <p className="text-xs md:text-sm">Click any line to explain the entire code block.</p>
        <p className="text-xs text-muted-foreground/70">Hover to preview block • Ctrl/Cmd+Click for custom selection</p>
      </div>
    </div>
  );

  return (
    <Card className="h-full bg-code-bg border-border overflow-hidden">
      <div className="bg-secondary/50 px-3 md:px-4 py-2.5 md:py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <Code2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary flex-shrink-0" />
          <span className="text-[10px] md:text-sm font-mono text-muted-foreground truncate">
            {effectiveFileName}
          </span>
        </div>
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
                const lineNumber = idx + 1;
                const complexity = complexityMap[idx];
                const isInDetectedBlock = detectedBlock
                  ? lineNumber >= detectedBlock.startLine && lineNumber <= detectedBlock.endLine
                  : false;
                const isSelected = selectedLines.has(lineNumber);

                return (
                  <CodeLine
                    key={idx}
                    line={line}
                    lineNumber={lineNumber}
                    complexity={complexity}
                    isInDetectedBlock={isInDetectedBlock}
                    isSelected={isSelected}
                    onLineClick={handleLineClick}
                    onMouseEnter={setHoveredLine}
                    onMouseLeave={() => setHoveredLine(null)}
                    detectedBlockDescription={detectedBlock?.description}
                  />
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
