import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Project, ProjectSummary, ProjectFile } from "@/types/project";
import { useSupabaseOAuth } from "./useSupabaseOAuth";
import { Json } from "@/integrations/supabase/types";

export const useProjects = () => {
    const { isAuthenticated, user } = useSupabaseOAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    const fetchProjects = async () => {
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
                        source: row.project_type as any || 'generated',
                        language: row.language,
                        owner: null, // Not always stored perfectly, potentially inferred
                        repo: null,
                    },
                    files: (row.files as unknown as ProjectFile[]) || [],
                    // We might want to store the ID to allow deleting/updating later
                    id: row.id
                } as unknown as Project));
                // Casting strict Project type for now, we might need to extend Project type with ID

                setProjects(mappedProjects);
            }
        } catch (error) {
            console.error("Error fetching project history:", error);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, [isAuthenticated, user]);

    return { projects, isLoadingHistory, refreshHistory: fetchProjects };
};
