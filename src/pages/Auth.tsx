import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Code2, Github, Mail, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Session } from "@supabase/supabase-js";
import SEO from "@/components/SEO";
import { useSupabaseOAuth } from "@/hooks/useSupabaseOAuth";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  // Add a local check state to prevent flash before redirects
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const { signInWithGitHub, isLoading: isGitHubLoading } = useSupabaseOAuth();

  useEffect(() => {
    // Only listen for auth state changes for navigation
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      setIsCheckingSession(false);
      if (nextSession) {
        navigate("/");
      }
    });


    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

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

        // If signup is successful, show check email screen
        // Note: Supabase might auto-sign in if email confirm is off, 
        // but default is on. The session listener will handle auto-signin.
        setCheckEmail(true);

        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
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

  const handleGitHubAuth = () => {
    signInWithGitHub();
  };

  if (session) {
    return null;
  }

  return (
    <div className="flex items-center justify-center p-4 min-h-[80vh]">
      <SEO
        title={isLogin ? "Sign In" : "Sign Up"}
        description="Connect with your GitHub account to start analyzing repositories and generating code explanations."
      />

      <Card className="w-full max-w-md p-8">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Code2 className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold">AI Code Tutor</h1>
        </div>

        {checkEmail ? (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Check your email</h2>
              <p className="text-muted-foreground">
                We've sent a confirmation link to <span className="font-medium text-foreground">{email}</span>.
                <br />
                Please verify your email to continue.
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setCheckEmail(false);
                setIsLogin(true);
              }}
            >
              Return to Sign In
            </Button>
          </div>
        ) : (
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
              className="w-full h-11"
              onClick={handleGitHubAuth}
              disabled={loading || isGitHubLoading}
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
                  disabled={loading || isGitHubLoading}
                  autoComplete="username"
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading || isGitHubLoading}
                  minLength={6}
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="w-full h-11" disabled={loading || isGitHubLoading}>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Loading...
                  </div>
                ) : (
                  isLogin ? "Sign In" : "Sign Up"
                )}
              </Button>
            </form>

            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary hover:underline"
                disabled={loading || isGitHubLoading}
              >
                {isLogin
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Auth;
