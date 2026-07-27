interface SuggestedQuestionsProps {
  onAsk: (question: string) => void;
}

/**
 * Fixed opening questions offered on the overview.
 *
 * These are deliberately identical for every repository and every participant. Tailoring
 * them per repository would make the starting prompt an uncontrolled variable between
 * study conditions, and the wording is quoted in the protocol, so it must not drift.
 */
export const SUGGESTED_QUESTIONS = [
  "Where does execution start in this project?",
  "How is the code organised, and what depends on what?",
  "Where would I add a new feature?",
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
              className="w-full flex items-center justify-between gap-4 px-4 py-3 rounded-md border border-border bg-card hover:border-primary/60 hover:bg-surface-raised text-left transition-colors"
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
