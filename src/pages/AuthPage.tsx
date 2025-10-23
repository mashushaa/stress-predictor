import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkUser();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log('[AUTH] Starting authentication process', { isSignUp, email });

    try {
      if (isSignUp) {
        console.log('[AUTH] Attempting sign up...');
        const redirectTo = `${window.location.origin}/`;
        console.log('[AUTH] Redirect URL:', redirectTo);
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectTo
          }
        });

        console.log('[AUTH] Sign up response:', { data, error });

        if (error) {
          console.error('[AUTH] Sign up error:', error);
          toast({
            title: "Registration error",
            description: error.message,
            variant: "destructive",
          });
        } else {
          console.log('[AUTH] Sign up successful');
          toast({
            title: "Registration completed",
            description: "Check email to confirm the account",
          });
        }
      } else {
        console.log('[AUTH] Attempting sign in...');
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        console.log('[AUTH] Sign in response:', { data, error });

        if (error) {
          console.error('[AUTH] Sign in error:', error);
          toast({
            title: "Log in error",
            description: error.message,
            variant: "destructive",
          });
        } else {
          console.log('[AUTH] Sign in successful');
          toast({
            title: "Log in successful",
            description: "Welcome!",
          });
          navigate("/");
        }
      }
    } catch (error: any) {
      console.error('[AUTH] Unexpected error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      console.log('[AUTH] Authentication process ended');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {isSignUp ? "Sign Up" : "Log In"}
          </CardTitle>
          <CardDescription className="text-center">
            {isSignUp 
              ? "Create an account to preserve the results" 
              : "Log in to your account"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSignUp ? "Sign Up" : "Log In"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-blue-600 hover:underline"
            >
              {isSignUp 
                ? "Already have an account? Log In" 
                : "No account? Sign Up"
              }
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
