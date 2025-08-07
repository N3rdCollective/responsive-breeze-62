
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Session } from "@supabase/supabase-js";
import TitleUpdater from "@/components/TitleUpdater";

const UpdatePasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setSession(session);
        // Clear the hash from the URL
        window.history.replaceState(null, "", window.location.pathname);
      } else if (event === "SIGNED_IN" && session?.user && window.location.hash.includes('type=recovery')) {
        // This handles the case where the user is already signed in but clicked the recovery link
        setSession(session);
         window.history.replaceState(null, "", window.location.pathname);
      }
    });
    
    // Check initial session in case the event was missed (e.g. page refresh)
    // This typically happens if the user is on the page and refreshes.
    // The PASSWORD_RECOVERY event might have fired before this component mounted.
    // The URL will contain #access_token=...&type=recovery
    if (window.location.hash.includes('type=recovery')) {
        supabase.auth.getSession().then(({ data }) => {
            if (data.session) {
                setSession(data.session);
                // Clear the hash from the URL
                window.history.replaceState(null, "", window.location.pathname);
            } else {
                 setError("Invalid or expired password reset link. Please request a new one.");
            }
        });
    }


    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) throw updateError;

      setMessage("Your password has been successfully updated. You can now log in with your new password.");
      toast({
        title: "Password Updated",
        description: "Your password has been successfully updated.",
      });
      setTimeout(() => navigate("/auth"), 3000); // Redirect to login after a delay
    } catch (error: any) {
      console.error("Password update error:", error);
      setError(error.message || "Failed to update password. The reset link may be invalid or expired. Please try again.");
      toast({
        title: "Error",
        description: error.message || "Failed to update password.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!session && !window.location.hash.includes('type=recovery')) {
     // If there's no session and no recovery hash, it means the user landed here directly or link is invalid/expired
     // after initial checks.
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid Link</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This password reset link is invalid or has expired. Please request a new one.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <a href="/auth">Back to Login</a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <TitleUpdater title="Update Password" />
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Set New Password</CardTitle>
          <CardDescription>
            Enter your new password below.
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
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !!message} // Disable if message means success
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default UpdatePasswordPage;
