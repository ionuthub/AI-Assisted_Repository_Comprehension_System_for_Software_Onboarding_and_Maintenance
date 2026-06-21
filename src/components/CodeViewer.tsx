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
          className={`flex transition-colors cursor-pointer group border-l-2 ${isSelected
              ? "bg-primary/15 border-primary"
              : isInDetectedBlock
                ? "bg-primary/8 border-primary/45"
                : "border-transparent hover:bg-primary/5 active:bg-primary/10"
            }`}
        >
          <span className="select-none text-code-number w-8 md:w-12 pr-2 md:pr-4 text-right flex-shrink-0 text-[10px] md:text-sm">
            {lineNumber}
          </span>
          <code className="flex-1 text-foreground/90 whitespace-pre-wrap break-words">{line}</code>
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
    <div className="text-xs md:text-sm text-muted-foreground space-y-3 flex flex-col items-center justify-center h-full py-16">
      <Code2 className="w-10 h-10 text-muted-foreground/30 mb-1" />
      <div className="space-y-1.5 text-center px-4">
        <p className="font-medium text-foreground/80">Select a file from the explorer to inspect its code.</p>
        <p className="text-[11px]">Click any line to analyze the containing code block.</p>
        <p className="text-[11px] text-muted-foreground/60">Hover to preview block • Ctrl/Cmd+Click for custom selection</p>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-code-bg overflow-hidden">
      {/* VS Code style editor tab */}
      <div className="bg-secondary/40 border-b border-border/80 h-9 flex items-center justify-between shrink-0 select-none px-1">
        <div className="flex h-full items-center">
          <div className="bg-code-bg text-foreground border-r border-border/80 h-full px-3.5 flex items-center gap-2 text-[11px] border-t-2 border-t-primary font-mono font-semibold">
            <Code2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="truncate max-w-[160px]">{effectiveFileName.split('/').pop()}</span>
          </div>
        </div>
        <div className="px-3 text-[10px] font-mono text-muted-foreground/50 select-none hidden sm:block truncate max-w-[320px]">
          {effectiveFileName}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(18)].map((_, i) => (
              <Skeleton key={i} className="h-3.5 w-full bg-code-line/45" />
            ))}
          </div>
        ) : fileContent ? (
          <TooltipProvider>
            <pre className="text-[11px] md:text-[13px] font-mono leading-relaxed">
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
    </div>
  );
};

export default CodeViewer;
