
import React from "react";
import { Button } from "@/components/ui/button";

interface AuthFormActionsProps {
  isLoading: boolean;
  isSignUp: boolean;
  setIsSignUp: (isSignUp: boolean) => void;
}

const AuthFormActions: React.FC<AuthFormActionsProps> = ({
  isLoading,
  isSignUp,
  setIsSignUp,
}) => {
  return (
    <>
      <Button type="submit" disabled={isLoading} className="w-full h-11 text-base">
        {isLoading ? (
          <span>Loading...</span>
        ) : isSignUp ? (
          "Create Account"
        ) : (
          "Sign In"
        )}
      </Button>
      <div className="text-center mt-4">
        <Button
          type="button"
          variant="link"
          className="text-sm p-0 h-auto"
          onClick={() => setIsSignUp(!isSignUp)}
        >
          {isSignUp
            ? "Already have an account? Sign in"
            : "Don't have an account? Sign up"}
        </Button>
      </div>
    </>
  );
};

export default AuthFormActions;
