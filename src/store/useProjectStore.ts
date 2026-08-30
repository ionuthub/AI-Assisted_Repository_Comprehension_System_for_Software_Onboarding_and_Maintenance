import { create } from 'zustand';
import { Project, ProjectFile } from '@/types/project';
import { TabMode, TAB_MODES } from '@/constants/appConstants';
import { scanRepository, RepositoryScanResult } from '@/lib/repositoryScanner';
import { analyzeCodeFile, computeWorkspaceReferences, FileAnalysisResult } from '@/lib/staticAnalysis';
import { buildSearchIndex, SearchIndex } from '@/lib/semanticSearch';
import { recordMetric } from '@/lib/evaluation/metrics';

interface ProjectState {
    // Navigation & Mode
    mode: TabMode;
    setMode: (mode: TabMode) => void;

    // Project Data
    project: Project | null;
    scanResult: RepositoryScanResult | null;
    staticAnalyses: Record<string, FileAnalysisResult>;
    searchIndex: SearchIndex | null;
    setProject: (project: Project | null) => void;
    updateStaticAnalysis: (path: string, content: string) => void;
    fileCache: Record<string, ProjectFile>;
    fileCacheOrder: string[]; // Track access order for LRU
    setFileCache: (cache: Record<string, ProjectFile>) => void;
    updateFileCache: (path: string, file: ProjectFile) => void;

    // Selection
    selectedFile: string | null;
    setSelectedFile: (path: string | null) => void;
    selectedLine: number | null;
    setSelectedLine: (line: number | null) => void;
    selectedLines: Set<number>;
    setSelectedLines: (lines: Set<number>) => void;

    // AI / Explanation
    isExplaining: boolean;
    setIsExplaining: (isExplaining: boolean) => void;

    // Loading States
    isLoading: boolean;
    setIsLoading: (isLoading: boolean) => void;
    isFileLoading: boolean;
    setIsFileLoading: (isFileLoading: boolean) => void;

    // Methods
    resetSelection: () => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
    mode: TAB_MODES.GITHUB,
    setMode: (mode) => set({ mode }),

    project: null,
    scanResult: null,
    staticAnalyses: {},
    searchIndex: null,
    setProject: (project) => {
        // Clearing the current project is the explicit "New repository" action. Reset all
        // repository-specific state, then return to the start route so local page state such
        // as the GitHub URL field is recreated empty rather than carrying the previous URL.
        if (!project) {
            set({
                project: null,
                fileCache: {},
                fileCacheOrder: [],
                scanResult: null,
                staticAnalyses: {},
                searchIndex: null,
                selectedFile: null,
                selectedLine: null,
                selectedLines: new Set(),
                isExplaining: false,
                isLoading: false,
                isFileLoading: false,
            });

            if (typeof window !== 'undefined') {
                window.location.assign('/');
            }
            return;
        }

        let analyses: Record<string, FileAnalysisResult> = {};
        let index: SearchIndex | null = null;
        const filePaths = project.files.map(f => f.path);
        project.files.forEach(file => {
            if (file.content) {
                analyses[file.path] = analyzeCodeFile(file.path, file.content, filePaths);
            }
        });
        analyses = computeWorkspaceReferences(analyses);
        const t0 = performance.now();
        index = buildSearchIndex(project.files);
        recordMetric('indexing', performance.now() - t0, `${project.files.length} files`);

        set({
            project,
            // The file cache is keyed by path alone, so it MUST be discarded whenever the
            // project changes. The two study repositories are a matched pair and therefore
            // share paths deliberately, src/types/domain.ts exists in both. Carrying the
            // cache across a switch served the previous repository's contents under the new
            // repository's file name: clinic-triage's ReferralType displayed as though it
            // were part of warehouse-dispatch.
            //
            // In a study measuring whether participants detect incorrect output, that
            // manufactures the very failure being observed, so it is a validity defect
            // rather than a display glitch. Reloading the page cleared it only because the
            // cache is in-memory with no persistence, which is a workaround a participant
            // has no reason to know about.
            fileCache: {},
            fileCacheOrder: [],
            scanResult: scanRepository(project.files),
            staticAnalyses: analyses,
            searchIndex: index
        });
    },
    updateStaticAnalysis: (path, content) => set((state) => {
        if (!state.project) return {};

        const existing = state.project.files.find(f => f.path === path);
        const contentUnchanged = existing?.content === content;

        // Since ingestion hydrates content up front, opening a file usually supplies the
        // same text the index already holds. Rebuilding then costs a full synchronous pass
        // over every file, a visible freeze during a timed task, and produces an
        // identical index. Only the analysis for this file is refreshed in that case.
        if (contentUnchanged && state.searchIndex) {
            const filePaths = state.project.files.map(f => f.path);
            const analyses = { ...state.staticAnalyses };
            analyses[path] = analyzeCodeFile(path, content, filePaths);
            return { staticAnalyses: computeWorkspaceReferences(analyses) };
        }

        const filePaths = state.project.files.map(f => f.path);
        const newAnalyses = { ...state.staticAnalyses };
        newAnalyses[path] = analyzeCodeFile(path, content, filePaths);

        const updatedAnalyses = computeWorkspaceReferences(newAnalyses);

        const updatedFiles = state.project.files.map(f =>
            f.path === path ? { ...f, content } : f
        );

        const t0 = performance.now();
        const newIndex = buildSearchIndex(updatedFiles);
        recordMetric('reindex', performance.now() - t0, `${updatedFiles.length} files`);

        return {
            staticAnalyses: updatedAnalyses,
            project: {
                ...state.project,
                files: updatedFiles
            },
            searchIndex: newIndex
        };
    }),
    fileCache: {},
    fileCacheOrder: [],

    setFileCache: (fileCache) => set({
        fileCache,
        fileCacheOrder: Object.keys(fileCache)
    }),

    updateFileCache: (path, file) => set((state) => {
        const MAX_FILES = 100;
        const newCache = { ...state.fileCache };
        let newOrder = [...state.fileCacheOrder];

        // If file exists, remove from order (will re-add at end)
        if (newCache[path]) {
            newOrder = newOrder.filter(k => k !== path);
        }

        // Add to cache & order
        newCache[path] = file;
        newOrder.push(path);

        // Evict if over limit
        if (newOrder.length > MAX_FILES) {
            const victim = newOrder.shift(); // Remove oldest (LRU)
            if (victim) {
                delete newCache[victim];
            }
        }

        return {
            fileCache: newCache,
            fileCacheOrder: newOrder
        };
    }),

    selectedFile: null,
    setSelectedFile: (selectedFile) => set({ selectedFile }),
    selectedLine: null,
    setSelectedLine: (selectedLine) => set({ selectedLine }),
    selectedLines: new Set(),
    setSelectedLines: (selectedLines) => set({ selectedLines }),

    // Default to ADVANCED: the artefact targets practising developers performing onboarding
    // and maintenance tasks, and the evaluation study recruits that population. A beginner
    // default answers in analogies, which would confound task time and perceived usefulness.
    isExplaining: false,
    setIsExplaining: (isExplaining) => set({ isExplaining }),

    isLoading: false,
    setIsLoading: (isLoading) => set({ isLoading }),
    isFileLoading: false,
    setIsFileLoading: (isFileLoading) => set({ isFileLoading }),

    resetSelection: () => set({
        selectedLine: null,
        selectedLines: new Set(),
    }),
}));

export const selectSelectedFile = (state: ProjectState) => state.selectedFile;
export const selectProject = (state: ProjectState) => state.project;
export const selectIsLoading = (state: ProjectState) => state.isLoading;
