
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useProjectStore } from "@/store/useProjectStore";
import { TAB_MODES } from "@/constants/appConstants";
import { fetchRepositoryProject, fetchFileContent, type IngestionProgress } from "@/lib/github";

import { rateLimiters } from "@/lib/security";

export const useProjectManagement = () => {
    const { toast } = useToast();
    const {
        mode,
        setProject,
        setFileCache,
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

        // Rate limit check
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

            // Coverage is stated explicitly: the file list is capped, so a participant
            // (and the observer recording the session) should be able to see that the
            // answers are grounded in part of the repository rather than all of it.
            const ingestion = next.ingestion;
            if (ingestion) {
                const omitted = ingestion.totalCandidateFiles - ingestion.includedFiles;
                const failed = ingestion.includedFiles - ingestion.filesWithContent;
                const notes = [
                    omitted > 0 ? `${omitted} file${omitted === 1 ? "" : "s"} beyond the analysis cap were not included` : null,
                    failed > 0 ? `${failed} could not be read` : null,
                    ingestion.treeTruncatedByGitHub ? "GitHub truncated the file tree for this repository" : null,
                ].filter(Boolean);
                toast({
                    title: `Indexed ${ingestion.filesWithContent} of ${ingestion.totalCandidateFiles} files`,
                    description: notes.length > 0 ? notes.join(". ") + "." : undefined,
                    variant: notes.length > 0 ? "default" : undefined,
                });
            }
        } catch (e) {
            // github.ts distinguishes not-found, rate-limited, forbidden and validation
            // failures; surfacing the message keeps that distinction visible to the user
            // and to an observer logging an incident during a timed session.
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

        if (fileCache[path]?.content) {
            return;
        }

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
