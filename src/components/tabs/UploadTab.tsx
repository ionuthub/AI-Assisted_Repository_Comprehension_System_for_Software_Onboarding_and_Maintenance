import { useRef } from "react";
import { FileCode, Sparkles, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TAB_CONFIG, TAB_MODES } from "@/constants/appConstants";

interface UploadTabProps {
  isLoading: boolean;
  uploadedFolderName: string | null;
  onFolderSelect: (files: FileList) => void;
  onAnalyze: () => void;
  isProjectLoaded: boolean;
  isAuthenticated?: boolean;
}

/**
 * UploadTab Component
 * Handles local folder upload and analysis
 */
export const UploadTab = ({
  isLoading,
  uploadedFolderName,
  onFolderSelect,
  onAnalyze,
  isProjectLoaded,
  isAuthenticated = false
}: UploadTabProps) => {
  const folderInputRef = useRef<HTMLInputElement | null>(null);

  const handleFolderClick = () => {
    console.log("Folder button clicked");
    folderInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("File input changed", e.target.files);
    if (e.target.files) {
      console.log("Files count:", e.target.files.length);
      onFolderSelect(e.target.files);
    }
  };

  const config = TAB_CONFIG[TAB_MODES.UPLOAD];

  return (
    <div className="mt-6 space-y-4">
      {!isAuthenticated && (
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900 dark:text-blue-100">
              Temporary Analysis
            </p>
            <p className="text-blue-700 dark:text-blue-300 mt-1">
              Your project will be analyzed in your browser only. Sign in with GitHub to save your project history.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col items-start gap-3">
        <Button
          onClick={handleFolderClick}
          variant="outline"
          className="bg-secondary/40 hover:bg-secondary/60 text-foreground"
        >
          <input
            type="file"
            multiple
            className="hidden"
            ref={(input) => {
              folderInputRef.current = input;
              if (input) {
                input.setAttribute("webkitdirectory", "true");
                input.setAttribute("directory", "true");
              }
            }}
            onChange={handleFileChange}
          />
          <span>Select folder…</span>
        </Button>
        {uploadedFolderName && (
          <p className="text-sm text-muted-foreground">
            Selected: {uploadedFolderName}
          </p>
        )}
      </div>
      <Button
        onClick={onAnalyze}
        disabled={isLoading || !isProjectLoaded}
        className="w-full md:w-auto bg-sky-600 hover:bg-sky-700 text-white"
      >
        {isLoading ? (
          <>
            <Sparkles className="mr-2 h-4 w-4 animate-spin" />
            {config.loadingText}
          </>
        ) : (
          <>
            <FileCode className="mr-2 h-4 w-4" />
            {config.buttonText}
          </>
        )}
      </Button>
    </div>
  );
};

export default UploadTab;
