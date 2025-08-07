
import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useRateLimiting } from "@/hooks/security/useRateLimiting";
import { useSecurityEventLogger } from "@/hooks/security/useSecurityEventLogger";
import TitleUpdater from "@/components/TitleUpdater";

const RequestPasswordResetPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const { toast } = useToast();
  const { checkRateLimit, logAuthAttempt, isRateLimited } = useRateLimiting();
  const { logSecurityEvent } = useSecurityEventLogger();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      // Check rate limiting for password reset attempts
      const canProceed = await checkRateLimit(email, 'password_reset', { 
        maxAttempts: 3, 
        timeWindow: '1 hour' 
      });
      
      if (!canProceed) {
        setError("Too many password reset attempts. Please wait 1 hour before trying again.");
        await logSecurityEvent('account_lockout', 'high', { 
          email, 
          reason: 'password_reset_rate_limit_exceeded' 
        });
        return;
      }

      // Log password reset attempt
      await logSecurityEvent('password_reset_attempt', 'low', { email });

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (resetError) {
        await logAuthAttempt(email, 'password_reset', false);
        await logSecurityEvent('password_reset_failure', 'medium', { 
          email, 
          errorMessage: resetError.message 
        });
        throw resetError;
      }

      await logAuthAttempt(email, 'password_reset', true);
      await logSecurityEvent('password_reset_success', 'low', { email });

      setMessage("If an account exists for this email, a password reset link has been sent.");
      toast({
        title: "Check your email",
        description: "A password reset link has been sent to your email address.",
      });
      setEmail(""); // Clear email field after successful request
    } catch (error: any) {
      console.error("Password reset request error:", error);
      setError(error.message || "Failed to send password reset email. Please try again.");
      toast({
        title: "Error",
        description: error.message || "Failed to send password reset email.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <TitleUpdater title="Reset Password" />
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {message && (
              <Alert variant="default">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
            {isRateLimited && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Too many password reset attempts. Please wait 1 hour before trying again.
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
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>
            <Button variant="ghost" asChild className="w-full">
              <Link to="/auth">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
              </Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default RequestPasswordResetPage;
