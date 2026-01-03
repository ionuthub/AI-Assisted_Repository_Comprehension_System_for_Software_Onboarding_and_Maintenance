
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

export const useGitHubAuth = () => {
    const [hasGitHubToken, setHasGitHubToken] = useState(false);
    const [githubToken, setGithubToken] = useState<string | null>(null);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);
    const [manualGithubToken, setManualGithubToken] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const checkAuth = async () => {
            setIsLoadingAuth(true);
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    setHasGitHubToken(false);
                    return;
                }

                // Try to get token from profiles
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('github_access_token')
                    .eq('id', session.user.id)
                    .maybeSingle();

                let token = profile?.github_access_token ?? null;

                // Sync with provider token if missing
                if (!token) {
                    const { provider_token: providerToken } = session as Session & { provider_token?: string };
                    if (providerToken) {
                        const { data: updatedProfile, error: upsertError } = await supabase
                            .from('profiles')
                            .upsert({
                                id: session.user.id,
                                email: session.user.email,
                                github_access_token: providerToken,
                            }, { onConflict: 'id' })
                            .select('github_access_token')
                            .single();

                        if (!upsertError) {
                            token = updatedProfile?.github_access_token ?? providerToken;
                        }
                    }
                }

                if (token) {
                    setGithubToken(token);
                    setHasGitHubToken(true);
                } else {
                    setHasGitHubToken(false);
                }
            } catch (error) {
                console.error("Auth check failed:", error);
                setHasGitHubToken(false);
            } finally {
                setIsLoadingAuth(false);
            }
        };

        checkAuth();
    }, [toast]);

    return { hasGitHubToken, githubToken, isLoadingAuth, manualGithubToken, setManualGithubToken };
};
