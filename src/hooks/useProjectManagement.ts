
import { useRef, useState, ChangeEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { useProjectStore } from "@/store/useProjectStore";
import { TAB_MODES } from "@/constants/appConstants";
import { fetchRepositoryProject, fetchFileContent } from "@/lib/github";
import { generateProject } from "@/lib/generation";
import { inferLanguageFromFilename } from "@/lib/languages";
import { generateW3SchoolsFileExplanation } from "@/lib/w3schoolsExplainer";
import { ProjectFile } from "@/types/project";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { useSupabaseOAuth } from "./useSupabaseOAuth";

export const useProjectManagement = () => {
    const { toast } = useToast();
    const {
        mode,
        setProject,
        setFileCache,
        setSelectedFile,
        setChatMessages,
        setIsLoading,
        setIsFileLoading,
        fileCache,
        project,
        updateFileCache,
        resetSelection,
        skillLevel
    } = useProjectStore();

    const { isAuthenticated, user } = useSupabaseOAuth();

    const [uploadedFolderName, setUploadedFolderName] = useState<string | null>(null);
    const folderInputRef = useRef<HTMLInputElement | null>(null);

    const processUploadedFiles = async (files: FileList | File[]) => {
        if (!files || files.length === 0) return;

        resetSelection();
        setIsFileLoading(true);

        try {
            const fileArray = Array.from(files);
            const folderName = (fileArray[0] as File & { webkitRelativePath?: string }).webkitRelativePath?.split("/")?.[0] ?? "Uploaded Folder";

            const folderFiles: ProjectFile[] = await Promise.all(
                fileArray.map(async (file) => ({
                    path: (file as File & { webkitRelativePath?: string }).webkitRelativePath ?? file.name,
                    language: inferLanguageFromFilename(file.name),
                    size: file.size ?? null,
                    content: await file.text()
                }))
            );

            const cache: Record<string, ProjectFile> = {};
            folderFiles.forEach(f => { if (f.content) cache[f.path] = f; });

            setProject({
                summary: { name: folderName, description: `Local: ${folderName}`, source: "uploaded", language: null },
                files: folderFiles
            });
            setFileCache(cache);

            const first = folderFiles.find(f => f.content);
            if (first) {
                setSelectedFile(first.path);
                const explanation = generateW3SchoolsFileExplanation(first.path, first.content || "", skillLevel);
                setChatMessages([{ role: 'model', content: explanation }]);
            }
        } catch (error) {
            toast({ title: "Upload failed", variant: "destructive" });
        } finally {
            setIsFileLoading(false);
            if (folderInputRef.current) folderInputRef.current.value = "";
        }
    };

    const handleFolderInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            await processUploadedFiles(event.target.files);
        }
    };

    const handleAnalyze = async (repoUrl: string, projectIdea: string, token: string | null) => {
        resetSelection();
        if (mode === TAB_MODES.GITHUB && !repoUrl.trim()) return toast({ title: "Repo URL required", variant: "destructive" });
        if (mode === TAB_MODES.GENERATE && !projectIdea.trim()) return toast({ title: "Idea required", variant: "destructive" });

        setIsLoading(true);
        try {
            if (mode === TAB_MODES.GITHUB) {
                const next = await fetchRepositoryProject(repoUrl.trim(), token);
                setProject(next);
                if (next.files.length > 0) setSelectedFile(next.files[0].path);

                // Auto-save if authenticated
                if (isAuthenticated && user) {
                    supabase.from('projects').insert({
                        user_id: user.id,
                        name: next.summary.name,
                        description: next.summary.description,
                        repo_url: repoUrl.trim(),
                        project_type: 'github',
                        language: next.summary.language,
                        skill_level: skillLevel,
                        files: next.files as unknown as Json
                    }).then(({ error }) => {
                        if (error) console.error("Failed to auto-save project:", error);
                        else toast({ title: "Project saved to history" });
                    });
                }

            } else if (mode === TAB_MODES.GENERATE) {
                const next = generateProject(projectIdea.trim(), skillLevel);
                setProject(next);
                const cache: Record<string, ProjectFile> = {};
                next.files.forEach(f => { if (f.content) cache[f.path] = f; });
                setFileCache(cache);
                if (next.files.length > 0) setSelectedFile(next.files[0].path);

                // Auto-save if authenticated
                if (isAuthenticated && user) {
                    supabase.from('projects').insert({
                        user_id: user.id,
                        name: next.summary.name || projectIdea.trim().slice(0, 50),
                        description: next.summary.description,
                        project_idea: projectIdea.trim(),
                        project_type: 'generated',
                        skill_level: skillLevel,
                        files: next.files as unknown as Json
                    }).then(({ error }) => {
                        if (error) console.error("Failed to auto-save project:", error);
                        else toast({ title: "Project saved to history" });
                    });
                }
            }
        } catch (e) {
            toast({ title: "Analysis failed", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileSelect = async (path: string, token: string | null) => {
        if (!project) return;
        resetSelection();
        setSelectedFile(path);

        if (fileCache[path]?.content) {
            const explanation = generateW3SchoolsFileExplanation(path, fileCache[path].content || "", skillLevel);
            setChatMessages([{ role: 'model', content: explanation }]);
            return;
        }

        if (project.summary.source === "github") {
            setIsFileLoading(true);
            try {
                const fetched = await fetchFileContent(
                    project.summary.owner!,
                    project.summary.repo!,
                    project.summary.branch ?? "main",
                    path,
                    token
                );
                updateFileCache(path, fetched);
                const explanation = generateW3SchoolsFileExplanation(path, fetched.content || "", skillLevel);
                setChatMessages([{ role: 'model', content: explanation }]);
            } catch (e) {
                toast({ title: "Fetch failed", variant: "destructive" });
            } finally {
                setIsFileLoading(false);
            }
        }
    };

    return {
        uploadedFolderName,
        folderInputRef,
        handleFolderInputChange,
        processUploadedFiles,
        handleAnalyze,
        handleFileSelect
    };
};
