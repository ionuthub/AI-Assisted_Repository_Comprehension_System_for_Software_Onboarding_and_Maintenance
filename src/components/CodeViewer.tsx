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

// One rendered line. Memoised so that selecting a line re-renders only the
// lines whose selection state changed, not every line in the file.
//
// Keyboard access: each line is a listbox option (role="option",
// aria-selected), not a link or button, because selection here is a toggle
// set rather than navigation. A file can run to thousands of lines, so every
// line carrying its own Tab stop would make the viewer unusable from a
// keyboard — Tab would have to be pressed once per line to reach the bottom.
// Roving tabindex avoids that: only the current line is tabbable
// (isTabStop), and CodeViewer's arrow-key handling moves that one stop up
// and down the list, matching the pattern screen readers expect from a
// listbox and the one most editors use for line lists.
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
        className={`flex transition-colors cursor-pointer group border-l-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-primary ${
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
  // The line currently holding the roving tab stop. Starts at 1 so Tab from
  // outside the viewer always lands somewhere, even before any line has been
  // interacted with.
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
        // Enter replaces the selection with this line, mirroring a plain
        // click. Held modifier keys are read the same way a mouse click
        // reads them, so Ctrl/Cmd/Shift+Enter also builds a multi-selection.
        event.preventDefault();
        onLineSelect(lineNumber, event.ctrlKey || event.metaKey || event.shiftKey);
        break;
      case " ":
        // Space always toggles the line into or out of the existing
        // selection, mirroring a modifier+click. This is the primary
        // keyboard path for building a multi-line selection, since holding
        // a modifier through a keyboard "click" is awkward with some
        // assistive technology.
        event.preventDefault();
        onLineSelect(lineNumber, true);
        break;
      default:
        return;
    }
  };

  const renderPlaceholder = () => (
    <div className="text-xs md:text-sm text-muted-foreground space-y-3 flex flex-col items-center justify-center h-full py-16">
      <Code2 className="w-10 h-10 text-muted-foreground/30 mb-1" />
      <div className="space-y-1.5 text-center px-4">
        <p className="font-medium text-foreground/80">Select a file from the explorer to inspect its code.</p>
        <p className="text-sm">
          Click a line, or Tab in and use Arrow keys to move, Space to add or remove a line, Enter
          to select just one.
        </p>
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
          <pre
            ref={listRef}
            role="listbox"
            aria-label={`${effectiveFileName} contents, line selection`}
            aria-multiselectable="true"
            className="text-sm md:text-[13px] font-mono leading-relaxed"
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
