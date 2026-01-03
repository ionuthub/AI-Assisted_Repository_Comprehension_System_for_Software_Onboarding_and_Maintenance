import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Session } from '@supabase/supabase-js';

interface OAuthState {
    isLoading: boolean;
    isAuthenticated: boolean;
    user: any | null;
    error: string | null;
}

export const useSupabaseOAuth = () => {
    const [state, setState] = useState<OAuthState>({
          isLoading: true,
          isAuthenticated: false,
          user: null,
          error: null,
    });

    const { toast } = useToast();

    // Initialize session on mount
    useEffect(() => {
          const initializeAuth = async () => {
                  try {
                            const { data: { session }, error } = await supabase.auth.getSession();

                    if (error) {
                                setState(prev => ({
                                              ...prev,
                                              error: error.message,
                                              isLoading: false,
                                }));
                                return;
                    }

                    if (session?.user) {
                                setState({
                                              isLoading: false,
                                              isAuthenticated: true,
                                              user: session.user,
                                              error: null,
                                });
                    } else {
                                setState(prev => ({
                                              ...prev,
                                              isLoading: false,
                                }));
                    }
                  } catch (err) {
                            const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
                            setState({
                                        isLoading: false,
                                        isAuthenticated: false,
                                        user: null,
                                        error: errorMessage,
                            });
                  }
          };

                  initializeAuth();

                  // Listen for auth state changes
                  const { data: { subscription } } = supabase.auth.onAuthStateChange(
                          (event, session) => {
                                    if (session?.user) {
                                                setState({
                                                              isLoading: false,
                                                              isAuthenticated: true,
                                                              user: session.user,
                                                              error: null,
                                                });
                                    } else {
                                                setState({
                                                              isLoading: false,
                                                              isAuthenticated: false,
                                                              user: null,
                                                              error: null,
                                                });
                                    }
                          }
                        );

                  return () => {
                          subscription?.unsubscribe();
                  };
    }, []);

    // Sign in with GitHub OAuth
    const signInWithGitHub = async () => {
          setState(prev => ({ ...prev, isLoading: true, error: null }));
          try {
                  const { error } = await supabase.auth.signInWithOAuth({
                            provider: 'github',
                            options: {
                                        redirectTo: `${window.location.origin}/auth/callback`,
                                        scopes: 'repo user email',
                            },
                  });

            if (error) {
                      const errorMessage = error.message || 'GitHub authentication failed';
                      setState(prev => ({
                                  ...prev,
                                  isLoading: false,
                                  error: errorMessage,
                      }));
                      toast({
                                  title: 'Authentication Error',
                                  description: errorMessage,
                                  variant: 'destructive',
                      });
            }
          } catch (err) {
                  const errorMessage = err instanceof Error ? err.message : 'Unexpected error';
                  setState(prev => ({
                            ...prev,
                            isLoading: false,
                            error: errorMessage,
                  }));
                  toast({
                            title: 'Error',
                            description: errorMessage,
                            variant: 'destructive',
                  });
          }
    };

    // Sign out
    const signOut = async () => {
          setState(prev => ({ ...prev, isLoading: true }));
          try {
                  const { error } = await supabase.auth.signOut();
                  if (error) throw error;

            setState({
                      isLoading: false,
                      isAuthenticated: false,
                      user: null,
                      error: null,
            });
                  toast({
                            title: 'Success',
                            description: 'Successfully signed out',
                  });
          } catch (err) {
                  const errorMessage = err instanceof Error ? err.message : 'Sign out failed';
                  setState(prev => ({
                            ...prev,
                            isLoading: false,
                            error: errorMessage,
                  }));
                  toast({
                            title: 'Error',
                            description: errorMessage,
                            variant: 'destructive',
                  });
          }
    };

    // Get GitHub access token
    const getGitHubToken = async (): Promise<string | null> => {
          try {
                  const { data: { session } } = await supabase.auth.getSession();
                  if (!session) return null;

            // The provider token is available in the session
            const providerToken = (session as Session & { provider_token?: string }).provider_token;
                  return providerToken || null;
          } catch (err) {
                  console.error('Failed to get GitHub token:', err);
                  return null;
          }
    };

    // Refresh session
    const refreshSession = async () => {
          setState(prev => ({ ...prev, isLoading: true }));
          try {
                  const { data: { session }, error } = await supabase.auth.refreshSession();
                  if (error) throw error;

            if (session?.user) {
                      setState({
                                  isLoading: false,
                                  isAuthenticated: true,
                                  user: session.user,
                                  error: null,
                      });
            }
          } catch (err) {
                  const errorMessage = err instanceof Error ? err.message : 'Session refresh failed';
                  setState(prev => ({
                            ...prev,
                            isLoading: false,
                            error: errorMessage,
                  }));
          }
    };

    return {
          ...state,
          signInWithGitHub,
          signOut,
          getGitHubToken,
          refreshSession,
    };
};
