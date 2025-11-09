import { useRef } from "react";
import { FileCode, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TAB_CONFIG, TAB_MODES } from "@/constants/appConstants";

interface UploadTabProps {
  isLoading: boolean;
  uploadedFolderName: string | null;
  onFolderSelect: (files: FileList) => void;
  onAnalyze: () => void;
  isProjectLoaded: boolean;
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
  isProjectLoaded
}: UploadTabProps) => {
  const folderInputRef = useRef<HTMLInputElement | null>(null);

  const handleFolderClick = () => {
    folderInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFolderSelect(e.target.files);
    }
  };

  const config = TAB_CONFIG[TAB_MODES.UPLOAD];

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-col items-start gap-3">
        <label className="text-sm font-medium text-foreground">
          {config.placeholder}
        </label>
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
