import { useState } from "react";
import type { FileAnalysisResult } from "@/lib/staticAnalysis";

interface FileInsightsPanelProps {
  path: string | null;
  analysis: FileAnalysisResult | null;
  onFileSelect: (path: string) => void;
  onAsk: (question: string) => void;
}

/**
 * Describes the selected file from static analysis alone.
 *
 * Everything here is derived from parsing this file and the other indexed files, no model
 * is involved, so the panel is stated as fact while answers elsewhere are marked as
 * grounded or not. Import parsing covers JavaScript and TypeScript, so the relationships
 * are empty for other languages and the panel says so rather than appearing broken.
 */
export default function FileInsightsPanel({ path, analysis, onFileSelect, onAsk }: FileInsightsPanelProps) {
  const [question, setQuestion] = useState("");

  if (!path) {
    return (
      <div className="p-4">
        <p className="text-ui text-muted-foreground">Select a file to see what it does.</p>
      </div>
    );
  }

  const dependents = analysis?.usedBy ?? [];
  const imports = analysis?.imports ?? [];
  const resolvedImports = imports.filter((i) => i.resolvedPath);
  const externalImports = imports.filter((i) => !i.resolvedPath);

  const summary = analysis
    ? [
        analysis.components.length > 0 && `defines the ${analysis.components.slice(0, 3).join(", ")} component${analysis.components.length === 1 ? "" : "s"}`,
        analysis.classes.length > 0 && `declares ${analysis.classes.slice(0, 3).join(", ")}`,
        analysis.functions.length > 0 && `exports ${analysis.functions.length} function${analysis.functions.length === 1 ? "" : "s"}`,
        analysis.isApiRoute && "handles an API route",
      ].filter(Boolean).join("; ")
    : "";

  return (
    <div className="p-4 space-y-6 overflow-y-auto">
      <section className="space-y-2">
        <h2 className="text-section text-foreground">What this file does</h2>
        <p className="text-ui text-foreground/90 leading-relaxed">
          {summary ? `This file ${summary}.` : "No declarations were parsed from this file."}
        </p>
        <p className="text-meta text-muted-foreground">From this file only.</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-section text-foreground">If you change this</h2>
        {dependents.length > 0 ? (
          <>
            <p className="text-meta text-muted-foreground">
              {dependents.length} indexed file{dependents.length === 1 ? "" : "s"} import it.
            </p>
            <ul className="space-y-1">
              {dependents.slice(0, 8).map((dependent) => (
                <li key={dependent}>
                  <button
                    type="button"
                    onClick={() => onFileSelect(dependent)}
                    className="text-path font-mono text-foreground hover:text-primary truncate block w-full text-left"
                  >
                    {dependent}
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-ui text-foreground-secondary">
            No indexed file imports it. It may still be used by files that were not indexed.
          </p>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-section text-foreground">This file imports</h2>
        {imports.length === 0 ? (
          <p className="text-ui text-foreground-secondary">Nothing, or the language is not parsed for imports.</p>
        ) : (
          <ul className="flex flex-wrap gap-1.5">
            {resolvedImports.map((item) => (
              <li key={item.source}>
                <button
                  type="button"
                  onClick={() => item.resolvedPath && onFileSelect(item.resolvedPath)}
                  className="text-meta font-mono px-2 py-1 rounded border border-border bg-surface-raised text-foreground-secondary hover:border-primary/60 hover:text-foreground"
                >
                  {item.source}
                </button>
              </li>
            ))}
            {externalImports.map((item) => (
              <li
                key={item.source}
                // Dashed border marks a target outside the index: the file exists somewhere,
                // but nothing here can show it, and saying so beats an unclickable chip.
                className="text-meta font-mono px-2 py-1 rounded border border-dashed border-border-strong text-muted-foreground"
              >
                {item.source} · not indexed
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-section text-foreground">Ask about this file</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!question.trim()) return;
            onAsk(`In ${path}: ${question.trim()}`);
            setQuestion("");
          }}
          className="space-y-2"
        >
          <label htmlFor="ask-about-file" className="sr-only">
            Ask a question about {path}
          </label>
          <input
            id="ask-about-file"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What calls this?"
            className="w-full h-10 px-3 rounded-md bg-input border border-border text-ui text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
          <button
            type="submit"
            className="w-full h-10 rounded-md bg-primary text-primary-foreground text-ui font-semibold hover:bg-primary-glow disabled:opacity-50"
            disabled={!question.trim()}
          >
            Ask
          </button>
        </form>
      </section>
    </div>
  );
}
