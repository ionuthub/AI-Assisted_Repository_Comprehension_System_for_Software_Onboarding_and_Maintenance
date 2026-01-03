import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    Node,
    Edge,
    Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Project } from '@/types/project';
import { generateDependencyGraph } from '@/lib/graphUtils';
import { useMemo } from 'react';
import { Card } from './ui/card';
import { GitBranch } from 'lucide-react';

interface DependencyGraphProps {
    project: Project;
    onFileSelect?: (path: string) => void;
}

const DependencyGraph = ({ project, onFileSelect }: DependencyGraphProps) => {
    const { nodes: graphNodes, edges: graphEdges } = useMemo(() => generateDependencyGraph(project), [project]);

    const onNodeClick = (_: React.MouseEvent, node: Node) => {
        if (onFileSelect) {
            onFileSelect(node.id);
        }
    };

    const nodes: Node[] = graphNodes.map((node, idx) => ({
        id: node.id,
        data: { label: node.label },
        position: { x: (idx % 5) * 200, y: Math.floor(idx / 5) * 150 },
        style: {
            background: '#3b82f6',
            color: '#fff',
            borderRadius: '8px',
            padding: '10px',
            fontSize: '12px',
            width: 150,
            textAlign: 'center' as const
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
    }));

    const edges: Edge[] = graphEdges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        animated: true,
        style: { stroke: '#3b82f6' },
    }));

    return (
        <Card className="h-[500px] border-border bg-card/50 backdrop-blur overflow-hidden group">
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-background/80 px-3 py-1.5 rounded-full border border-border shadow-sm">
                <GitBranch className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold">Architecture Map</span>
            </div>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodeClick={onNodeClick}
                fitView
                className="bg-transparent"
            >
                <Background gap={20} size={1} />
                <Controls />
                <MiniMap
                    nodeColor="#3b82f6"
                    maskColor="rgba(0,0,0,0.1)"
                    className="bg-background/80 border border-border rounded-lg"
                />
            </ReactFlow>
        </Card>
    );
};

export default DependencyGraph;
