import { describe, it, expect, beforeEach } from 'vitest';
import { useProjectStore } from './useProjectStore';
import { TAB_MODES, SKILL_LEVELS } from '@/constants/appConstants';
import { ChatMessage } from '@/types/chat';

describe('useProjectStore', () => {
    // Reset store before each test
    beforeEach(() => {
        useProjectStore.setState({
            mode: TAB_MODES.GITHUB,
            selectedFile: null,
            chatMessages: [],
            skillLevel: SKILL_LEVELS.BEGINNER,
            project: null
        });
    });

    it('should have initial state', () => {
        const state = useProjectStore.getState();
        expect(state.mode).toBe(TAB_MODES.GITHUB);
        expect(state.skillLevel).toBe(SKILL_LEVELS.BEGINNER);
    });

    it('should set mode', () => {
        useProjectStore.getState().setMode(TAB_MODES.UPLOAD);
        expect(useProjectStore.getState().mode).toBe(TAB_MODES.UPLOAD);
    });

    it('should select file', () => {
        useProjectStore.getState().setSelectedFile('/src/test.ts');
        expect(useProjectStore.getState().selectedFile).toBe('/src/test.ts');
    });

    it('should update chat messages', () => {
        const message: ChatMessage = { role: 'user', content: 'test' };
        useProjectStore.getState().setChatMessages([message]);
        expect(useProjectStore.getState().chatMessages).toHaveLength(1);
        expect(useProjectStore.getState().chatMessages[0]).toEqual(message);
    });

    it('should update file cache', () => {
        const file = { path: 'test.ts', content: 'content' };
        useProjectStore.getState().updateFileCache('test.ts', file);
        expect(useProjectStore.getState().fileCache['test.ts']).toEqual(file);
    });

    it('should reset selection', () => {
        useProjectStore.getState().setSelectedLine(5);
        useProjectStore.getState().setSelectedLines(new Set([1, 2]));

        useProjectStore.getState().resetSelection();

        const state = useProjectStore.getState();
        expect(state.selectedLine).toBeNull();
        expect(state.selectedLines.size).toBe(0);
    });
});
