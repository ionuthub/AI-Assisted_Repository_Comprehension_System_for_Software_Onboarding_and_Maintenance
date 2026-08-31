import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useProjectStore } from "@/store/useProjectStore";
import { fetchRepositoryProject, fetchFileContent, type IngestionProgress } from "@/lib/github";
import { rateLimiters } from "@/lib/security";

export const useProjectManagement = () => {
    const { toast } = useToast();
    const {
        setProject,
        setSelectedFile,
        setIsLoading,
        setIsFileLoading,
        fileCache,
        project,
        updateFileCache,
        updateStaticAnalysis,
        resetSelection
    } = useProjectStore();

    const [ingestionProgress, setIngestionProgress] = useState<IngestionProgress | null>(null);

    const handleAnalyze = async (repoUrl: string, projectIdea: string) => {
        resetSelection();
        if (!repoUrl.trim()) return toast({ title: "Repo URL required", variant: "destructive" });

        const rateLimitKey = 'anonymous';
        if (!rateLimiters.api.isAllowed(rateLimitKey)) {
            const waitTime = Math.ceil(rateLimiters.api.getTimeUntilReset(rateLimitKey) / 1000);
            toast({
                title: "Rate limit exceeded",
                description: `Please wait ${waitTime} seconds before analyzing another repository`,
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            const next = await fetchRepositoryProject(repoUrl.trim(), setIngestionProgress);
            setProject(next);
            if (next.files.length > 0) setSelectedFile(next.files[0].path);

            const ingestion = next.ingestion;
            if (ingestion) {
                const failed = ingestion.includedFiles - ingestion.filesWithContent;
                toast({
                    title: `Indexed ${ingestion.filesWithContent} of ${ingestion.totalCandidateFiles} eligible files`,
                    description:
                        failed > 0
                            ? `${failed} eligible file${failed === 1 ? "" : "s"} could not be read.`
                            : "All eligible files were read and indexed.",
                    variant: failed > 0 ? "default" : undefined,
                });
            }
        } catch (e) {
            toast({
                title: "Analysis failed",
                description: e instanceof Error ? e.message : "Unexpected error",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
            setIngestionProgress(null);
        }
    };

    const handleFileSelect = async (path: string) => {
        if (!project) return;
        resetSelection();
        setSelectedFile(path);

        // Repository ingestion now hydrates every readable eligible file up front. Re-fetching
        // a file merely because the user opened it wastes a GitHub request and scales badly for
        // large repositories. The project corpus is therefore the primary source of file text.
        const ingestedFile = project.files.find((file) => file.path === path);
        if (ingestedFile?.content) return;

        // Kept as a defensive fallback for a future project source that can expose a path before
        // hydrating its contents. It is normally unreachable for the current GitHub workflow.
        if (fileCache[path]?.content) return;

        if (project.summary.source === "github") {
            setIsFileLoading(true);
            try {
                const fetched = await fetchFileContent(
                    project.summary.owner!,
                    project.summary.repo!,
                    project.summary.branch ?? "main",
                    path
                );
                updateFileCache(path, fetched);
                if (fetched.content) {
                    updateStaticAnalysis(path, fetched.content);
                }
            } catch (e) {
                toast({
                    title: "Fetch failed",
                    description: e instanceof Error ? e.message : "Unexpected error",
                    variant: "destructive",
                });
            } finally {
                setIsFileLoading(false);
            }
        }
    };

    return {
        handleAnalyze,
        handleFileSelect,
        ingestionProgress
    };
};
