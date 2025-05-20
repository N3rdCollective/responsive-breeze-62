
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription, // Added for completeness, though AuthHeader handles titles
} from "@/components/ui/dialog";
import AuthForm from "@/components/auth/AuthForm";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ open, onOpenChange }) => {
  const handleSuccess = () => {
    onOpenChange(false); // Close the modal on successful authentication
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card">
        {/* AuthForm now includes AuthHeader, so we don't need DialogTitle/Description here directly */}
        {/* <DialogHeader> */}
          {/* DialogTitle and DialogDescription are part of AuthHeader now, rendered by AuthForm */}
        {/* </DialogHeader> */}
        <AuthForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
