
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthErrorAlert from "@/components/auth/AuthErrorAlert";
import AuthFormFields from "@/components/auth/AuthFormFields";
import AuthFormActions from "@/components/auth/AuthFormActions";

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
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              user_role: "user" // explicitly set default role
            }
          }
        });

        if (signUpError) throw signUpError;
        
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
          } catch (profileCreationError) {
            console.error("Error creating initial profile:", profileCreationError);
            // Don't throw, continue with signup flow
          }
          
          // Redirect user after successful sign up to profile page to complete their profile
          navigate("/profile");
        }
      } else {
        // Sign in process
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

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
    } catch (authError: any) {
      console.error("Auth error:", authError);
      setError(authError.message || "An unexpected error occurred");
      
      toast({
        title: "Authentication failed",
        description: authError.message || "There was a problem with authentication",
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
          <AuthHeader isSignUp={isSignUp} />
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <AuthErrorAlert error={error} />
            <AuthFormFields
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              isSignUp={isSignUp}
              isLoading={isLoading}
            />
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <AuthFormActions
              isLoading={isLoading}
              isSignUp={isSignUp}
              setIsSignUp={setIsSignUp}
            />
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AuthPage;
