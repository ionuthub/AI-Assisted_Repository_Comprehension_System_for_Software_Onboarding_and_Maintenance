import { Project } from "@/types/project";

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

export const generateDependencyGraph = (project: Project) => {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    project.files.forEach((file) => {
        nodes.push({
            id: file.path,
            label: file.path.split('/').pop() || file.path,
            type: 'file',
        });

        if (file.content) {
            // Very simple regex-based import detection
            const importMatches = file.content.matchAll(/(?:import|from)\s+['"]([^'"]+)['"]/g);
            for (const match of importMatches) {
                const importPath = match[1];

                // Try to match the import path to a file in the project
                // This is a naive implementation that looks for sub-string matches
                const targetFile = project.files.find(f =>
                    f.path === importPath ||
                    f.path.includes(importPath.replace(/^\.\//, ''))
                );

                if (targetFile && targetFile.path !== file.path) {
                    edges.push({
                        id: `${file.path}->${targetFile.path}`,
                        source: file.path,
                        target: targetFile.path,
                    });
                }
            }
        }
    });

    return { nodes, edges };
};
