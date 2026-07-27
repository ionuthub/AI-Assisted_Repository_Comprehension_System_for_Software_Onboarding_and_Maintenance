import EvidencePanel, { type RetrievedEvidence, type UnverifiedMention } from "@/components/EvidencePanel";

export type { RetrievedEvidence } from "@/components/EvidencePanel";

interface WorkspaceQAViewProps {
  question: string;
  answer: string;
  isLoading: boolean;
  evidence: RetrievedEvidence[];
  /** Paths present in the repository but not retrieved, with the reason they were excluded. */
  excludedPaths?: Record<string, string>;
  indexedFileCount?: number;
  totalFileCount?: number;
  onBackToOverview: () => void;
  onFileSelect?: (path: string) => void;
}

/**
 * Paths the answer mentions. Used only to detect references the model made to files that
 * were not retrieved, so they can be shown as unverified rather than as sources. Citations
 * themselves come from the retrieval layer, never from this.
 */
const MENTIONED_PATH = /(?:[\w-]+\/)+[\w.-]+\.(?:ts|tsx|js|jsx|css|json|md|py|go|rb|java)/g;

export default function WorkspaceQAView({
  question,
  answer,
  isLoading,
  evidence,
  excludedPaths,
  indexedFileCount,
  totalFileCount,
  onBackToOverview,
  onFileSelect,
}: WorkspaceQAViewProps) {
  const evidencePaths = new Set(evidence.map((e) => e.path));

  const unverifiedMentions: UnverifiedMention[] = Array.from(
    new Set(answer.match(MENTIONED_PATH) || [])
  )
    .filter((path) => !evidencePaths.has(path))
    .map((path) => ({
      path,
      reason: excludedPaths?.[path] ?? "Not retrieved",
    }));

  const renderAnswer = (content: string) =>
    content.split("\n").map((line, i) => {
      if (line.startsWith("### ")) {
        return (
          <h3 key={i} className="text-section text-foreground mt-6 mb-2 first:mt-0">
            {line.substring(4)}
          </h3>
        );
      }
      if (line.startsWith("**") && line.endsWith("**") && line.length > 4) {
        return (
          <h4 key={i} className="text-ui font-semibold text-foreground mt-5 mb-2 first:mt-0">
            {line.replace(/\*\*/g, "")}
          </h4>
        );
      }
      if (line.startsWith("* ") || line.startsWith("- ")) {
        return (
          <li key={i} className="ml-5 list-disc text-body text-foreground/90 my-1">
            {line.substring(2)}
          </li>
        );
      }
      if (!line.trim()) return null;
      return (
        <p key={i} className="text-body text-foreground/90 mb-4">
          {line}
        </p>
      );
    });

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      <div className="flex items-center justify-between gap-4 px-6 py-3 border-b border-border shrink-0">
        <h2 className="text-ui font-semibold text-foreground">Answer</h2>
        <button
          type="button"
          onClick={onBackToOverview}
          className="text-ui text-muted-foreground hover:text-foreground underline underline-offset-2"
        >
          Close
        </button>
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
              <div className="max-w-[68ch]">{renderAnswer(answer)}</div>
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
