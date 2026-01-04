import { Project } from "@/types/project";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Github, FileCode, ArrowRight, MoreVertical, Trash2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

interface ProjectHistoryProps {
    projects: Project[];
    isLoading: boolean;
    onSelectProject: (project: Project) => void;
    onDeleteProject?: (projectId: string) => void;
}

const ProjectHistory = ({ projects, isLoading, onSelectProject, onDeleteProject }: ProjectHistoryProps) => {
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const handleDeleteConfirm = () => {
        if (deleteId && onDeleteProject) {
            onDeleteProject(deleteId);
            setDeleteId(null);
        }
    };
    if (isLoading) {
        return <div className="text-sm text-muted-foreground animate-pulse">Loading history...</div>;
    }

    if (projects.length === 0) {
        return (
            <div className="mt-8 mb-12 text-center p-8 border border-dashed border-border rounded-xl bg-secondary/20">
                <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                <h3 className="text-sm font-medium text-foreground">No recent projects</h3>
                <p className="text-xs text-muted-foreground mt-1">Generated and analyzed projects will appear here.</p>
            </div>
        );
    }

    return (
        <div className="mt-8 mb-12">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-foreground" />
                Recent Projects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => (
                    <Card
                        key={project.id || project.summary.name}
                        className="group hover:border-primary/50 transition-colors cursor-pointer"
                        onClick={() => onSelectProject(project)}
                    >
                        <CardHeader className="pb-3 relative">
                            <div className="flex justify-between items-start pr-6">
                                <CardTitle className="text-base font-medium truncate">
                                    {project.summary.name}
                                </CardTitle>
                                {project.summary.source === 'github' ? (
                                    <Github className="w-4 h-4 text-muted-foreground shrink-0" />
                                ) : (
                                    <FileCode className="w-4 h-4 text-muted-foreground shrink-0" />
                                )}
                            </div>
                            {onDeleteProject && project.id && (
                                <div className="absolute top-4 right-4" onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-6 w-6 p-0 hover:bg-muted" aria-label={`Options for ${project.summary.name}`}>
                                                <MoreVertical className="h-3 w-3 text-muted-foreground" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                className="text-red-500 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20 cursor-pointer text-xs flex items-center"
                                                onClick={() => setDeleteId(project.id!)}
                                            >
                                                <Trash2 className="mr-2 h-3.5 w-3.5" />
                                                Delete Project
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            )}
                            <CardDescription className="line-clamp-2 text-xs">
                                {project.summary.description || "No description"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
                                <span>{project.files.length} files</span>
                                <Button variant="ghost" size="sm" className="h-6 px-0 hover:bg-transparent hover:text-primary gap-1 group-hover:underline">
                                    Open <ArrowRight className="w-3 h-3" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the project from your database. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-red-500 hover:bg-red-600 text-white"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default ProjectHistory;
