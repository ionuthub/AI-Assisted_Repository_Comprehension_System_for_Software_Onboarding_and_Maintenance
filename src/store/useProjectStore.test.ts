import { describe, it, expect, beforeEach } from 'vitest';
import { useProjectStore } from './useProjectStore';
import { TAB_MODES } from '@/constants/appConstants';

describe('useProjectStore', () => {
    // Reset store before each test
    beforeEach(() => {
        useProjectStore.setState({
            mode: TAB_MODES.GITHUB,
            selectedFile: null,
            project: null
        });
    });

    it('should have initial state', () => {
        const state = useProjectStore.getState();
        expect(state.mode).toBe(TAB_MODES.GITHUB);
        expect(state.selectedFile).toBeNull();
    });

    it('should set mode', () => {
        useProjectStore.getState().setMode(TAB_MODES.GITHUB);
        expect(useProjectStore.getState().mode).toBe(TAB_MODES.GITHUB);
    });

    it('should select file', () => {
        useProjectStore.getState().setSelectedFile('/src/test.ts');
        expect(useProjectStore.getState().selectedFile).toBe('/src/test.ts');
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
