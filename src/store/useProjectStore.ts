import { create } from 'zustand';
import { Project, ProjectFile } from '@/types/project';
import { SkillLevel, SKILL_LEVELS, TabMode, TAB_MODES } from '@/constants/appConstants';
import { ChatMessage } from '@/types/chat';
import { scanRepository, RepositoryScanResult } from '@/lib/repositoryScanner';
import { analyzeCodeFile, computeWorkspaceReferences, FileAnalysisResult } from '@/lib/staticAnalysis';
import { buildSearchIndex, SearchIndex } from '@/lib/semanticSearch';

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
    skillLevel: SkillLevel;
    setSkillLevel: (level: SkillLevel) => void;
    chatMessages: ChatMessage[];
    setChatMessages: (messages: ChatMessage[]) => void;
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
        let analyses: Record<string, FileAnalysisResult> = {};
        let index: SearchIndex | null = null;
        if (project) {
            const filePaths = project.files.map(f => f.path);
            project.files.forEach(file => {
                if (file.content) {
                    analyses[file.path] = analyzeCodeFile(file.path, file.content, filePaths);
                }
            });
            analyses = computeWorkspaceReferences(analyses);
            index = buildSearchIndex(project.files);
        }

        set({
            project,
            scanResult: project ? scanRepository(project.files) : null,
            staticAnalyses: analyses,
            searchIndex: index
        });
    },
    updateStaticAnalysis: (path, content) => set((state) => {
        if (!state.project) return {};

        const filePaths = state.project.files.map(f => f.path);
        const newAnalyses = { ...state.staticAnalyses };
        newAnalyses[path] = analyzeCodeFile(path, content, filePaths);

        const updatedAnalyses = computeWorkspaceReferences(newAnalyses);

        // Update file inside project files for indexing
        const updatedFiles = state.project.files.map(f =>
            f.path === path ? { ...f, content } : f
        );

        const newIndex = buildSearchIndex(updatedFiles);

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

    skillLevel: SKILL_LEVELS.BEGINNER,
    setSkillLevel: (skillLevel) => set({ skillLevel }),
    chatMessages: [],
    setChatMessages: (chatMessages) => set({ chatMessages }),
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
export const selectChatMessages = (state: ProjectState) => state.chatMessages;
export const selectProject = (state: ProjectState) => state.project;
export const selectIsLoading = (state: ProjectState) => state.isLoading;

