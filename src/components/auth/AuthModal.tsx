import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import AuthForm from "@/components/auth/AuthForm";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ open, onOpenChange }) => {
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSuccess = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] w-[95vw] max-h-[90vh] overflow-y-auto bg-card p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {isSignUp ? "Create an account" : "Welcome back"}
          </DialogTitle>
          <DialogDescription>
            {isSignUp
              ? "Sign up to join our music community"
              : "Sign in to your account"}
          </DialogDescription>
        </DialogHeader>
        <AuthForm 
          onSuccess={handleSuccess} 
          isSignUp={isSignUp}
          setIsSignUp={setIsSignUp}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;