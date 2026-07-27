import { Project } from "@/types/project";
import { resolveImportPath } from "@/lib/staticAnalysis";

export interface GraphNode {
    id: string;
    label: string;
    type: string;
}

export interface GraphEdge {
    id: string;
    source: string;
    target: string;
}

/**
 * Matches an ES import or re-export and captures the module specifier.
 * Bounded between the keyword and `from` so a stray quoted string later in the file
 * cannot be picked up as a phantom import.
 */
const IMPORT_SOURCE = /^\s*(?:import|export)[\s\S]{0,200}?from\s*['"]([^'"]+)['"]/gm;
/** Side-effect imports carry no bindings and so never reach the `from` clause. */
const BARE_IMPORT_SOURCE = /^\s*import\s+['"]([^'"]+)['"]/gm;

/**
 * Builds the file-level dependency graph.
 *
 * Import targets are resolved with the same resolver the file-analysis layer uses, so the
 * graph and the Insights panel agree. The previous substring matcher resolved no `@/` alias
 * imports at all — leaving the graph near-empty for any repository using path aliases —
 * and matched unrelated files whose paths merely contained the specifier.
 */
export const generateDependencyGraph = (project: Project) => {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const seenEdgeIds = new Set<string>();
    const allFilePaths = project.files.map((f) => f.path);

    project.files.forEach((file) => {
        nodes.push({
            id: file.path,
            label: file.path.split('/').pop() || file.path,
            type: 'file',
        });

        if (!file.content) return;

        const specifiers = new Set<string>();
        for (const match of file.content.matchAll(IMPORT_SOURCE)) specifiers.add(match[1]);
        for (const match of file.content.matchAll(BARE_IMPORT_SOURCE)) specifiers.add(match[1]);

        specifiers.forEach((specifier) => {
            const target = resolveImportPath(file.path, specifier, allFilePaths);
            if (!target || target === file.path) return;

            // Repeated imports of the same module would otherwise emit duplicate ids,
            // which collide as React keys in the graph.
            const id = `${file.path}->${target}`;
            if (seenEdgeIds.has(id)) return;
            seenEdgeIds.add(id);

            edges.push({ id, source: file.path, target });
        });
    });

    return { nodes, edges };
};
