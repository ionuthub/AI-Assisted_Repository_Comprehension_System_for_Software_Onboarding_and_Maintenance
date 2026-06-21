import { useRef, useState } from "react";
import { FileCode, Sparkles, Info, Upload, FolderOpen, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TAB_CONFIG, TAB_MODES } from "@/constants/appConstants";

interface UploadTabProps {
  isLoading: boolean;
  uploadedFolderName: string | null;
  onFolderSelect: (files: FileList | File[]) => void;
  onAnalyze: () => void;
  isProjectLoaded: boolean;
  isAuthenticated?: boolean;
}

/**
 * UploadTab Component
 * Handles local folder upload, ZIP upload, drag-and-drop, and analysis
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
  const zipInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleFolderClick = () => {
    folderInputRef.current?.click();
  };

  const handleZipClick = () => {
    zipInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFolderSelect(e.target.files);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFolderSelect(e.dataTransfer.files);
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

      {/* Drag & Drop Area */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 transition-all ${
          isDragActive
            ? "border-sky-500 bg-sky-500/10 scale-[1.01]"
            : "border-muted hover:border-sky-500/50 hover:bg-secondary/20"
        }`}
      >
        <Upload className={`w-10 h-10 mb-4 transition-transform duration-300 ${isDragActive ? "translate-y-[-4px] text-sky-500" : "text-muted-foreground"}`} />
        <p className="text-sm text-foreground font-medium mb-1">
          Drag & drop your project folder or .zip file here
        </p>
        <p className="text-xs text-muted-foreground mb-4">
          Files will be analyzed entirely inside your browser
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          <Button
            onClick={handleFolderClick}
            variant="outline"
            className="gap-2 bg-secondary/40 hover:bg-secondary/60 text-foreground"
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
            <FolderOpen className="w-4 h-4 text-sky-500" />
            <span>Select Folder</span>
          </Button>

          <Button
            onClick={handleZipClick}
            variant="outline"
            className="gap-2 bg-secondary/40 hover:bg-secondary/60 text-foreground"
          >
            <input
              type="file"
              accept=".zip"
              className="hidden"
              ref={zipInputRef}
              onChange={handleFileChange}
            />
            <Archive className="w-4 h-4 text-indigo-500" />
            <span>Select ZIP File</span>
          </Button>
        </div>

        {uploadedFolderName && (
          <p className="text-sm font-semibold text-sky-600 dark:text-sky-400 mt-4 bg-sky-600/10 px-3 py-1 rounded-full animate-fade-in">
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
