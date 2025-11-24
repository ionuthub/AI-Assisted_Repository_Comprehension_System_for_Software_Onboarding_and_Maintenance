import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, BookOpen, Link2, Copy, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getRelatedConcepts } from "@/lib/relatedConcepts";
import { getComplexityBadge } from "@/lib/complexityDetector";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface ExplanationPanelProps {
  isLoading: boolean;
  skillLevel: "beginner" | "intermediate" | "advanced";
  selectedFile: string | null;
  selectedLine: number | null;
  lineExplanation: string | null;
  fileExplanation?: string | null;
}

const parseExplanationText = (text: string) => {
  const sections = [];
  let currentSection = { title: "", content: [] as string[] };
  const lines = text.split("\n");

  for (const line of lines) {
    // Detect bold headers like **What it is:**
    if (line.match(/^\*\*[^*]+:\*\*/) || line.match(/^##\s+/)) {
      if (currentSection.content.length > 0) {
        sections.push(currentSection);
      }
      currentSection = {
        title: line.replace(/^\*\*/, "").replace(/:\*\*$/, "").replace(/^##\s+/, "").trim(),
        content: []
      };
    }
    // Detect bullet points
    else if (line.trim().startsWith("*") || line.trim().startsWith("-")) {
      currentSection.content.push(line.trim());
    }
    // Regular content
    else if (line.trim()) {
      currentSection.content.push(line.trim());
    }
  }

  if (currentSection.content.length > 0) {
    sections.push(currentSection);
  }

  return sections;
};

const renderExplanationSection = (section: { title: string; content: string[] }) => {
  return (
    <div key={section.title} className="space-y-2">
      {section.title && (
        <h4 className="font-semibold text-foreground text-sm md:text-base">
          {section.title}
        </h4>
      )}
      <div className="space-y-2">
        {section.content.map((line, idx) => {
          // Handle bullet points
          if (line.startsWith("*") || line.startsWith("-")) {
            const content = line.replace(/^[*-]\s*/, "");
            // Parse inline bold and code
            const parts = content.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
            return (
              <div key={idx} className="flex gap-3 text-sm md:text-base text-muted-foreground">
                <span className="text-primary font-bold flex-shrink-0 mt-0.5">•</span>
                <span className="leading-relaxed">
                  {parts.map((part, i) => {
                    if (part.startsWith("`")) {
                      return (
                        <code key={i} className="bg-code text-primary/90 px-2 py-0.5 rounded text-xs md:text-sm font-mono">
                          {part.replace(/`/g, "")}
                        </code>
                      );
                    } else if (part.startsWith("**")) {
                      return (
                        <strong key={i}>{part.replace(/\*\*/g, "")}</strong>
                      );
                    }
                    return part;
                  })}
                </span>
              </div>
            );
          }
          // Regular paragraph
          const parts = line.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
          return (
            <p key={idx} className="text-sm md:text-base text-muted-foreground leading-relaxed">
              {parts.map((part, i) => {
                if (part.startsWith("`")) {
                  return (
                    <code key={i} className="bg-code text-primary/90 px-2 py-0.5 rounded text-xs md:text-sm font-mono">
                      {part.replace(/`/g, "")}
                    </code>
                  );
                } else if (part.startsWith("**")) {
                  return (
                    <strong key={i}>{part.replace(/\*\*/g, "")}</strong>
                  );
                }
                return part;
              })}
            </p>
          );
        })}
      </div>
    </div>
  );
};

const defaultMessages: Record<"beginner" | "intermediate" | "advanced", string[]> = {
  beginner: [
    "Select a line of code to see a friendly explanation.",
    "Use this panel to understand what each part of the file is doing.",
    "Try clicking around to explore the flow of the program.",
  ],
  intermediate: [
    "Get insights tailored to your experience level by clicking a line.",
    "Use the explanations to reinforce architecture and best practices.",
    "Switch the skill level above to compare different perspectives.",
  ],
  advanced: [
    "Dive into the implementation details by selecting a line of interest.",
    "Use this view to think about trade-offs, complexity, and improvements.",
    "Pair explanations with the code viewer to plan refactors quickly.",
  ],
};

const ExplanationPanel = ({
  isLoading,
  skillLevel,
  selectedFile,
  selectedLine,
  lineExplanation,
  fileExplanation,
}: ExplanationPanelProps) => {
  const defaultItems = defaultMessages[skillLevel];
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopyExplanation = () => {
    const textToCopy = lineExplanation || fileExplanation || "";
    if (!textToCopy) return;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Explanation copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    });
  };

  return (
    <Card className="h-full bg-card border-border">
      <div className="bg-secondary/50 px-3 md:px-4 py-2.5 md:py-3 border-b border-border flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
        <span className="text-xs md:text-sm font-semibold">Explanation</span>
        <span className="text-[10px] md:text-xs text-muted-foreground ml-auto capitalize">
          {skillLevel}
        </span>
        {(lineExplanation || fileExplanation) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyExplanation}
            className="h-7 px-2 ml-2"
          >
            {copied ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </Button>
        )}
      </div>

      <div className="p-4 md:p-6 space-y-3 md:space-y-4 max-h-[400px] md:max-h-[600px] overflow-auto">
        {isLoading ? (
          <div className="space-y-3 md:space-y-4">
            <Skeleton className="h-5 md:h-6 w-3/4 bg-muted" />
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-3 md:h-4 w-full bg-muted" />
            ))}
          </div>
        ) : lineExplanation && selectedLine && selectedFile ? (
          <>
            <h3 className="text-base md:text-xl font-bold text-foreground">
              {selectedFile}
            </h3>
            <div className="text-xs md:text-sm text-muted-foreground mb-4">Line {selectedLine}</div>
            <div className="space-y-4 md:space-y-5">
              {parseExplanationText(lineExplanation).map((section) => (
                renderExplanationSection(section)
              ))}
            </div>

            {/* Related Concepts */}
            {getRelatedConcepts(lineExplanation).length > 0 && (
              <div className="mt-4 md:mt-6 p-3 md:p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <h4 className="text-xs md:text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
                  <BookOpen className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                  Related Concepts
                </h4>
                <div className="space-y-2">
                  {getRelatedConcepts(lineExplanation).map((concept, idx) => (
                    <div key={idx} className="text-xs md:text-sm">
                      <div className="font-semibold text-foreground mb-1">
                        {concept.primary.name}
                      </div>
                      <p className="text-muted-foreground mb-1.5">
                        {concept.primary.description}
                      </p>
                      {concept.related.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {concept.related.map((rel, ridx) => (
                            <Badge key={ridx} variant="outline" className="text-xs bg-secondary">
                              {rel.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 md:mt-6 p-3 md:p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-xs md:text-sm text-muted-foreground flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>
                  Click on any other line to generate a fresh explanation tailored to the {skillLevel} perspective.
                </span>
              </p>
            </div>
          </>
        ) : fileExplanation && selectedFile && !selectedLine ? (
          <>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div className="text-sm md:text-base text-foreground leading-relaxed space-y-4 md:space-y-5">
                {fileExplanation.split("\n").map((line, idx) => {
                  // Section headers (##)
                  if (line.startsWith("##")) {
                    return (
                      <div key={idx} className="mt-5 mb-3 first:mt-0">
                        <h2 className="text-base md:text-lg font-bold text-primary flex items-center gap-2">
                          {line.replace(/^##\s*/, "")}
                        </h2>
                        <div className="h-0.5 w-12 bg-primary/30 mt-2"></div>
                      </div>
                    );
                  }
                  // Bold section labels (**text**)
                  if (line.startsWith("**") && line.endsWith("**")) {
                    return (
                      <p key={idx} className="font-semibold text-foreground text-sm md:text-base mt-3 mb-2">
                        {line.replace(/\*\*/g, "")}
                      </p>
                    );
                  }
                  // Bullet points
                  if (line.startsWith("•")) {
                    const content = line.replace(/^•\s*/, "");
                    return (
                      <div key={idx} className="flex gap-3 text-sm md:text-base text-muted-foreground">
                        <span className="text-primary font-bold flex-shrink-0 mt-0.5">•</span>
                        <span className="leading-relaxed">{content}</span>
                      </div>
                    );
                  }
                  // Code references (backticks)
                  if (line.includes("`")) {
                    const parts = line.split(/(`[^`]+`)/);
                    return (
                      <p key={idx} className="text-sm md:text-base text-muted-foreground leading-relaxed">
                        {parts.map((part, i) =>
                          part.startsWith("`") ? (
                            <code key={i} className="bg-code text-primary/90 px-2 py-0.5 rounded text-xs md:text-sm font-mono">
                              {part.replace(/`/g, "")}
                            </code>
                          ) : (
                            <span key={i}>{part}</span>
                          )
                        )}
                      </p>
                    );
                  }
                  // Regular paragraphs
                  if (line.trim()) {
                    return (
                      <p key={idx} className="text-sm md:text-base text-muted-foreground leading-relaxed">
                        {line}
                      </p>
                    );
                  }
                  // Empty lines for spacing
                  return <div key={idx} className="h-2" />;
                })}
              </div>
            </div>

            <div className="mt-4 md:mt-6 p-3 md:p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-xs md:text-sm text-muted-foreground flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>
                  Click on a specific line to dive deeper into the code.
                </span>
              </p>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-base md:text-xl font-bold text-foreground">
              Ready when you are
            </h3>
            <div className="space-y-2.5 md:space-y-3">
              {defaultItems.map((paragraph, idx) => (
                <p
                  key={idx}
                  className="text-sm md:text-base text-muted-foreground leading-relaxed pl-3 md:pl-4 border-l-2 border-primary/30"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            {!selectedFile && (
              <div className="mt-4 md:mt-6 p-3 md:p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-xs md:text-sm text-muted-foreground flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Pick a file from the list to begin exploring its contents.</span>
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
};

export default ExplanationPanel;
