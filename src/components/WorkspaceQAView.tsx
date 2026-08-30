import { useState, type FormEvent } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AnswerBody from "@/components/AnswerBody";
import EvidencePanel, { type RetrievedEvidence, type UnverifiedMention } from "@/components/EvidencePanel";
import type { GenerationCompleteEvent } from "@/lib/generationProtocol";

export type { RetrievedEvidence } from "@/components/EvidencePanel";

interface WorkspaceQAViewProps {
  question: string;
  answer: string;
  isLoading: boolean;
  generationStatus: 'idle' | 'loading' | 'complete' | 'error';
  completion: GenerationCompleteEvent | null;
  evidence: RetrievedEvidence[];
  /** Paths present in the repository but not retrieved, with the reason they were excluded. */
  excludedPaths?: Record<string, string>;
  indexedFileCount?: number;
  totalFileCount?: number;
  onBackToOverview: () => void;
  onFileSelect?: (path: string) => void;
  /** Runs the existing repository-level retrieval and generation pipeline. */
  onAsk: (question: string) => void | Promise<void>;
}

/**
 * Paths the answer mentions. Used only to detect references the model made to files that
 * were not retrieved, so they can be shown as unverified rather than as sources. Citations
 * themselves come from the retrieval layer, never from this.
 *
 * Extensions are ordered longest-first and anchored with a word boundary. Regex alternation
 * takes the first branch that matches, so listing `ts` before `tsx` truncated every React
 * component path: `PriorityPanel.tsx` was extracted as `PriorityPanel.ts`, which of course had
 * not been retrieved, and the panel warned that the model had cited a file it never saw, while
 * displaying the real `.tsx` file as evidence directly above the warning.
 *
 * That is the worst failure this component can have. The panel exists to tell a reader when an
 * answer names something unsupported, and it was manufacturing exactly that accusation against
 * correct answers. A reader who checked would find the file present and learn to discount the
 * warning; a reader who did not would distrust a sound answer.
 */
export const MENTIONED_PATH =
  /(?:[\w-]+\/)+[\w.-]+\.(?:tsx|jsx|json|java|ts|js|css|md|py|go|rb)\b/g;

export default function WorkspaceQAView({
  question,
  answer,
  isLoading,
  generationStatus,
  completion,
  evidence,
  excludedPaths,
  indexedFileCount,
  totalFileCount,
  onBackToOverview,
  onFileSelect,
  onAsk,
}: WorkspaceQAViewProps) {
  const [draft, setDraft] = useState("");
  const evidencePaths = new Set(evidence.map((e) => e.path));

  const unverifiedMentions: UnverifiedMention[] = Array.from(
    new Set(answer.match(MENTIONED_PATH) || [])
  )
    .filter((path) => !evidencePaths.has(path))
    .map((path) => ({
      path,
      reason: excludedPaths?.[path] ?? "Not retrieved",
    }));

  const submitQuestion = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextQuestion = draft.trim();
    if (!nextQuestion || isLoading) return;
    setDraft("");
    void onAsk(nextQuestion);
  };

  // The Answers view is the repository-wide AI workspace. Before a question is asked it
  // presents the question composer itself, rather than pointing the user back to a second
  // prompt field in the global toolbar. This keeps scope explicit: repository-wide questions
  // live here, while file-specific questions stay beside the selected file in Code.
  const nothingAskedYet = !question && !isLoading && generationStatus === 'idle';
  if (nothingAskedYet) {
    return (
      <div className="h-full flex flex-col overflow-hidden bg-background">
        <div className="flex items-center justify-between gap-4 px-6 py-3 border-b border-border shrink-0">
          <h2 className="text-ui font-semibold text-foreground">Answers</h2>
          <button
            type="button"
            onClick={onBackToOverview}
            className="text-ui text-muted-foreground hover:text-foreground underline underline-offset-2"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto flex items-center justify-center p-6">
          <div className="w-full max-w-2xl space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="h-5 w-5" aria-hidden="true" />
                <span className="text-meta font-semibold uppercase tracking-[0.12em]">Repository context</span>
              </div>
              <h1 className="text-panel text-foreground">Ask about this repository</h1>
              <p className="text-body text-muted-foreground max-w-[60ch]">
                Ask a question about the analysed codebase. The answer will be generated from
                evidence retrieved from the indexed repository files and shown beside the response.
              </p>
            </div>

            <form onSubmit={submitQuestion} className="space-y-3">
              <label htmlFor="repository-question" className="sr-only">
                Ask a question about this repository
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Sparkles
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary"
                    aria-hidden="true"
                  />
                  <Input
                    id="repository-question"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="What would you like to understand about this codebase?"
                    className="h-12 pl-10 text-body bg-input border-border rounded-md"
                    autoFocus
                  />
                </div>
                <Button
                  type="submit"
                  disabled={!draft.trim() || isLoading}
                  className="h-12 px-6 text-ui font-semibold rounded-md bg-primary text-primary-foreground hover:bg-primary-glow border-none"
                >
                  Ask
                </Button>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-meta text-muted-foreground">
                <span>
                  {indexedFileCount !== undefined && totalFileCount !== undefined
                    ? `${indexedFileCount} of ${totalFileCount} repository files indexed`
                    : "Uses the indexed repository as context"}
                </span>
                <span>For one file only, open Code and use “Ask about this file”.</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      <div className="flex items-center justify-between gap-4 px-6 py-3 border-b border-border shrink-0">
        <h2 className="text-ui font-semibold text-foreground">Answers</h2>
        <button
          type="button"
          onClick={onBackToOverview}
          className="text-ui text-muted-foreground hover:text-foreground underline underline-offset-2"
        >
          Close
        </button>
      </div>

      <div className="border-b border-border px-6 py-3 bg-card/40 shrink-0">
        <form onSubmit={submitQuestion} className="flex gap-3 max-w-3xl">
          <label htmlFor="repository-question-follow-up" className="sr-only">
            Ask another question about this repository
          </label>
          <div className="relative flex-1">
            <Sparkles
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary"
              aria-hidden="true"
            />
            <Input
              id="repository-question-follow-up"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask another question about this repository"
              className="h-10 pl-9 text-ui bg-input border-border rounded-md"
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            disabled={!draft.trim() || isLoading}
            className="h-10 px-5 text-ui font-semibold rounded-md bg-primary text-primary-foreground hover:bg-primary-glow border-none"
          >
            Ask
          </Button>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_420px] gap-8 p-6">
          <div className="min-w-0">
            <p className="text-meta text-muted-foreground mb-1">Your question</p>
            <h1 className="text-panel text-foreground mb-6">{question}</h1>

            {isLoading ? (
              <div className="space-y-3" aria-busy="true">
                <div className="h-4 rounded bg-secondary animate-pulse w-3/4" />
                <div className="h-4 rounded bg-secondary animate-pulse w-full" />
                <div className="h-4 rounded bg-secondary animate-pulse w-5/6" />
              </div>
            ) : (
              <div
                className="max-w-[68ch]"
                data-generation-status={generationStatus}
                data-finish-reason={completion?.finishReason}
                data-prompt-token-count={completion?.usageMetadata?.promptTokenCount}
                data-output-token-count={completion?.usageMetadata?.candidatesTokenCount}
                data-total-token-count={completion?.usageMetadata?.totalTokenCount}
                role={generationStatus === 'error' ? 'alert' : undefined}
              >
                <AnswerBody content={answer} />
              </div>
            )}
          </div>

          <aside className="min-w-0">
            <EvidencePanel
              evidence={evidence}
              unverifiedMentions={isLoading ? [] : unverifiedMentions}
              isLoading={isLoading}
              indexedFileCount={indexedFileCount}
              totalFileCount={totalFileCount}
              onFileSelect={onFileSelect}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}
