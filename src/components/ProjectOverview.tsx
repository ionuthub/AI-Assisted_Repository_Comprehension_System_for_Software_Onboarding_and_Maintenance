import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Code2, Zap } from "lucide-react";
import type { ProjectOverview } from "@/lib/projectAnalyzer";

interface ProjectOverviewProps {
  overview: ProjectOverview;
}

export default function ProjectOverviewComponent({ overview }: ProjectOverviewProps) {
  return (
    <Card className="p-6 mb-6 bg-card border-border">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-primary" />
              Project Overview
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {overview.description}
            </p>
          </div>
          <Badge
            variant={
              overview.difficulty === "easy"
                ? "default"
                : overview.difficulty === "medium"
                  ? "secondary"
                  : "destructive"
            }
            className="whitespace-nowrap"
          >
            {overview.difficulty === "easy"
              ? "🟢 Beginner"
              : overview.difficulty === "medium"
                ? "🟡 Intermediate"
                : "🔴 Advanced"}
          </Badge>
        </div>

        {/* Main Explanation */}
        <div className="space-y-3 text-sm leading-relaxed text-foreground">
          {overview.explanation.map((line, idx) => {
            if (line === "") {
              return <div key={idx} className="h-2" />;
            }
            if (line.startsWith("**") && line.endsWith("**")) {
              return (
                <div key={idx} className="font-semibold text-foreground mt-3">
                  {line.replace(/\*\*/g, "")}
                </div>
              );
            }
            if (line.startsWith("•")) {
              return (
                <div key={idx} className="ml-4 flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span className="text-foreground">{line.replace("•", "").trim()}</span>
                </div>
              );
            }
            if (line.startsWith("1.") || line.startsWith("2.") || line.startsWith("3.") || line.startsWith("4.")) {
              return (
                <div key={idx} className="ml-4 flex items-start gap-2">
                  <span className="text-primary font-semibold">
                    {line.split(".")[0]}.
                  </span>
                  <span className="text-foreground">{line.split(".").slice(1).join(".").trim()}</span>
                </div>
              );
            }
            return (
              <p key={idx} className="text-foreground">
                {line}
              </p>
            );
          })}
        </div>

        {/* Frameworks and Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-4 border-t border-border">
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2 mb-2">
              <Code2 className="w-4 h-4 text-primary" />
              Technologies
            </h3>
            <div className="flex flex-wrap gap-2">
              {overview.frameworks.map((framework) => (
                <Badge key={framework} variant="outline" className="bg-secondary">
                  {framework}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-primary" />
              Features
            </h3>
            <div className="space-y-1">
              {overview.keyFeatures.slice(0, 3).map((feature) => (
                <div key={feature} className="text-sm text-foreground">
                  ✓ {feature}
                </div>
              ))}
              {overview.keyFeatures.length > 3 && (
                <div className="text-sm text-muted-foreground italic">
                  +{overview.keyFeatures.length - 3} more features
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
