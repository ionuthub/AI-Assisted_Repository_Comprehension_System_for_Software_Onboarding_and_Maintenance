import { GraduationCap, Lightbulb, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SkillSelectorProps {
  selectedLevel: "beginner" | "intermediate" | "advanced";
  onLevelChange: (level: "beginner" | "intermediate" | "advanced") => void;
  disabled?: boolean;
}

const SkillSelector = ({ selectedLevel, onLevelChange, disabled }: SkillSelectorProps) => {
  const levels = [
    {
      id: "beginner" as const,
      label: "Beginner",
      description: "Simple explanations with examples",
      icon: GraduationCap,
    },
    {
      id: "intermediate" as const,
      label: "Intermediate",
      description: "Balanced detail with best practices",
      icon: Lightbulb,
    },
    {
      id: "advanced" as const,
      label: "Advanced",
      description: "In-depth technical analysis",
      icon: Rocket,
    },
  ];

  return (
    <div className="space-y-2 md:space-y-3">
      <label className="text-xs md:text-sm font-medium text-muted-foreground">
        Select Your Skill Level
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        {levels.map((level) => {
          const isSelected = selectedLevel === level.id;
          const Icon = level.icon;
          
          return (
            <Button
              key={level.id}
              variant={isSelected ? "default" : "outline"}
              onClick={() => onLevelChange(level.id)}
              disabled={disabled}
              className={`h-auto py-4 md:py-5 px-5 md:px-6 flex flex-col items-start gap-2 md:gap-2.5 transition-all active:scale-95 ${
                isSelected
                  ? "bg-sky-600 text-white border-sky-600 shadow-lg shadow-sky-600/30 hover:bg-sky-700 hover:border-sky-700"
                  : "bg-secondary/70 border-border hover:bg-secondary hover:border-border/80 text-foreground"
              }`}
            >
              <div className="flex items-center gap-2 w-full">
                <Icon className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-sm md:text-base font-semibold">{level.label}</span>
              </div>
              <span className="text-[10px] md:text-xs opacity-80 text-left">
                {level.description}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default SkillSelector;
