
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { User } from './types'; // User type from the same directory
import { AlertTriangle } from 'lucide-react';

interface WarnUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onConfirmWarning: (userId: string, reason: string) => void; // Callback to handle the warning logic
}

const WarnUserDialog: React.FC<WarnUserDialogProps> = ({
  isOpen,
  onOpenChange,
  user,
  onConfirmWarning,
}) => {
  const [reason, setReason] = useState('');

  useEffect(() => {
    // Reset reason when dialog opens or user changes
    if (isOpen) {
      setReason('');
    }
  }, [isOpen, user]);

  if (!user) {
    // If no user is provided, don't render the dialog content
    // or handle as per specific UI requirements for an empty state.
    return null; 
  }

  const handleConfirm = () => {
    if (reason.trim() && user) {
      onConfirmWarning(user.id, reason);
      // Parent component (StaffUserManager) will be responsible for closing the dialog
      // and showing toast notifications upon successful action.
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
            Warn User: {user.display_name}
          </DialogTitle>
          <DialogDescription>
            Issue an official warning to @{user.username}. This action will be logged. 
            Please provide a clear reason for the warning.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3 p-3 bg-muted/50 dark:bg-muted/20 rounded-lg border">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
              {user.profile_picture ? (
                <img
                  src={user.profile_picture}
                  alt={user.display_name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-lg font-medium text-muted-foreground">
                  {user.display_name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <p className="font-semibold">{user.display_name}</p>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="warning-reason" className="text-right">
              Reason for warning
            </Label>
            <Textarea
              id="warning-reason"
              placeholder={`Enter the reason for warning ${user.display_name}...`}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px]"
            />
            {reason.trim().length === 0 && (
              <p className="text-xs text-destructive pt-1">A reason is required to issue a warning.</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          </DialogClose>
          <Button
            variant="destructive" // Using destructive variant for warnings
            onClick={handleConfirm}
            disabled={!reason.trim()}
          >
            Confirm Warning
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WarnUserDialog;
