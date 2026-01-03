import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Session } from '@supabase/supabase-js';

/**
 * AuthCallback Component
 * Handles OAuth redirect from Supabase after user authentication.
 * This page is called by Supabase with the auth code/state in URL params.
 */
export const AuthCallback = () => {
        const navigate = useNavigate();
        const { toast } = useToast();

        useEffect(() => {
                const handleCallback = async () => {
                        try {
                                // Supabase automatically handles the callback when the user is redirected here
                                // The session is established by the Supabase client
                                const { data: { session }, error } = await supabase.auth.getSession();

                                if (error) {
                                        toast({
                                                title: 'Authentication Error',
                                                description: error.message,
                                                variant: 'destructive',
                                        });
                                        navigate('/auth');
                                        return;
                                }

                                if (session) {
                                        // Persist GitHub token
                                        const { provider_token: providerToken } = session as Session & { provider_token?: string };
                                        if (providerToken) {
                                                const { error: profileError } = await supabase
                                                        .from('profiles')
                                                        .upsert({
                                                                id: session.user.id,
                                                                email: session.user.email,
                                                                github_access_token: providerToken,
                                                        }, { onConflict: 'id' })
                                                        .select()
                                                        .single();

                                                if (profileError) {
                                                        console.error('Error saving GitHub token:', profileError);
                                                        // Don't block login on this error, but log it
                                                }
                                        }

                                        toast({
                                                title: 'Success',
                                                description: 'You have been authenticated successfully!',
                                        });
                                        // Redirect to home page or dashboard
                                        navigate('/');
                                } else {
                                        toast({
                                                title: 'Authentication Failed',
                                                description: 'No session found. Please try again.',
                                                variant: 'destructive',
                                        });
                                        navigate('/auth');
                                }
                        } catch (error) {
                                const errorMessage = error instanceof Error ? error.message : 'An error occurred';
                                toast({
                                        title: 'Error',
                                        description: errorMessage,
                                        variant: 'destructive',
                                });
                                navigate('/auth');
                        }
                };

                handleCallback();
        }, [navigate, toast]);

        return (
                <div className="min-h-screen flex items-center justify-center">
                        <div className="text-center">
                                <h1 className="text-2xl font-bold mb-4">Completing authentication...</h1>
                                <p className="text-gray-600">Please wait while we complete your authentication.</p>
                        </div>
                </div>
        );
};

export default AuthCallback;
