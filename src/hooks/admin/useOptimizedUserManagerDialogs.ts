
import { useState, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/hooks/admin/useUserManagement";
import { useUserActionStates } from "./useUserActionStates";

export const useOptimizedUserManagerDialogs = (
  updateUserStatus: (userId: string, status: User['status'], reason: string, actionType: 'suspend' | 'ban' | 'unban') => Promise<boolean>,
  sendUserMessage: (userId: string, subject: string, content: string) => Promise<boolean>
) => {
  const { toast } = useToast();
  const { setUserActionLoading, setUserActionError, clearUserActionState } = useUserActionStates();
  
  // Action queue to prevent concurrent actions on the same user
  const actionQueueRef = useRef<Set<string>>(new Set());
  
  // Action dialog state
  const [actionDialog, setActionDialog] = useState({
    open: false,
    action: null as 'suspend' | 'ban' | 'unban' | 'warn' | null,
    user: null as User | null
  });
  const [actionReason, setActionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  // Message dialog state
  const [messageDialog, setMessageDialog] = useState({
    open: false,
    user: null as User | null
  });
  const [messageSubject, setMessageSubject] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [messageLoading, setMessageLoading] = useState(false);

  // Check if user action is in progress
  const isUserActionInProgress = useCallback((userId: string) => {
    return actionQueueRef.current.has(userId);
  }, []);

  // Action dialog handlers
  const openActionDialog = useCallback((action: 'suspend' | 'ban' | 'unban' | 'warn', user: User) => {
    if (isUserActionInProgress(user.id)) {
      toast({
        title: "Action in Progress",
        description: "Please wait for the current action to complete",
        variant: "destructive"
      });
      return;
    }
    setActionReason('');
    setActionDialog({ open: true, action, user });
  }, [isUserActionInProgress, toast]);

  const closeActionDialog = useCallback(() => {
    setActionDialog({ open: false, action: null, user: null });
    setActionReason('');
  }, []);

  const handleUserAction = useCallback(async () => {
    if (!actionDialog.user || !actionDialog.action || actionLoading) return;
    if (!actionReason.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a reason for this action",
        variant: "destructive"
      });
      return;
    }

    const userId = actionDialog.user.id;
    
    // Check if action already in progress
    if (actionQueueRef.current.has(userId)) {
      console.log(`⚠️ Action already in progress for user ${userId}`);
      return;
    }

    // Add to action queue
    actionQueueRef.current.add(userId);
    setActionLoading(true);
    setUserActionLoading(userId, actionDialog.action, true);

    console.log(`🔄 Starting ${actionDialog.action} action for user ${userId} with reason: ${actionReason}`);

    try {
      let newStatus: User['status'] = 'active';
      if (actionDialog.action === 'suspend') newStatus = 'suspended';
      if (actionDialog.action === 'ban') newStatus = 'banned';
      if (actionDialog.action === 'unban') newStatus = 'active';
      
      console.log(`📝 Calling updateUserStatus with status: ${newStatus}, action: ${actionDialog.action}`);
      
      const success = await updateUserStatus(
        userId, 
        newStatus, 
        actionReason, 
        actionDialog.action as 'suspend' | 'ban' | 'unban'
      );
      
      if (success) {
        console.log(`✅ User action completed successfully for ${userId}`);
        closeActionDialog();
        clearUserActionState(userId);
        toast({
          title: "User action completed",
          description: `User ${actionDialog.user.display_name} has been ${actionDialog.action === 'unban' ? 'restored' : actionDialog.action + 'ed'}`,
        });
      } else {
        console.error(`❌ User action failed for ${userId}`);
        setUserActionError(userId, "Action failed");
        toast({
          title: "Action Failed",
          description: "The user action could not be completed. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("❌ Error performing user action:", error);
      setUserActionError(userId, "Action failed");
      toast({
        title: "Error",
        description: "Failed to complete user action. Please try again.",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
      actionQueueRef.current.delete(userId);
    }
  }, [actionDialog, actionReason, actionLoading, updateUserStatus, toast, closeActionDialog, setUserActionLoading, setUserActionError, clearUserActionState]);

  // Message dialog handlers
  const openMessageDialog = useCallback((user: User) => {
    if (isUserActionInProgress(user.id)) {
      toast({
        title: "Action in Progress",
        description: "Please wait for the current action to complete",
        variant: "destructive"
      });
      return;
    }
    setMessageSubject('');
    setMessageContent('');
    setMessageDialog({ open: true, user });
  }, [isUserActionInProgress, toast]);

  const closeMessageDialog = useCallback(() => {
    setMessageDialog({ open: false, user: null });
    setMessageSubject('');
    setMessageContent('');
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!messageDialog.user || messageLoading) return;
    if (!messageSubject.trim() || !messageContent.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in both subject and message",
        variant: "destructive"
      });
      return;
    }

    const userId = messageDialog.user.id;
    
    // Check if action already in progress
    if (actionQueueRef.current.has(userId)) {
      return;
    }

    // Add to action queue
    actionQueueRef.current.add(userId);
    setMessageLoading(true);
    setUserActionLoading(userId, 'message', true);
    
    try {
      const success = await sendUserMessage(userId, messageSubject, messageContent);
      
      if (success) {
        closeMessageDialog();
        clearUserActionState(userId);
        toast({
          title: "Message sent",
          description: `Your message has been sent to ${messageDialog.user.display_name}.`,
        });
      } else {
        setUserActionError(userId, "Message failed to send");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setUserActionError(userId, "Message failed to send");
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setMessageLoading(false);
      actionQueueRef.current.delete(userId);
    }
  }, [messageDialog, messageSubject, messageContent, messageLoading, sendUserMessage, toast, closeMessageDialog, setUserActionLoading, setUserActionError, clearUserActionState]);

  return {
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
    
    // Action state helpers
    isUserActionInProgress
  };
};
