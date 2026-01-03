import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Code2, Github } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Session } from "@supabase/supabase-js";
import SEO from "@/components/SEO";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const persistGitHubToken = async (authSession: Session) => {
      const { provider_token: providerToken } = authSession as Session & { provider_token?: string };
      if (!providerToken) {
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: authSession.user.id,
          email: authSession.user.email,
          github_access_token: providerToken,
        }, { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        console.error('Error saving GitHub token:', error);
        toast({
          title: "GitHub Sync Failed",
          description: "We could not store your GitHub connection. Please try reconnecting.",
          variant: "destructive",
        });
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);

      if (nextSession) {
        await persistGitHubToken(nextSession);
        navigate("/");
      }
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session) {
        await persistGitHubToken(session);
        navigate("/");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "Successfully signed in",
        });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (error) throw error;

        toast({
          title: "Account created!",
          description: "Welcome to AI Code Tutor",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubAuth = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/`,
          scopes: 'repo read:user',
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  if (session) {
    return null;
  }

  return (
    <div className="flex items-center justify-center p-4">
      <SEO
        title={isLogin ? "Sign In" : "Sign Up"}
        description="Connect with your GitHub account to start analyzing repositories and generating code explanations."
      />

      <Card className="w-full max-w-md p-8">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Code2 className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold">AI Code Tutor</h1>
        </div>

        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-xl font-semibold">
              {isLogin ? "Welcome back" : "Create an account"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isLogin
                ? "Sign in to continue learning"
                : "Start your coding journey today"}
            </p>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleGitHubAuth}
            disabled={loading}
          >
            <Github className="w-4 h-4 mr-2" />
            Continue with GitHub
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
            </Button>
          </form>

          <div className="text-center text-sm">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline"
              disabled={loading}
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
