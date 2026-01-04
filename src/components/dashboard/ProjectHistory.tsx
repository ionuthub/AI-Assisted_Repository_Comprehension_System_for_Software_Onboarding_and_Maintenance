import { Project } from "@/types/project";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Github, FileCode, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ProjectHistoryProps {
    projects: Project[];
    isLoading: boolean;
    onSelectProject: (project: Project) => void;
}

const ProjectHistory = ({ projects, isLoading, onSelectProject }: ProjectHistoryProps) => {
    if (isLoading) {
        return <div className="text-sm text-muted-foreground animate-pulse">Loading history...</div>;
    }

    if (projects.length === 0) {
        return null; // Or a nice empty state "Your recent projects will appear here"
    }

    return (
        <div className="mt-8 mb-12">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-foreground" />
                Recent Projects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project, idx) => (
                    <Card
                        key={idx}
                        className="group hover:border-primary/50 transition-colors cursor-pointer"
                        onClick={() => onSelectProject(project)}
                    >
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-base font-medium truncate pr-2">
                                    {project.summary.name}
                                </CardTitle>
                                {project.summary.source === 'github' ? (
                                    <Github className="w-4 h-4 text-muted-foreground" />
                                ) : (
                                    <FileCode className="w-4 h-4 text-muted-foreground" />
                                )}
                            </div>
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
        </div>
    );
};

export default ProjectHistory;
