
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useStaffPermissions } from '@/hooks/staff/useStaffPermissions';
import { UserAction } from './utils/userTypes';

/**
 * Hook for handling user action-related operations (suspend, ban, etc.)
 * Now with server-side permission validation
 */
export const useUserActions = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { validateAction } = useStaffPermissions();

  // Update user status with server-side validation
  const updateUserStatus = async (userId: string, status: 'active' | 'suspended' | 'banned', reason: string, actionType: 'suspend' | 'ban' | 'unban') => {
    setLoading(true);
    try {
      console.log(`🔄 Attempting to update user ${userId} to status ${status} with reason: ${reason} using action ${actionType}`);
      
      // Map action types to proper permission names
      const permissionMap = {
        'suspend': 'user.suspend',
        'ban': 'user.ban', 
        'unban': 'user.unban'
      };
      
      const permissionName = permissionMap[actionType];
      console.log(`🔐 Checking permission: ${permissionName} for action: ${actionType}`);
      
      // Server-side permission validation first
      const canPerform = await validateAction(actionType, 'user', userId);
      console.log(`✅ Permission validation result: ${canPerform}`);
      
      if (!canPerform) {
        console.error(`❌ Permission denied for action: ${actionType}`);
        toast({
          title: "Permission Denied",
          description: `You don't have permission to ${actionType} users.`,
          variant: "destructive"
        });
        return false;
      }

      console.log(`📝 Updating user status in profiles table...`);
      // Update the user's status in the profiles table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ status: status })
        .eq('id', userId);

      if (updateError) {
        console.error("❌ Error updating user status in DB:", updateError);
        throw updateError;
      }

      console.log(`📋 Logging action in user_actions table...`);
      // Log the action in user_actions table
      const actionLogged = await createUserAction(userId, actionType, reason);
      if (!actionLogged) {
        console.warn(`⚠️ Failed to log action, but user status was updated`);
      }
      
      console.log(`✅ Successfully updated user ${userId} status to ${status}`);
      
      toast({
        title: `User ${status === 'active' ? 'Restored' : status === 'suspended' ? 'Suspended' : 'Banned'}`,
        description: `User status updated to ${status}. Reason: ${reason}`
      });
      return true;
    } catch (err: any) {
      console.error('❌ Error in updateUserStatus:', err);
      toast({
        title: "Error updating user status",
        description: `Could not update user status. ${err.message}`,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Create user action with server-side validation
  const createUserAction = async (
    userId: string, 
    actionType: UserAction['action_type'], 
    reason: string,
    expiresAt?: string
  ): Promise<boolean> => {
    try {
      console.log(`📝 Creating user action log...`);
      // Validate permission to create user actions
      const canCreate = await validateAction('create', 'user_action');
      if (!canCreate) {
        console.error(`❌ No permission to create user actions`);
        return false;
      }

      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        console.error(`❌ No authenticated moderator found`);
        throw new Error('No authenticated moderator found');
      }

      console.log(`📝 Creating user action for ${userId}: ${actionType}. Moderator: ${currentUser.id}`);
      
      // Insert the action into user_actions table
      const { error: insertError } = await supabase
        .from('user_actions')
        .insert({
          user_id: userId,
          action_type: actionType,
          reason,
          moderator_id: currentUser.id, 
          expires_at: expiresAt
        });

      if (insertError) {
        console.error("❌ Error inserting user action:", insertError);
        throw insertError;
      }

      console.log("✅ User action logged successfully");
      return true;
    } catch (err: any) {
      console.error('❌ Error in createUserAction:', err);
      return false;
    }
  };

  // Get user actions history with permission validation
  const getUserActions = async (userId: string): Promise<UserAction[]> => {
    try {
      // Validate permission to view user actions
      const canView = await validateAction('view', 'user', userId);
      if (!canView) {
        console.error(`❌ No permission to view user actions for ${userId}`);
        return [];
      }

      console.log(`🔍 Fetching actions for user ${userId}`);
      
      const { data, error: fetchError } = await supabase
        .from('user_actions')
        .select(`
          id, user_id, action_type, reason, moderator_id, created_at, expires_at,
          moderator:profiles!user_actions_moderator_id_fkey (username, display_name)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error(`❌ Error fetching user actions for ${userId}:`, fetchError);
        throw fetchError;
      }
      
      console.log(`✅ Found ${data?.length || 0} actions for user ${userId}`);
      return (data as UserAction[]) || [];
    } catch (err: any) {
      console.error('❌ Error in getUserActions:', err);
      toast({
        title: "Error Fetching User Actions",
        description: `Could not load actions history. ${err.message}`,
        variant: "destructive"
      });
      return [];
    }
  };

  return {
    updateUserStatus,
    createUserAction,
    getUserActions,
    loading
  };
};
