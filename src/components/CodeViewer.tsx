import { Skeleton } from "@/components/ui/skeleton";
import { Code2 } from "lucide-react";
import { useMemo, useRef, useState, memo } from "react";

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
  isTabStop: boolean;
  onLineClick: (lineNumber: number, event: React.MouseEvent) => void;
  onLineKeyDown: (lineNumber: number, event: React.KeyboardEvent<HTMLDivElement>) => void;
}

const CodeLine = memo(
  ({ line, lineNumber, isSelected, isTabStop, onLineClick, onLineKeyDown }: CodeLineProps) => {
    return (
      <div
        role="option"
        aria-selected={isSelected}
        tabIndex={isTabStop ? 0 : -1}
        data-line-number={lineNumber}
        onClick={(e) => onLineClick(lineNumber, e)}
        onKeyDown={(e) => onLineKeyDown(lineNumber, e)}
        className={`flex transition-colors cursor-pointer group border-l-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary ${
          isSelected
            ? "bg-primary/15 border-primary"
            : "border-transparent hover:bg-primary/5 active:bg-primary/10"
        }`}
      >
        <span className="select-none text-code-number w-8 md:w-12 pr-2 md:pr-4 text-right flex-shrink-0 text-meta">
          {lineNumber}
        </span>
        <code className="flex-1 text-foreground/90 whitespace-pre-wrap break-words">{line}</code>
      </div>
    );
  }
);

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
  const listRef = useRef<HTMLPreElement>(null);
  const [tabStopLine, setTabStopLine] = useState(1);

  const handleLineClick = (lineNumber: number, event: React.MouseEvent) => {
    const isMultiSelect = event.ctrlKey || event.metaKey || event.shiftKey;
    setTabStopLine(lineNumber);
    onLineSelect(lineNumber, isMultiSelect);
  };

  const focusLine = (lineNumber: number) => {
    const el = listRef.current?.querySelector<HTMLDivElement>(
      `[data-line-number="${lineNumber}"]`
    );
    el?.focus();
  };

  const handleLineKeyDown = (lineNumber: number, event: React.KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();
        const next = Math.min(lineNumber + 1, contentLines.length);
        setTabStopLine(next);
        focusLine(next);
        break;
      }
      case "ArrowUp": {
        event.preventDefault();
        const prev = Math.max(lineNumber - 1, 1);
        setTabStopLine(prev);
        focusLine(prev);
        break;
      }
      case "Home": {
        event.preventDefault();
        setTabStopLine(1);
        focusLine(1);
        break;
      }
      case "End": {
        event.preventDefault();
        setTabStopLine(contentLines.length);
        focusLine(contentLines.length);
        break;
      }
      case "Enter":
        event.preventDefault();
        onLineSelect(lineNumber, event.ctrlKey || event.metaKey || event.shiftKey);
        break;
      case " ":
        event.preventDefault();
        onLineSelect(lineNumber, true);
        break;
      default:
        return;
    }
  };

  const renderPlaceholder = () => (
    <div className="text-ui text-muted-foreground space-y-3 flex flex-col items-center justify-center h-full py-16">
      <Code2 className="w-10 h-10 text-foreground-dim mb-1" aria-hidden="true" />
      <div className="space-y-1.5 text-center px-4 max-w-lg">
        <p className="font-medium text-foreground">Select a file from the explorer to inspect its code.</p>
        <p className="text-ui text-muted-foreground">
          Click a line, or Tab in and use Arrow keys to move, Space to add or remove a line, Enter
          to select just one.
        </p>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-code-bg overflow-hidden">
      <div className="bg-secondary/40 border-b border-border/80 h-10 flex items-center justify-between shrink-0 select-none px-1">
        <div className="flex h-full items-center min-w-0">
          <div className="bg-code-bg text-foreground border-r border-border/80 h-full px-3.5 flex items-center gap-2 text-ui border-t-2 border-t-primary font-mono font-semibold min-w-0">
            <Code2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
            <span className="truncate max-w-[180px]">{effectiveFileName.split("/").pop()}</span>
          </div>
        </div>
        <div className="px-3 text-meta font-mono text-foreground-dim select-none hidden sm:block truncate max-w-[320px]">
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
          <pre
            ref={listRef}
            role="listbox"
            aria-label={`${effectiveFileName} contents, line selection`}
            aria-multiselectable="true"
            className="text-[13px] md:text-ui font-mono leading-relaxed"
          >
            {contentLines.map((line, idx) => {
              const lineNumber = idx + 1;
              return (
                <CodeLine
                  key={idx}
                  line={line}
                  lineNumber={lineNumber}
                  isSelected={selectedLines.has(lineNumber)}
                  isTabStop={lineNumber === tabStopLine}
                  onLineClick={handleLineClick}
                  onLineKeyDown={handleLineKeyDown}
                />
              );
            })}
          </pre>
        ) : (
          renderPlaceholder()
        )}
      </div>
    </div>
  );
};

export default CodeViewer;
