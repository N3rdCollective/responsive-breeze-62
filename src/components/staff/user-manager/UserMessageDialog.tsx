
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { UserManagementUser } from "@/hooks/admin/useUserManagement";

interface UserMessageDialogProps {
  isOpen: boolean;
  user: UserManagementUser | null;
  subject: string;
  content: string;
  onSubjectChange: (subject: string) => void;
  onContentChange: (content: string) => void;
  onSend: () => void;
  onClose: () => void;
  isLoading: boolean;
}

const UserMessageDialog: React.FC<UserMessageDialogProps> = ({
  isOpen,
  user,
  subject,
  content,
  onSubjectChange,
  onContentChange,
  onSend,
  onClose,
  isLoading,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Send Message to {user?.display_name}</DialogTitle>
          <DialogDescription>
            Compose an administrative message to @{user?.username}.
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
              <Label htmlFor="message-subject">Subject</Label>
              <Input
                id="message-subject"
                value={subject}
                onChange={(e) => onSubjectChange(e.target.value)}
                placeholder="Message subject"
                disabled={isLoading}
              />
              {subject.trim().length === 0 && <p className="text-xs text-red-500">Subject is required.</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="message-content">Message</Label>
              <Textarea
                id="message-content"
                value={content}
                onChange={(e) => onContentChange(e.target.value)}
                placeholder="Write your message..."
                className="min-h-[100px]"
                disabled={isLoading}
              />
              {content.trim().length === 0 && <p className="text-xs text-red-500">Message content is required.</p>}
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={onSend}
            disabled={!subject.trim() || !content.trim() || isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Message'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserMessageDialog;
