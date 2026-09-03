/** Renders generated answer text using the workspace presentation rules. */
interface AnswerBodyProps {
  content: string;
}

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
