
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
import { useAuth } from "@/hooks/useAuth";

const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/profile");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    console.log(`Attempting to ${isSignUp ? 'sign up' : 'sign in'} user with email: ${email}`);

    try {
      if (isSignUp) {
        // Sign up process
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              user_role: "user" // explicitly set default role
            }
          }
        });

        if (error) throw error;
        
        console.log("Sign up response:", data);

        if (data?.user) {
          toast({
            title: "Account created successfully",
            description: "You have been successfully registered and logged in.",
          });
          
          // Create initial profile immediately to avoid potential issues later
          try {
            const defaultUsername = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
            
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                username: defaultUsername,
                display_name: "New User",
                role: "user",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
              
            if (profileError) {
              console.error("Failed to create initial profile:", profileError);
              // Don't throw, continue with signup flow
            } else {
              console.log("Initial profile created successfully");
            }
          } catch (profileErr) {
            console.error("Error creating initial profile:", profileErr);
            // Don't throw, continue with signup flow
          }
          
          // Redirect user after successful sign up to profile page to complete their profile
          navigate("/profile");
        }
      } else {
        // Sign in process
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data?.user) {
          console.log("Sign in successful:", data.user);
          toast({
            title: "Welcome back!",
            description: "You have been successfully logged in.",
          });
          // Redirect to profile page (members area) after sign in
          navigate("/profile");
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      setError(error.message || "An unexpected error occurred");
      
      toast({
        title: "Authentication failed",
        description: error.message || "There was a problem with authentication",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">
            {isSignUp ? "Create an account" : "Welcome back"}
          </CardTitle>
          <CardDescription>
            {isSignUp
              ? "Sign up to join our music community"
              : "Sign in to your account"}
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

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isSignUp ? "Creating account..." : "Signing in..."}
                </>
              ) : (
                isSignUp ? "Sign Up" : "Sign In"
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AuthPage;
