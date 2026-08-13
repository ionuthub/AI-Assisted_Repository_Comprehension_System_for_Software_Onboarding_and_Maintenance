interface SuggestedQuestionsProps {
  onAsk: (question: string) => void;
}

/**
 * Fixed opening questions offered on the overview.
 *
 * These are deliberately identical for every repository and every participant. Tailoring
 * them per repository would make the starting prompt an uncontrolled variable between
 * study conditions, and the wording is quoted in the protocol, so it must not drift.
 *
 * Each was chosen by measurement rather than by how well it reads, against three
 * requirements. It must retrieve, the earlier wording asked where execution starts, which
 * scored 0.04 against a median of 0.27 and failed to retrieve `src/main.tsx` in either study
 * repository, because a question phrased in vocabulary *about* code shares no terms with the
 * code itself. It must retrieve symmetrically, the earlier second question returned five
 * files in one repository and nothing at all in the other, which made the opening prompt
 * behave differently between conditions for no better reason than which words happened to
 * appear in comments. And it must land on the same files in both, since equal scores pointing
 * at different parts of the two repositories is not a match.
 *
 * Measured top-ranked scores (warehouse-dispatch / clinic-triage), same top file in both:
 *   structure   0.39 / 0.39  → src/main.tsx
 *   data flow   0.35 / 0.27  → src/App.tsx
 *   styling     0.31 / 0.30  → src/main.tsx
 *
 * They point at framework scaffolding, and that is deliberate. In a domain-specific
 * repository the only files a domain-neutral question can reach are the scaffolding ones,
 * and anything that reaches further would have to name a planted pattern, which is what the
 * timed tasks are about, and would hand the assisted condition a head start. Warm-up prompts
 * that reliably demonstrate the interface without touching a task target are what is wanted
 * here. See study/suggested-questions-measurement.md for the full measurement.
 */
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
