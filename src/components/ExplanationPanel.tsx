import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, BookOpen, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getRelatedConcepts } from "@/lib/relatedConcepts";
import { getComplexityBadge } from "@/lib/complexityDetector";

interface ExplanationPanelProps {
  isLoading: boolean;
  skillLevel: "beginner" | "intermediate" | "advanced";
  selectedFile: string | null;
  selectedLine: number | null;
  lineExplanation: string | null;
}

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
}: ExplanationPanelProps) => {
  const defaultItems = defaultMessages[skillLevel];

  return (
    <Card className="h-full bg-card border-border">
      <div className="bg-secondary/50 px-3 md:px-4 py-2.5 md:py-3 border-b border-border flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
        <span className="text-xs md:text-sm font-semibold">Explanation</span>
        <span className="text-[10px] md:text-xs text-muted-foreground ml-auto capitalize">
          {skillLevel}
        </span>
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
            <div className="text-xs md:text-sm text-muted-foreground">Line {selectedLine}</div>
            <div className="space-y-2.5 md:space-y-3">
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed pl-3 md:pl-4 border-l-2 border-primary/30">
                {lineExplanation}
              </p>
            </div>

            {/* Related Concepts */}
            {getRelatedConcepts(lineExplanation).length > 0 && (
              <div className="mt-4 md:mt-6 p-3 md:p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="text-xs md:text-sm font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2 mb-2">
                  <BookOpen className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  Related Concepts
                </h4>
                <div className="space-y-2">
                  {getRelatedConcepts(lineExplanation).map((concept, idx) => (
                    <div key={idx} className="text-xs md:text-sm">
                      <div className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                        {concept.primary.name}
                      </div>
                      <p className="text-blue-800 dark:text-blue-200 mb-1.5">
                        {concept.primary.description}
                      </p>
                      {concept.related.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {concept.related.map((rel, ridx) => (
                            <Badge key={ridx} variant="outline" className="text-xs bg-white dark:bg-blue-900">
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
