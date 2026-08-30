interface SuggestedQuestionsProps {
  onAsk: (question: string) => void;
}

export const SUGGESTED_QUESTIONS = [
  "What is the top-level structure of the React app?",
  "How does a page get the data it displays?",
  "How is the app styled?",
] as const;

export default function SuggestedQuestions({ onAsk }: SuggestedQuestionsProps) {
  return (
    <section aria-label="Suggested questions" className="space-y-3">
      <h2 className="text-section text-foreground">Start with a question</h2>
      <ul className="space-y-2">
        {SUGGESTED_QUESTIONS.map((question) => (
          <li key={question}>
            <button
              type="button"
              onClick={() => onAsk(question)}
              className="focus-ring w-full flex items-center justify-between gap-4 px-4 py-3 rounded-md border border-control-border bg-card hover:border-primary/60 hover:bg-surface-raised text-left transition-colors"
            >
              <span className="text-ui text-foreground">{question}</span>
              <span className="text-ui text-primary shrink-0" aria-hidden="true">
                Ask →
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
