
import { useState, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { UserManagementUser } from './useUserManagement';

interface ActionDialogState {
  open: boolean;
  action: 'suspend' | 'ban' | 'unban' | null;
  user: UserManagementUser | null;
}

interface MessageDialogState {
  open: boolean;
  user: UserManagementUser | null;
}

type UpdateUserStatusFn = (
  userId: string,
  status: UserManagementUser['status'],
  reason: string,
  actionType: 'suspend' | 'ban' | 'unban'
) => Promise<boolean>;

type SendUserMessageFn = (
  userId: string,
  subject: string,
  content: string
) => Promise<boolean>;

export const useOptimizedUserManagerDialogs = (
  updateUserStatus: UpdateUserStatusFn,
  sendUserMessage: SendUserMessageFn
) => {
  const { toast } = useToast();
  
  // Action dialog state
  const [actionDialog, setActionDialog] = useState<ActionDialogState>({
    open: false,
    action: null,
    user: null,
  });
  
  const [actionReason, setActionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  // Message dialog state
  const [messageDialog, setMessageDialog] = useState<MessageDialogState>({
    open: false,
    user: null,
  });
  
  const [messageSubject, setMessageSubject] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [messageLoading, setMessageLoading] = useState(false);

  // Track users currently being processed to prevent double-actions
  const [usersInProgress, setUsersInProgress] = useState<Set<string>>(new Set());

  // Memoized check for if a user action is in progress
  const isUserActionInProgress = useCallback((userId: string) => {
    return usersInProgress.has(userId);
  }, [usersInProgress]);

  // Action dialog handlers
  const openActionDialog = useCallback((action: 'suspend' | 'ban' | 'unban', user: UserManagementUser) => {
    if (isUserActionInProgress(user.id)) {
      toast({
        title: "Action in Progress",
        description: "Another action is already being performed on this user",
        variant: "destructive"
      });
      return;
    }
    
    setActionDialog({ open: true, action, user });
    setActionReason('');
  }, [isUserActionInProgress, toast]);

  const closeActionDialog = useCallback(() => {
    if (actionLoading) return; // Prevent closing during action
    
    setActionDialog({ open: false, action: null, user: null });
    setActionReason('');
  }, [actionLoading]);

  const handleUserAction = useCallback(async () => {
    const { user, action } = actionDialog;
    
    if (!user || !action || !actionReason.trim()) {
      toast({
        title: "Missing Information",
        description: "A reason is required for this action",
        variant: "destructive"
      });
      return;
    }

    if (isUserActionInProgress(user.id)) {
      toast({
        title: "Action in Progress",
        description: "Another action is already being performed on this user",
        variant: "destructive"
      });
      return;
    }

    setActionLoading(true);
    setUsersInProgress(prev => new Set(prev).add(user.id));

    try {
      let targetStatus: UserManagementUser['status'];
      
      switch (action) {
        case 'suspend':
          targetStatus = 'suspended';
          break;
        case 'ban':
          targetStatus = 'banned';
          break;
        case 'unban':
          targetStatus = 'active';
          break;
        default:
          throw new Error('Invalid action type');
      }

      const success = await updateUserStatus(user.id, targetStatus, actionReason.trim(), action);

      if (success) {
        setActionDialog({ open: false, action: null, user: null });
        setActionReason('');
      }
    } catch (error) {
      console.error('[useOptimizedUserManagerDialogs] Error in user action:', error);
      toast({
        title: "Action Failed",
        description: "Failed to perform user action. Please try again.",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
      setUsersInProgress(prev => {
        const newSet = new Set(prev);
        newSet.delete(user.id);
        return newSet;
      });
    }
  }, [actionDialog, actionReason, updateUserStatus, toast, isUserActionInProgress]);

  // Message dialog handlers
  const openMessageDialog = useCallback((user: UserManagementUser) => {
    setMessageDialog({ open: true, user });
    setMessageSubject('');
    setMessageContent('');
  }, []);

  const closeMessageDialog = useCallback(() => {
    if (messageLoading) return; // Prevent closing during send
    
    setMessageDialog({ open: false, user: null });
    setMessageSubject('');
    setMessageContent('');
  }, [messageLoading]);

  const handleSendMessage = useCallback(async () => {
    const { user } = messageDialog;
    
    if (!user || !messageSubject.trim() || !messageContent.trim()) {
      toast({
        title: "Missing Information",
        description: "Subject and message content are required",
        variant: "destructive"
      });
      return;
    }

    setMessageLoading(true);

    try {
      const success = await sendUserMessage(user.id, messageSubject.trim(), messageContent.trim());

      if (success) {
        setMessageDialog({ open: false, user: null });
        setMessageSubject('');
        setMessageContent('');
      }
    } catch (error) {
      console.error('[useOptimizedUserManagerDialogs] Error sending message:', error);
      toast({
        title: "Send Failed",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setMessageLoading(false);
    }
  }, [messageDialog, messageSubject, messageContent, sendUserMessage, toast]);

  // Memoized return object to prevent unnecessary re-renders
  return useMemo(() => ({
    // Action dialog
    actionDialog,
    actionReason,
    actionLoading,
    setActionReason,
    openActionDialog,
    closeActionDialog,
    handleUserAction,
    
    // Message dialog
    messageDialog,
    messageSubject,
    messageContent,
    messageLoading,
    setMessageSubject,
    setMessageContent,
    openMessageDialog,
    closeMessageDialog,
    handleSendMessage,
    
    // Utility
    isUserActionInProgress,
  }), [
    actionDialog,
    actionReason,
    actionLoading,
    openActionDialog,
    closeActionDialog,
    handleUserAction,
    messageDialog,
    messageSubject,
    messageContent,
    messageLoading,
    openMessageDialog,
    closeMessageDialog,
    handleSendMessage,
    isUserActionInProgress,
  ]);
};
