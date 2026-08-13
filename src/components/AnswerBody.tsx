/**
 * Renders a generated answer.
 *
 * This is the single renderer for model output, used by the Answers tab in the workspace and by
 * the seeded-answer panel in the study runner. It exists as a shared component for the same
 * reason promptBuilder.ts does: the two were rendering the same kind of text differently, and the
 * difference was measurable by a participant.
 *
 * The seeded over-trust probe shows a participant a pre-recorded answer that is known to be
 * wrong, and the study measures whether they notice. That panel rendered the answer as a single
 * italic run with newlines collapsed and markdown left as literal characters, while every other
 * answer in the session came through the workspace renderer. A participant who has seen five
 * properly laid out answers and then meets an italic blob has a reason to distrust it that has
 * nothing to do with its content, so a flag might record "this looked odd" rather than "I checked
 * this claim and it was wrong", and nothing in the export would distinguish the two. Contaminating
 * the dependent variable in a direction that cannot be recovered afterwards is worse than any
 * formatting bug.
 *
 * The rules below are deliberately unchanged from the workspace implementation, including where
 * they are incomplete: inline `**bold**` inside a paragraph is not converted, so a sentence
 * containing `exactly **two** places` shows the asterisks. That is what the deployed tool does,
 * and fidelity to it is the whole point. Improving the rendering here would reintroduce the
 * difference from the other side.
 */

/**
 * Renders as a fragment, adding no element of its own, so the caller's container holds the lines
 * as direct children exactly as it did when this logic was inline.
 *
 * That is not tidiness. `analysis/capture_gate.mjs` locates the answer with
 * `p:text-is("Your question") + h1 + div:not([aria-busy])` and reads `innerText` from it, and the
 * evidence panel is read with direct-child selectors. Wrapping the lines in an extra div changed
 * the DOM the capture measures, which is a change to the instrument rather than to its styling.
 * Any wrapper belongs to the caller.
 */
interface AnswerBodyProps {
  content: string;
}

/** Not exported: the component is the only supported entry point, so the two callers cannot
 * accidentally render the lines into different wrappers. */
function renderAnswerLines(content: string) {
  return content.split("\n").map((line, i) => {
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
}

export default function AnswerBody({ content }: AnswerBodyProps) {
  return <>{renderAnswerLines(content)}</>;
}
