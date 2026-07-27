
import { useRef, useState, ChangeEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { useProjectStore } from "@/store/useProjectStore";
import { TAB_MODES } from "@/constants/appConstants";
import { fetchRepositoryProject, fetchFileContent } from "@/lib/github";
import { inferLanguageFromFilename } from "@/lib/languages";
import { generateW3SchoolsFileExplanation } from "@/lib/w3schoolsExplainer";
import { ProjectFile } from "@/types/project";

import { rateLimiters } from "@/lib/security";
import { parseZipFile } from "@/lib/zipParser";

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
        updateStaticAnalysis,
        resetSelection,
        skillLevel
    } = useProjectStore();

    const [uploadedFolderName, setUploadedFolderName] = useState<string | null>(null);
    const folderInputRef = useRef<HTMLInputElement | null>(null);

    const processUploadedFiles = async (files: FileList | File[]) => {
        const rateLimitKey = 'anonymous';
        if (!rateLimiters.upload.isAllowed(rateLimitKey)) {
            const waitTime = Math.ceil(rateLimiters.upload.getTimeUntilReset(rateLimitKey) / 1000);
            toast({
                title: "Rate limit exceeded",
                description: `Please wait ${waitTime} seconds before uploading again`,
                variant: "destructive",
            });
            return;
        }

        if (!files || files.length === 0) {
            return;
        }

        resetSelection();
        setIsFileLoading(true);

        try {
            const fileArray = Array.from(files);
            let folderFiles: ProjectFile[] = [];
            let folderName = "Uploaded Folder";

            if (fileArray.length === 0) {
                setIsFileLoading(false);
                return;
            }

            const firstFile = fileArray[0];
            const isZipUpload = fileArray.length === 1 && firstFile.name.toLowerCase().endsWith(".zip");

            if (isZipUpload) {
                toast({
                    title: "Extracting ZIP archive...",
                    description: `Reading ${firstFile.name}...`
                });
                folderFiles = await parseZipFile(firstFile);
                folderName = firstFile.name.replace(/\.[^/.]+$/, ""); // Strip extension

                const MAX_FILES = 500;
                const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB

                if (folderFiles.length > MAX_FILES) {
                    toast({
                        title: "Too many files in ZIP",
                        description: `This ZIP contains ${folderFiles.length} code files. Limit is ${MAX_FILES}.`,
                        variant: "destructive"
                    });
                    setIsFileLoading(false);
                    return;
                }

                const totalSize = folderFiles.reduce((acc, f) => acc + (f.size ?? 0), 0);
                if (totalSize > MAX_TOTAL_SIZE) {
                    toast({
                        title: "ZIP contents too large",
                        description: `Total unzipped size is ${(totalSize / 1024 / 1024).toFixed(1)}MB. Limit is 50MB.`,
                        variant: "destructive"
                    });
                    setIsFileLoading(false);
                    return;
                }
            } else {
                folderName = (firstFile as File & { webkitRelativePath?: string }).webkitRelativePath?.split("/")?.[0] ?? "Uploaded Folder";

                // Filter out common binary/non-text files
                const textFileExtensions = [
                    '.js', '.jsx', '.ts', '.tsx', '.json', '.html', '.css', '.scss', '.sass',
                    '.py', '.java', '.cpp', '.c', '.h', '.cs', '.go', '.rs', '.rb', '.php',
                    '.md', '.txt', '.xml', '.yml', '.yaml', '.toml', '.env', '.gitignore',
                    '.sh', '.bash', '.sql', '.graphql', '.vue', '.svelte'
                ];

                const filteredFiles = fileArray.filter(file => {
                    const fileName = file.name.toLowerCase();
                    return textFileExtensions.some(ext => fileName.endsWith(ext));
                });

                if (filteredFiles.length === 0) {
                    toast({
                        title: "No text files found",
                        description: "Please select a folder containing code files",
                        variant: "destructive"
                    });
                    setIsFileLoading(false);
                    return;
                }

                // Limits
                const MAX_FILES = 500;
                const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB per file
                const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB total

                // Check file count
                if (filteredFiles.length > MAX_FILES) {
                    toast({
                        title: "Too many files",
                        description: `This folder has ${filteredFiles.length} code files. Please select a folder with fewer than ${MAX_FILES} files.`,
                        variant: "destructive"
                    });
                    setIsFileLoading(false);
                    return;
                }

                // Check individual file sizes and total size
                let totalSize = 0;
                const oversizedFiles: string[] = [];

                for (const file of filteredFiles) {
                    if (file.size > MAX_FILE_SIZE) {
                        oversizedFiles.push(file.name);
                    }
                    totalSize += file.size;
                }

                if (oversizedFiles.length > 0) {
                    toast({
                        title: "Files too large",
                        description: `Some files exceed 5MB: ${oversizedFiles.slice(0, 3).join(', ')}${oversizedFiles.length > 3 ? '...' : ''}`,
                        variant: "destructive"
                    });
                    setIsFileLoading(false);
                    return;
                }

                if (totalSize > MAX_TOTAL_SIZE) {
                    toast({
                        title: "Folder too large",
                        description: `Total size is ${(totalSize / 1024 / 1024).toFixed(1)}MB. Please select a folder under 50MB.`,
                        variant: "destructive"
                    });
                    setIsFileLoading(false);
                    return;
                }

                // Process files with progress feedback
                toast({
                    title: "Processing folder...",
                    description: `Reading ${filteredFiles.length} files...`
                });

                for (const file of filteredFiles) {
                    try {
                        const content = await file.text();
                        folderFiles.push({
                            path: (file as File & { webkitRelativePath?: string }).webkitRelativePath ?? file.name,
                            language: inferLanguageFromFilename(file.name),
                            size: file.size ?? null,
                            content
                        });
                    } catch (err) {
                        console.warn(`Failed to read file ${file.name}:`, err);
                    }
                }
            }

            if (folderFiles.length === 0) {
                toast({
                    title: "Upload failed",
                    description: "Could not read any files from the folder/zip",
                    variant: "destructive"
                });
                setIsFileLoading(false);
                return;
            }

            const cache: Record<string, ProjectFile> = {};
            folderFiles.forEach(f => { if (f.content) cache[f.path] = f; });

            setProject({
                summary: { name: folderName, description: `Local: ${folderName}`, source: "uploaded", language: null },
                files: folderFiles
            });
            setFileCache(cache);
            setUploadedFolderName(folderName);

            const first = folderFiles.find(f => f.content);
            if (first) {
                setSelectedFile(first.path);
                const explanation = generateW3SchoolsFileExplanation(first.path, first.content || "", skillLevel);
                setChatMessages([{ role: 'model', content: explanation }]);
            }

            toast({
                title: isZipUpload ? "ZIP archive uploaded successfully" : "Folder uploaded successfully",
                description: `Loaded ${folderFiles.length} file(s) from ${folderName}`
            });
        } catch (error) {
            console.error("Upload error:", error);
            toast({
                title: "Upload failed",
                description: error instanceof Error ? error.message : "Failed to process folder",
                variant: "destructive"
            });
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
            const next = await fetchRepositoryProject(repoUrl.trim(), token);
            setProject(next);
            if (next.files.length > 0) setSelectedFile(next.files[0].path);
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
                if (fetched.content) {
                    updateStaticAnalysis(path, fetched.content);
                }
                const explanation = generateW3SchoolsFileExplanation(path, fetched.content || "", skillLevel);
                setChatMessages([{ role: 'model', content: explanation }]);
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
        uploadedFolderName,
        folderInputRef,
        handleFolderInputChange,
        processUploadedFiles,
        handleAnalyze,
        handleFileSelect
    };
};
