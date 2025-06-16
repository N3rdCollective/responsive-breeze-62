
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useRateLimiting } from "@/hooks/security/useRateLimiting";
import { useSecurityEventLogger } from "@/hooks/security/useSecurityEventLogger";
import { EnhancedSignupForm } from "@/components/auth/EnhancedSignupForm";
import { Link } from "react-router-dom";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { checkRateLimit, logAuthAttempt, isRateLimited } = useRateLimiting();
  const { logSecurityEvent } = useSecurityEventLogger();

  console.log("Auth component render - isSignUp:", isSignUp);

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Check rate limiting
      const canProceed = await checkRateLimit(email, 'login');
      if (!canProceed) {
        setError("Too many login attempts. Please wait 15 minutes before trying again.");
        await logSecurityEvent('account_lockout', 'high', { 
          email, 
          reason: 'rate_limit_exceeded' 
        });
        return;
      }

      // Log login attempt
      await logSecurityEvent('login_attempt', 'low', { email });

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        await logAuthAttempt(email, 'login', false);
        await logSecurityEvent('login_failure', 'medium', { 
          email, 
          errorMessage: signInError.message 
        });
        throw signInError;
      }

      if (data?.user) {
        await logAuthAttempt(email, 'login', true);
        await logSecurityEvent('login_success', 'low', { email });
        
        toast({
          title: "Welcome back!",
          description: "You have been successfully logged in.",
        });
        navigate("/");
      }
    } catch (error: any) {
      console.error("Sign In error:", error);
      setError(error.message);
      toast({
        title: "Sign In Failed",
        description: error.message || "Could not sign you in.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const switchToSignUp = () => {
    console.log("Switching to sign up mode");
    setIsSignUp(true);
    setError("");
    setEmail("");
    setPassword("");
  };

  const switchToSignIn = () => {
    console.log("Switching to sign in mode");
    setIsSignUp(false);
    setError("");
  };

  if (isSignUp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <EnhancedSignupForm onSwitchToSignIn={switchToSignIn} />
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>

        <form onSubmit={handleSignInSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isRateLimited && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Account temporarily locked due to multiple failed attempts. Please wait 15 minutes.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading || isRateLimited}
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
                disabled={isLoading || isRateLimited}
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || isRateLimited}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            <div className="flex flex-col space-y-2 w-full">
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={switchToSignUp}
                disabled={isLoading}
              >
                Don't have an account? Sign up
              </Button>
              
              <Button variant="ghost" asChild className="w-full">
                <Link to="/request-password-reset">
                  Forgot your password?
                </Link>
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Auth;
