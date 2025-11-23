import { useState } from "react";
import { Github, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TAB_CONFIG, TAB_MODES } from "@/constants/appConstants";

interface GitHubTabProps {
  isLoading: boolean;
  onAnalyze: (url: string, token?: string) => void;
}

/**
 * GitHubTab Component
 * Handles GitHub repository URL input and analysis
 */
export const GitHubTab = ({ isLoading, onAnalyze }: GitHubTabProps) => {
  const [repoUrl, setRepoUrl] = useState("");
  const [token, setToken] = useState("");
  const [showTokenInput, setShowTokenInput] = useState(false);

  const handleAnalyze = () => {
    if (repoUrl.trim()) {
      onAnalyze(repoUrl.trim(), token.trim());
    }
  };

  const config = TAB_CONFIG[TAB_MODES.GITHUB];

  return (
    <div className="mt-6 space-y-4">
      <Input
        placeholder={config.placeholder}
        value={repoUrl}
        onChange={(e) => setRepoUrl(e.target.value)}
        disabled={isLoading}
        onKeyPress={(e) => {
          if (e.key === "Enter" && !isLoading) {
            handleAnalyze();
          }
        }}
      />

      <div className="flex flex-col gap-2">
        <button
          onClick={() => setShowTokenInput(!showTokenInput)}
          className="text-xs text-muted-foreground hover:text-primary text-left w-fit flex items-center gap-1"
        >
          {showTokenInput ? "Hide" : "Add"} Private Repo Token (Optional)
        </button>

        {showTokenInput && (
          <Input
            type="password"
            placeholder="ghp_..."
            value={token}
            onChange={(e) => setToken(e.target.value)}
            disabled={isLoading}
            className="text-sm"
          />
        )}
      </div>

      <Button
        onClick={handleAnalyze}
        disabled={isLoading || !repoUrl.trim()}
        className="w-full md:w-auto bg-sky-600 hover:bg-sky-700 text-white"
      >
        {isLoading ? (
          <>
            <Sparkles className="mr-2 h-4 w-4 animate-spin" />
            {config.loadingText}
          </>
        ) : (
          <>
            <Github className="mr-2 h-4 w-4" />
            {config.buttonText}
          </>
        )}
      </Button>
    </div>
  );
};

export default GitHubTab;
