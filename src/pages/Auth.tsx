import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Code2, Github, Lock, Zap, FolderGit2 } from "lucide-react";
import { Session } from "@supabase/supabase-js";
import SEO from "@/components/SEO";
import { useSupabaseOAuth } from "@/hooks/useSupabaseOAuth";
import { useState } from "react";

const Auth = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);

  const { signInWithGitHub, isLoading: isGitHubLoading } = useSupabaseOAuth();

  useEffect(() => {
    // Listen for auth state changes for navigation
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      if (nextSession) {
        navigate("/");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleGitHubAuth = () => {
    signInWithGitHub();
  };

  if (session) {
    return null;
  }

  return (
    <div className="flex items-center justify-center p-4 min-h-[80vh]">
      <SEO
        title="Sign In"
        description="Connect with your GitHub account to start analyzing repositories and generating code explanations."
      />

      <Card className="w-full max-w-md p-8">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Code2 className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold">AI Code Tutor</h1>
        </div>

        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-xl font-semibold">Welcome</h2>
            <p className="text-sm text-muted-foreground">
              Sign in with GitHub to unlock all features
            </p>
          </div>

          <Button
            className="w-full h-12 bg-sky-600 hover:bg-sky-700 text-white"
            onClick={handleGitHubAuth}
            disabled={isGitHubLoading}
          >
            {isGitHubLoading ? (
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Connecting...
              </div>
            ) : (
              <>
                <Github className="w-5 h-5 mr-2" />
                Continue with GitHub
              </>
            )}
          </Button>

          <div className="bg-secondary/30 rounded-lg p-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Why GitHub?
            </p>
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-sm">
                <Lock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span className="text-muted-foreground">Access private repositories securely</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <FolderGit2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span className="text-muted-foreground">Save your project history</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Zap className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span className="text-muted-foreground">Instant analysis and explanations</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            By signing in, you agree to our{" "}
            <a href="/terms" className="text-primary hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
