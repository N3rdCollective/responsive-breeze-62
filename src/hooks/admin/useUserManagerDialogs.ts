
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/hooks/admin/useUserManagement";

export const useUserManagerDialogs = (
  updateUserStatus: (userId: string, status: User['status'], reason: string, actionType: 'suspend' | 'ban' | 'unban') => Promise<boolean>,
  sendUserMessage: (userId: string, subject: string, content: string) => Promise<boolean>
) => {
  const { toast } = useToast();
  
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

  // Action dialog handlers
  const openActionDialog = useCallback((action: 'suspend' | 'ban' | 'unban' | 'warn', user: User) => {
    setActionReason('');
    setActionDialog({ open: true, action, user });
  }, []);

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

    setActionLoading(true);
    try {
      let newStatus: User['status'] = 'active';
      if (actionDialog.action === 'suspend') newStatus = 'suspended';
      if (actionDialog.action === 'ban') newStatus = 'banned';
      if (actionDialog.action === 'unban') newStatus = 'active';
      
      const success = await updateUserStatus(
        actionDialog.user.id, 
        newStatus, 
        actionReason, 
        actionDialog.action as 'suspend' | 'ban' | 'unban'
      );
      
      if (success) {
        closeActionDialog();
        toast({
          title: "User action completed",
          description: `User ${actionDialog.user.display_name} has been ${actionDialog.action === 'unban' ? 'restored' : actionDialog.action + 'ed'}. Reason: ${actionReason}`,
        });
      }
    } catch (error) {
      console.error("Error performing user action:", error);
      toast({
        title: "Error",
        description: "Failed to complete user action. Please try again.",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  }, [actionDialog, actionReason, actionLoading, updateUserStatus, toast, closeActionDialog]);

  // Message dialog handlers
  const openMessageDialog = useCallback((user: User) => {
    setMessageSubject('');
    setMessageContent('');
    setMessageDialog({ open: true, user });
  }, []);

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
    
    setMessageLoading(true);
    try {
      const success = await sendUserMessage(messageDialog.user.id, messageSubject, messageContent);
      
      if (success) {
        closeMessageDialog();
        toast({
          title: "Message sent",
          description: `Your message has been sent to ${messageDialog.user.display_name}.`,
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setMessageLoading(false);
    }
  }, [messageDialog, messageSubject, messageContent, messageLoading, sendUserMessage, toast, closeMessageDialog]);

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
  };
};
