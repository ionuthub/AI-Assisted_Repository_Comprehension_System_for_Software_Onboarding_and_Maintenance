import React, { useState } from 'react';
import { FolderNode } from '@/lib/repositoryScanner';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileCode2,
  FileText,
  FileJson,
  Settings,
  Terminal,
  FileCode
} from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface FolderTreeProps {
  tree: FolderNode;
  selectedFile: string | null;
  onFileSelect: (path: string) => void;
}

const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const lowerName = fileName.toLowerCase();

  if (['package.json', 'package-lock.json', 'tsconfig.json', 'bun.lockb', 'next.config.js', 'vite.config.ts', 'tailwind.config.js'].includes(lowerName)) {
    return <Settings className="w-3.5 h-3.5 text-muted-foreground shrink-0" aria-hidden="true" />;
  }
  if (ext === 'json') return <FileJson className="w-3.5 h-3.5 text-muted-foreground shrink-0" aria-hidden="true" />;
  if (ext === 'md' || ext === 'txt') return <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" aria-hidden="true" />;
  if (['yml', 'yaml', 'toml', 'ini', 'env', 'gitignore'].includes(ext || '')) return <Settings className="w-3.5 h-3.5 text-muted-foreground shrink-0" aria-hidden="true" />;
  if (['sh', 'bash', 'bat', 'cmd'].includes(ext || '')) return <Terminal className="w-3.5 h-3.5 text-muted-foreground shrink-0" aria-hidden="true" />;
  if (['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'h', 'cs', 'go', 'rs', 'rb', 'php', 'swift', 'kt', 'vue', 'svelte'].includes(ext || '')) {
    return <FileCode className="w-3.5 h-3.5 text-muted-foreground shrink-0" aria-hidden="true" />;
  }
  return <FileCode2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" aria-hidden="true" />;
};

const formatSize = (bytes?: number) => {
  if (bytes === undefined || bytes === null) return '';
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
};

interface TreeNodeProps {
  node: FolderNode;
  selectedFile: string | null;
  onFileSelect: (path: string) => void;
  depth: number;
}

const TreeNode = ({ node, selectedFile, onFileSelect, depth }: TreeNodeProps) => {
  const isFolder = node.type === 'folder';
  const [isOpen, setIsOpen] = useState(depth <= 1);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFolder) setIsOpen(!isOpen);
    else onFileSelect(node.path);
  };

  const isSelected = selectedFile === node.path;

  return (
    <div className="flex flex-col select-none">
      <button
        type="button"
        aria-expanded={isFolder ? isOpen : undefined}
        aria-current={!isFolder && isSelected ? 'true' : undefined}
        onClick={handleClick}
        className={`focus-ring w-full flex items-center justify-between py-1.5 px-2 rounded-sm text-left transition-colors ${
          isSelected
            ? 'bg-primary/10 text-primary font-semibold'
            : 'hover:bg-secondary/60 text-muted-foreground hover:text-foreground'
        }`}
        style={{ paddingLeft: `${Math.max(8, depth * 14 + 8)}px` }}
      >
        <span className="flex items-center gap-1.5 truncate min-w-0">
          {isFolder ? (
            <>
              <span className="shrink-0" aria-hidden="true">
                {isOpen ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
              </span>
              <span className="shrink-0" aria-hidden="true">
                {isOpen ? <FolderOpen className="w-3.5 h-3.5 text-muted-foreground" /> : <Folder className="w-3.5 h-3.5 text-muted-foreground" />}
              </span>
            </>
          ) : (
            <>
              <span className="w-3 shrink-0" aria-hidden="true" />
              {getFileIcon(node.name)}
            </>
          )}
          <span className="truncate text-ui font-mono">{node.name}</span>
        </span>

        {!isFolder && node.size !== undefined && (
          <span className="text-meta text-foreground-dim shrink-0 ml-2 font-mono">
            {formatSize(node.size)}
          </span>
        )}
      </button>

      {isFolder && isOpen && node.children && (
        <div className="flex flex-col border-l border-border ml-[11px] mt-0.5">
          {node.children.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              selectedFile={selectedFile}
              onFileSelect={onFileSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const FolderTree = ({ tree, selectedFile, onFileSelect }: FolderTreeProps) => {
  return (
    <div className="h-full flex flex-col p-4 bg-background/50">
      <div className="text-meta font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-4 pl-1">
        Project explorer
      </div>
      <ScrollArea className="flex-1 -mx-2 px-2">
        <div aria-label="Repository files" className="space-y-0.5">
          {tree.children && tree.children.length > 0 ? (
            tree.children.map((child) => (
              <TreeNode
                key={child.path}
                node={child}
                selectedFile={selectedFile}
                onFileSelect={onFileSelect}
                depth={0}
              />
            ))
          ) : (
            <p className="text-ui text-muted-foreground italic text-center py-4">No files found</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default FolderTree;
