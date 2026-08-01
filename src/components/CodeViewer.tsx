import { Skeleton } from "@/components/ui/skeleton";
import { Code2 } from "lucide-react";
import { useMemo, memo } from "react";

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
  isSelected: boolean;
  onLineClick: (lineNumber: number, event: React.MouseEvent) => void;
}

// One rendered line. Memoised so that selecting a line re-renders only the
// lines whose selection state changed, not every line in the file.
const CodeLine = memo(({ line, lineNumber, isSelected, onLineClick }: CodeLineProps) => {
  return (
    <div
      onClick={(e) => onLineClick(lineNumber, e)}
      className={`flex transition-colors cursor-pointer group border-l-2 ${
        isSelected
          ? "bg-primary/15 border-primary"
          : "border-transparent hover:bg-primary/5 active:bg-primary/10"
      }`}
    >
      <span className="select-none text-code-number w-8 md:w-12 pr-2 md:pr-4 text-right flex-shrink-0 text-xs md:text-sm">
        {lineNumber}
      </span>
      <code className="flex-1 text-foreground/90 whitespace-pre-wrap break-words">{line}</code>
    </div>
  );
});

CodeLine.displayName = "CodeLine";

const CodeViewer = ({
  isLoading,
  fileName,
  fileContent,
  onLineSelect,
  selectedLines,
}: CodeViewerProps) => {
  const effectiveFileName = fileName ?? "Select a file";
  const contentLines = useMemo(() => fileContent?.split(/\r?\n/) ?? [], [fileContent]);

  const handleLineClick = (lineNumber: number, event: React.MouseEvent) => {
    const isMultiSelect = event.ctrlKey || event.metaKey || event.shiftKey;
    onLineSelect(lineNumber, isMultiSelect);
  };

  const renderPlaceholder = () => (
    <div className="text-xs md:text-sm text-muted-foreground space-y-3 flex flex-col items-center justify-center h-full py-16">
      <Code2 className="w-10 h-10 text-muted-foreground/30 mb-1" />
      <div className="space-y-1.5 text-center px-4">
        <p className="font-medium text-foreground/80">Select a file from the explorer to inspect its code.</p>
        <p className="text-sm">Click a line to include it in your question context. Ctrl/Cmd+Click selects multiple lines.</p>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-code-bg overflow-hidden">
      {/* Editor tab bar: file name on the left, full path on the right */}
      <div className="bg-secondary/40 border-b border-border/80 h-9 flex items-center justify-between shrink-0 select-none px-1">
        <div className="flex h-full items-center">
          <div className="bg-code-bg text-foreground border-r border-border/80 h-full px-3.5 flex items-center gap-2 text-sm border-t-2 border-t-primary font-mono font-semibold">
            <Code2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="truncate max-w-[160px]">{effectiveFileName.split("/").pop()}</span>
          </div>
        </div>
        <div className="px-3 text-xs font-mono text-muted-foreground/50 select-none hidden sm:block truncate max-w-[320px]">
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
          <pre className="text-sm md:text-[13px] font-mono leading-relaxed">
            {contentLines.map((line, idx) => (
              <CodeLine
                key={idx}
                line={line}
                lineNumber={idx + 1}
                isSelected={selectedLines.has(idx + 1)}
                onLineClick={handleLineClick}
              />
            ))}
          </pre>
        ) : (
          renderPlaceholder()
        )}
      </div>
    </div>
  );
};

export default CodeViewer;
