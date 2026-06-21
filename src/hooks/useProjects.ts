import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Project, ProjectSummary, ProjectFile } from "@/types/project";
import { useSupabaseOAuth } from "./useSupabaseOAuth";
import { Json } from "@/integrations/supabase/types";

export const useProjects = (user: unknown, isAuthenticated: boolean) => {
    const { toast } = useToast();
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    const fetchProjects = useCallback(async () => {
        if (!isAuthenticated || !user) return;

        setIsLoadingHistory(true);
        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                const mappedProjects: Project[] = data.map(row => ({
                    summary: {
                        name: row.name,
                        description: row.description,
                        source: (row.project_type === 'github' || row.project_type === 'generated' || row.project_type === 'uploaded') ? row.project_type : 'generated',
                        language: row.language,
                        owner: null, // Not always stored perfectly, potentially inferred
                        repo: null,
                    },
                    files: (row.files as unknown as ProjectFile[]) || [],
                    // We might want to store the ID to allow deleting/updating later
                    id: row.id
                }));

                setProjects(mappedProjects);
            }
        } catch (error) {
            console.error("Error fetching project history:", error);
        } finally {
            setIsLoadingHistory(false);
        }
    }, [isAuthenticated, user]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const deleteProject = useCallback(async (projectId: string) => {
        try {
            const { error } = await supabase
                .from('projects')
                .delete()
                .eq('id', projectId);

            if (error) throw error;

            // Update local state after successful deletion
            setProjects(prev => prev.filter(p => p.id !== projectId));
            toast({ title: "Project deleted", description: "The project has been permanently removed." });
        } catch (error) {
            console.error("Error deleting project:", error);
            toast({ title: "Delete failed", description: "Could not delete the project. Please try again.", variant: "destructive" });
        }
    }, [toast]);

    return { projects, isLoadingHistory, refreshHistory: fetchProjects, deleteProject };
};
