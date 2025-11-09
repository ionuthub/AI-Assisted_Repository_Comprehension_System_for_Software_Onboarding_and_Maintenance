import { useState } from "react";
import { Wand2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TAB_CONFIG, TAB_MODES } from "@/constants/appConstants";

interface GenerateTabProps {
  isLoading: boolean;
  onGenerate: (idea: string) => void;
}

/**
 * GenerateTab Component
 * Handles project idea input and generation
 */
export const GenerateTab = ({ isLoading, onGenerate }: GenerateTabProps) => {
  const [projectIdea, setProjectIdea] = useState("");

  const handleGenerate = () => {
    if (projectIdea.trim()) {
      onGenerate(projectIdea.trim());
    }
  };

  const config = TAB_CONFIG[TAB_MODES.GENERATE];

  return (
    <div className="mt-6 space-y-4">
      <Input
        placeholder={config.placeholder}
        value={projectIdea}
        onChange={(e) => setProjectIdea(e.target.value)}
        disabled={isLoading}
        onKeyPress={(e) => {
          if (e.key === "Enter" && !isLoading) {
            handleGenerate();
          }
        }}
      />
      <Button
        onClick={handleGenerate}
        disabled={isLoading || !projectIdea.trim()}
        className="w-full md:w-auto bg-sky-600 hover:bg-sky-700 text-white"
      >
        {isLoading ? (
          <>
            <Sparkles className="mr-2 h-4 w-4 animate-spin" />
            {config.loadingText}
          </>
        ) : (
          <>
            <Wand2 className="mr-2 h-4 w-4" />
            {config.buttonText}
          </>
        )}
      </Button>
    </div>
  );
};

export default GenerateTab;
