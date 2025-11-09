import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ProjectFile } from "@/types/project";

interface FileNavigatorProps {
  files: ProjectFile[];
  selectedFile: string | null;
  onFileSelect: (path: string) => void;
}

const FileNavigator = ({ files, selectedFile, onFileSelect }: FileNavigatorProps) => {
  return (
    <Card className="p-4 bg-card border-border h-full">
      <h3 className="text-sm font-semibold mb-3">
        Project Files
      </h3>
      <ScrollArea className="h-[calc(100%-2rem)]">
        <div className="space-y-1">
          {files.map((file) => (
            <button
              key={file.path}
              onClick={() => onFileSelect(file.path)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${
                selectedFile === file.path
                  ? "bg-sky-600/20 text-sky-600 dark:bg-sky-600/30 dark:text-sky-400"
                  : "hover:bg-sky-600/10 text-muted-foreground hover:text-foreground dark:hover:bg-sky-600/20"
              }`}
            >
              <div className="flex flex-col text-left truncate">
                <span className="truncate">{file.path}</span>
                {(file.language || file.size) && (
                  <span className="text-[10px] text-muted-foreground">
                    {file.language ?? "Unknown"}
                    {typeof file.size === "number" && `· ${(file.size / 1024).toFixed(1)} KB`}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default FileNavigator;