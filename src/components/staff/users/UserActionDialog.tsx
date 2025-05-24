
import React from 'react';
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
import { User } from '@/hooks/admin/useUserManagement';

interface UserActionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  action: 'suspend' | 'ban' | 'unban' | null;
  user: User | null;
  reason: string;
  onReasonChange: (reason: string) => void;
  onConfirm: () => void;
  isConfirmDisabled: boolean;
}

const UserActionDialog: React.FC<UserActionDialogProps> = ({
  isOpen,
  onOpenChange,
  action,
  user,
  reason,
  onReasonChange,
  onConfirm,
  isConfirmDisabled,
}) => {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {action === 'suspend' && 'Suspend User'}
            {action === 'ban' && 'Ban User'}
            {action === 'unban' && 'Restore User Access'}
          </DialogTitle>
          <DialogDescription>
            {action === 'suspend' && `Temporarily suspend ${user.display_name} from the community.`}
            {action === 'ban' && `Permanently ban ${user.display_name} from the community.`}
            {action === 'unban' && `Restore ${user.display_name}'s access to the community.`}
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
            <Label htmlFor="reason" className="text-sm">Reason for action</Label>
            <Textarea
              id="reason"
              placeholder={`Enter reason for ${action === 'unban' ? 'restoring' : action}...`}
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              className="min-h-[80px]"
            />
            {reason.trim().length === 0 && <p className="text-xs text-red-500">A reason is required.</p>}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant={action === 'unban' ? 'default' : 'destructive'}
            onClick={onConfirm}
            disabled={isConfirmDisabled}
          >
            {action === 'suspend' && 'Confirm Suspension'}
            {action === 'ban' && 'Confirm Ban'}
            {action === 'unban' && 'Confirm Restoration'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserActionDialog;

