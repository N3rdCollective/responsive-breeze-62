
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
  const handleSuccess = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] w-[95vw] max-w-[95vw] sm:max-w-[425px] max-h-[95vh] sm:max-h-[90vh] overflow-y-auto bg-card p-4 sm:p-6 mx-auto">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl sm:text-2xl text-center sm:text-left">
            Welcome
          </DialogTitle>
          <DialogDescription className="text-center sm:text-left text-sm sm:text-base">
            Sign in to your account or create a new one
          </DialogDescription>
        </DialogHeader>
        <AuthForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
