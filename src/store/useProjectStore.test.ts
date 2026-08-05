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

// Regression: the file cache is keyed by path alone, and setProject did not clear it. The two
// study repositories are a matched pair, so they deliberately share paths — src/types/domain.ts
// exists in both. Switching repositories therefore served the previous repository's file
// contents under the new repository's file name. No prior test drove a second setProject with
// an overlapping path, which is why 109 passing tests said nothing about it.
describe('file cache across a project switch', () => {
    const projectFor = (repo: string, domainContent: string) => ({
        summary: { name: repo, description: null, source: 'github' as const, language: 'TypeScript', owner: 'ionuthub', repo, branch: 'main' },
        files: [
            { path: 'src/types/domain.ts', content: domainContent, language: 'typescript', size: null, rawUrl: null },
            { path: 'src/main.tsx', content: 'export const x = 1;', language: 'typescript', size: null, rawUrl: null },
        ],
    });

    it('discards cached file contents when the project changes', () => {
        useProjectStore.getState().setProject(projectFor('clinic-triage', 'export type ReferralType = "urgent";'));
        useProjectStore.getState().updateFileCache('src/types/domain.ts', {
            path: 'src/types/domain.ts',
            content: 'export type ReferralType = "urgent";',
            language: 'typescript',
            size: null,
            rawUrl: null,
        });
        expect(useProjectStore.getState().fileCache['src/types/domain.ts']?.content).toContain('ReferralType');

        useProjectStore.getState().setProject(projectFor('warehouse-dispatch', 'export type DispatchZone = "north";'));

        // The cache must be empty, not merely different: a stale entry at a shared path is
        // what displayed clinic-triage's ReferralType under the warehouse-dispatch header.
        expect(useProjectStore.getState().fileCache).toEqual({});
        expect(useProjectStore.getState().fileCacheOrder).toEqual([]);
    });

    it('never serves the previous repository content at a shared path', () => {
        useProjectStore.getState().setProject(projectFor('clinic-triage', 'export type ReferralType = "urgent";'));
        useProjectStore.getState().updateFileCache('src/types/domain.ts', {
            path: 'src/types/domain.ts',
            content: 'export type ReferralType = "urgent";',
            language: 'typescript',
            size: null,
            rawUrl: null,
        });

        useProjectStore.getState().setProject(projectFor('warehouse-dispatch', 'export type DispatchZone = "north";'));

        // handleFileSelect returns early on a cache hit, so a surviving entry here is served
        // verbatim to the code viewer without any refetch.
        const cached = useProjectStore.getState().fileCache['src/types/domain.ts'];
        expect(cached?.content ?? '').not.toContain('ReferralType');
    });

    it('clears the cache when the project is unset', () => {
        useProjectStore.getState().setProject(projectFor('clinic-triage', 'export type ReferralType = "urgent";'));
        useProjectStore.getState().updateFileCache('src/types/domain.ts', {
            path: 'src/types/domain.ts', content: 'x', language: 'typescript', size: null, rawUrl: null,
        });

        useProjectStore.getState().setProject(null);

        expect(useProjectStore.getState().fileCache).toEqual({});
    });
});
