
import React from 'react';
import { CardTitle, CardDescription } from "@/components/ui/card";

interface AuthHeaderProps {
  isSignUp: boolean;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({ isSignUp }) => {
  return (
    <>
      <CardTitle className="text-2xl">
        {isSignUp ? "Create an account" : "Welcome back"}
      </CardTitle>
      <CardDescription>
        {isSignUp
          ? "Sign up to join our music community"
          : "Sign in to your account"}
      </CardDescription>
    </>
  );
};

export default AuthHeader;
