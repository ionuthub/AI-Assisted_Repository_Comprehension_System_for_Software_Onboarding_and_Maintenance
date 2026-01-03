import { create } from 'zustand';
import { Project, ProjectFile } from '@/types/project';
import { SkillLevel, SKILL_LEVELS, TabMode, TAB_MODES } from '@/constants/appConstants';
import { ChatMessage } from '@/types/chat';

interface ProjectState {
    // Navigation & Mode
    mode: TabMode;
    setMode: (mode: TabMode) => void;

    // Project Data
    project: Project | null;
    setProject: (project: Project | null) => void;
    fileCache: Record<string, ProjectFile>;
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
    /**
     * Sets the current tab mode (Github, Generate, Upload).
     * @param mode - The new mode to switch to.
     */
    setMode: (mode) => set({ mode }),

    project: null,
    setProject: (project) => set({ project }),
    fileCache: {},
    /**
     * Sets the entire file cache.
     * @param fileCache - The new file cache object.
     */
    setFileCache: (fileCache) => set({ fileCache }),
    /**
     * Updates/Adds a single file to the cache.
     * @param path - File path as key.
     * @param file - File object.
     */
    updateFileCache: (path, file) => set((state) => {
        // Simple size limit to prevent memory bloat
        const MAX_FILES = 100;
        const currentFiles = state.fileCache;

        // If adding a new file and cache is full
        if (Object.keys(currentFiles).length >= MAX_FILES && !currentFiles[path]) {
            // NOTE: This uses a simple mechanism where the 'first' key is removed.
            // In JavaScript objects, this often correlates to insertion order for string keys,
            // but is not strict LRU. Sufficient for maintaining a bounded cache size here.
            const [firstKey] = Object.keys(currentFiles);
            const { [firstKey]: _, ...rest } = currentFiles;
            return { fileCache: { ...rest, [path]: file } };
        }

        return {
            fileCache: { ...state.fileCache, [path]: file }
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

    /**
     * Resets the file selection state (lines).
     */
    resetSelection: () => set({
        selectedLine: null,
        selectedLines: new Set(),
    }),
}));

export const selectSelectedFile = (state: ProjectState) => state.selectedFile;
export const selectChatMessages = (state: ProjectState) => state.chatMessages;
export const selectProject = (state: ProjectState) => state.project;
export const selectIsLoading = (state: ProjectState) => state.isLoading;

