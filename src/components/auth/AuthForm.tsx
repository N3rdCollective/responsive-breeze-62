import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AuthErrorAlert from "@/components/auth/AuthErrorAlert";
import AuthFormFields from "@/components/auth/AuthFormFields";
import AuthFormActions from "@/components/auth/AuthFormActions";

interface AuthFormProps {
  onSuccess?: () => void;
  isSignUp: boolean;
  setIsSignUp: (isSignUp: boolean) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onSuccess, isSignUp, setIsSignUp }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    console.log(`AuthForm: Attempting to ${isSignUp ? 'sign up' : 'sign in'} user with email: ${email}`);

    try {
      if (isSignUp) {
        const defaultUsername = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').substring(0, 20);
        const defaultDisplayName = email.split('@')[0];

        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: defaultUsername,
              display_name: defaultDisplayName,
              first_name: null, 
              last_name: null,
              user_role: "user"
            }
          }
        });

        if (signUpError) throw signUpError;
        
        console.log("AuthForm: Sign up response:", data);

        if (data?.user) {
          toast({
            title: "Account created successfully",
            description: "Please check your email for verification. You're now logged in.",
          });
          if (onSuccess) onSuccess();
          navigate("/profile"); 
        } else {
          toast({
            title: "Registration submitted",
            description: "Please check your email for verification instructions to complete your signup.",
            duration: 7000,
          });
          if (onSuccess) onSuccess();
          navigate("/");
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
      console.error("AuthForm: Auth error:", authError);
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