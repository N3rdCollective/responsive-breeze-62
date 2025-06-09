
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { User } from "@/hooks/admin/useUserManagement";

interface UserActionDialogProps {
  isOpen: boolean;
  action: 'suspend' | 'ban' | 'unban' | 'warn' | null;
  user: User | null;
  reason: string;
  onReasonChange: (reason: string) => void;
  onConfirm: () => void;
  onClose: () => void;
  isLoading: boolean;
}

const UserActionDialog: React.FC<UserActionDialogProps> = ({
  isOpen,
  action,
  user,
  reason,
  onReasonChange,
  onConfirm,
  onClose,
  isLoading,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="capitalize">
            {action} User
          </DialogTitle>
          <DialogDescription>
            {action === 'suspend' && `Temporarily suspend ${user?.display_name}.`}
            {action === 'ban' && `Permanently ban ${user?.display_name}.`}
            {action === 'unban' && `Restore access for ${user?.display_name}.`}
            {action === 'warn' && `Send a warning to ${user?.display_name}.`}
          </DialogDescription>
        </DialogHeader>
        {user && (
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
              <Label htmlFor="action-reason">Reason for action</Label>
              <Textarea
                id="action-reason"
                placeholder={`Enter reason for ${action}...`}
                value={reason}
                onChange={(e) => onReasonChange(e.target.value)}
                className="min-h-[80px]"
                disabled={isLoading}
              />
              {reason.trim().length === 0 && <p className="text-xs text-red-500">A reason is required.</p>}
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            variant={action === 'unban' ? 'default' : 'destructive'}
            onClick={onConfirm}
            disabled={!reason.trim() || isLoading}
          >
            {isLoading ? 'Processing...' : `Confirm ${action ? action.charAt(0).toUpperCase() + action.slice(1) : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserActionDialog;
