import { useState, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useStaffPermissions } from '@/hooks/staff/useStaffPermissions';

export interface UserManagementUser {
  id: string;
  email: string;
  username: string;
  display_name: string;
  status: 'active' | 'suspended' | 'banned';
  role: 'user' | 'moderator' | 'admin';
  created_at: string;
  last_active: string | null;
  profile_picture: string | null;
  forum_post_count: number;
  timeline_post_count: number;
  pending_report_count: number;
}

// Export User as an alias for backward compatibility
export type User = UserManagementUser;

export const useUserManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { hasPermission, validateAction } = useStaffPermissions();
  
  // Use React Query for optimized data fetching
  const {
    data: users = [],
    isLoading: loading,
    error,
    refetch: refetchUsers
  } = useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<UserManagementUser[]> => {
      console.log('[useUserManagement] Fetching users from database');
      
      // Check permission before fetching
      if (!hasPermission('user.view')) {
        const canView = await validateAction('view', 'user');
        if (!canView) {
          throw new Error('Insufficient permissions to view user data');
        }
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          username,
          display_name,
          status,
          role,
          created_at,
          last_active,
          profile_picture,
          forum_post_count,
          timeline_post_count,
          pending_report_count
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[useUserManagement] Error fetching users:', error);
        throw new Error(`Failed to fetch users: ${error.message}`);
      }

      console.log(`[useUserManagement] Successfully fetched ${data?.length || 0} users`);
      return data as UserManagementUser[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (replaces cacheTime)
    retry: 2,
    retryDelay: 1000,
    enabled: true, // Always enabled, permission check is inside queryFn
  });

  // Memoized search function
  const searchUsers = useCallback((
    userList: UserManagementUser[],
    searchTerm: string,
    filterStatus: string,
    filterRole: string
  ): UserManagementUser[] => {
    if (!userList || userList.length === 0) return [];
    
    return userList.filter(user => {
      const statusMatch = filterStatus === 'all' || user.status === filterStatus;
      const roleMatch = filterRole === 'all' || user.role === filterRole;
      
      const searchLower = searchTerm.toLowerCase().trim();
      const searchMatch = !searchTerm || 
        user.email?.toLowerCase().includes(searchLower) ||
        user.username?.toLowerCase().includes(searchLower) ||
        user.display_name?.toLowerCase().includes(searchLower);
      
      return statusMatch && roleMatch && searchMatch;
    });
  }, []);

  // Optimized user status update with permission validation
  const updateUserStatus = useCallback(async (
    userId: string,
    status: UserManagementUser['status'],
    reason: string,
    actionType: 'suspend' | 'ban' | 'unban'
  ): Promise<boolean> => {
    if (!userId || !status || !reason.trim()) {
      toast({
        title: "Invalid Input",
        description: "User ID, status, and reason are required",
        variant: "destructive"
      });
      return false;
    }

    console.log(`[useUserManagement] Updating user ${userId} status to ${status}`);
    
    try {
      // Server-side permission validation
      const canPerform = await validateAction(actionType, 'user', userId);
      if (!canPerform) {
        toast({
          title: "Permission Denied",
          description: `You don't have permission to ${actionType} users.`,
          variant: "destructive"
        });
        return false;
      }

      // Optimistic update
      queryClient.setQueryData(['users'], (oldUsers: UserManagementUser[] | undefined) => {
        if (!oldUsers) return oldUsers;
        return oldUsers.map(user => 
          user.id === userId 
            ? { ...user, status }
            : user
        );
      });

      // Update user status in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ status })
        .eq('id', userId);

      if (updateError) {
        console.error('[useUserManagement] Database update failed:', updateError);
        // Rollback optimistic update
        queryClient.setQueryData(['users'], (oldUsers: UserManagementUser[] | undefined) => {
          if (!oldUsers) return oldUsers;
          return oldUsers.map(user => 
            user.id === userId 
              ? { ...user, status: user.status === status ? 'active' : user.status }
              : user
          );
        });
        throw new Error(`Failed to update user status: ${updateError.message}`);
      }

      // Log the action in user_actions table
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        const { error: actionError } = await supabase
          .from('user_actions')
          .insert({
            user_id: userId,
            action_type: actionType,
            reason,
            moderator_id: currentUser.id
          });

        if (actionError) {
          console.warn('[useUserManagement] Failed to log action:', actionError);
        }
      }

      const actionName = actionType === 'suspend' ? 'suspended' : 
                         actionType === 'ban' ? 'banned' : 'restored';
      
      toast({
        title: "User Updated",
        description: `User has been ${actionName} successfully`,
      });

      console.log(`[useUserManagement] User ${userId} status updated successfully`);
      return true;

    } catch (error: any) {
      console.error('[useUserManagement] Error updating user status:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update user status",
        variant: "destructive"
      });
      return false;
    }
  }, [queryClient, toast, validateAction]);

  // Optimized send message function with permission validation
  const sendUserMessage = useCallback(async (
    userId: string,
    subject: string,
    content: string
  ): Promise<boolean> => {
    if (!userId || !subject.trim() || !content.trim()) {
      toast({
        title: "Invalid Input",
        description: "User ID, subject, and content are required",
        variant: "destructive"
      });
      return false;
    }

    console.log(`[useUserManagement] Sending message to user ${userId}`);
    
    try {
      // Server-side permission validation
      const canMessage = await validateAction('message', 'user', userId);
      if (!canMessage) {
        toast({
          title: "Permission Denied",
          description: "You don't have permission to send messages to users.",
          variant: "destructive"
        });
        return false;
      }

      // Get current staff member
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        throw new Error('Not authenticated as staff member');
      }

      // Insert message into user_messages table (using correct field names)
      const { error: messageError } = await supabase
        .from('user_messages')
        .insert({
          recipient_id: userId,
          sender_id: currentUser.id,
          subject: subject.trim(),
          message: content.trim(),
          message_type: 'admin',
          is_read: false
        });

      if (messageError) {
        console.error('[useUserManagement] Message send failed:', messageError);
        throw new Error(`Failed to send message: ${messageError.message}`);
      }

      toast({
        title: "Message Sent",
        description: "Message has been sent to the user successfully",
      });

      console.log(`[useUserManagement] Message sent successfully to user ${userId}`);
      return true;

    } catch (error: any) {
      console.error('[useUserManagement] Error sending message:', error);
      toast({
        title: "Send Failed", 
        description: error.message || "Failed to send message",
        variant: "destructive"
      });
      return false;
    }
  }, [toast, validateAction]);

  // Optimized refresh function
  const refreshUsers = useCallback(async () => {
    console.log('[useUserManagement] Manually refreshing users');
    try {
      await refetchUsers();
      console.log('[useUserManagement] Users refreshed successfully');
    } catch (error) {
      console.error('[useUserManagement] Error refreshing users:', error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh user data",
        variant: "destructive"
      });
    }
  }, [refetchUsers, toast]);

  // Memoized error message
  const errorMessage = useMemo(() => {
    if (!error) return null;
    return error instanceof Error ? error.message : 'An unknown error occurred';
  }, [error]);

  return {
    users: users as UserManagementUser[],
    loading,
    error: errorMessage,
    updateUserStatus,
    sendUserMessage,
    refreshUsers,
    searchUsers,
  };
};

// Export type for external use
export type { UserManagementUser };
