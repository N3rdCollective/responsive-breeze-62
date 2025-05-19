
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface AuthFormActionsProps {
  isLoading: boolean;
  isSignUp: boolean;
  setIsSignUp: (value: boolean | ((prev: boolean) => boolean)) => void;
}

const AuthFormActions: React.FC<AuthFormActionsProps> = ({
  isLoading,
  isSignUp,
  setIsSignUp,
}) => {
  return (
    <>
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
        onClick={() => setIsSignUp(prev => !prev)}
        disabled={isLoading}
      >
        {isSignUp
          ? "Already have an account? Sign in"
          : "Don't have an account? Sign up"}
      </Button>
    </>
  );
};

export default AuthFormActions;
