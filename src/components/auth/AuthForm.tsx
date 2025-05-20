
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthErrorAlert from "@/components/auth/AuthErrorAlert";
import AuthFormFields from "@/components/auth/AuthFormFields";
import AuthFormActions from "@/components/auth/AuthFormActions";

interface AuthFormProps {
  onSuccess?: () => void; // Callback to close modal or handle success
}

const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    console.log(`Attempting to ${isSignUp ? 'sign up' : 'sign in'} user with email: ${email}`);

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              user_role: "user"
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
            if (profileError) console.error("Failed to create initial profile:", profileError);
            else console.log("Initial profile created successfully");
          } catch (profileCreationError) {
            console.error("Error creating initial profile:", profileCreationError);
          }
          
          if (onSuccess) onSuccess();
          navigate("/profile");
        }
      } else {
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
          if (onSuccess) onSuccess();
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
    <div className="space-y-1">
      <AuthHeader isSignUp={isSignUp} />
      <form onSubmit={handleSubmit} className="pt-4">
        <div className="space-y-4">
          <AuthErrorAlert error={error} />
          <AuthFormFields
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            isSignUp={isSignUp}
            isLoading={isLoading}
          />
        </div>
        <div className="flex flex-col space-y-4 mt-6">
          <AuthFormActions
            isLoading={isLoading}
            isSignUp={isSignUp}
            setIsSignUp={setIsSignUp}
          />
        </div>
      </form>
    </div>
  );
};

export default AuthForm;
