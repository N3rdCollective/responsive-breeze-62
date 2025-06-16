
import { useState, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useStaffActivityLogger } from '@/hooks/useStaffActivityLogger';

export interface UserManagementUser {
  id: string;
  email: string;
  username: string | null;
  display_name: string | null;
  status: 'active' | 'suspended' | 'banned';
  role: 'user' | 'moderator' | 'admin';
  created_at: string;
  last_active?: string;
  profile_picture?: string | null;
  forum_post_count: number;
  timeline_post_count: number;
  pending_report_count: number;
  forum_signature?: string | null; // Added forum_signature property
}

// Export User as a separate type alias to avoid conflicts
export type User = UserManagementUser;

// Debug utility to track renders and detect infinite loops
let renderCount = 0;
const useRenderCounter = (hookName: string) => {
  renderCount++;
  if (renderCount > 50) {
    console.error(`🚨 INFINITE LOOP DETECTED in ${hookName}! Render count: ${renderCount}`);
    // Reset counter to prevent spam
    renderCount = 0;
  }
  return renderCount;
};

export const useUserManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { logActivity } = useStaffActivityLogger();
  
  // Debug renders to detect infinite loops
  const currentRender = useRenderCounter('useUserManagement');
  console.log(`[useUserManagement] Render #${currentRender}`);
  
  // ✅ FIXED: Proper React Query configuration to prevent infinite loops
  const {
    data: users = [],
    isLoading: loading,
    error,
    refetch: refetchUsers
  } = useQuery<UserManagementUser[], Error>({
    queryKey: ['users'],
    queryFn: async (): Promise<UserManagementUser[]> => {
      console.log('[useUserManagement] Fetching users from database');
      
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
          pending_report_count,
          forum_signature
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[useUserManagement] Error fetching users:', error);
        throw new Error(`Failed to fetch users: ${error.message}`);
      }

      console.log(`[useUserManagement] Successfully fetched ${data?.length || 0} users`);
      
      // Ensure all required fields are present with defaults
      const usersWithDefaults = data?.map(user => ({
        ...user,
        forum_post_count: user.forum_post_count || 0,
        timeline_post_count: user.timeline_post_count || 0,
        pending_report_count: user.pending_report_count || 0,
        forum_signature: user.forum_signature || null,
        email: user.email || 'N/A'
      })) || [];
      
      return usersWithDefaults as UserManagementUser[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1, // ✅ CRITICAL FIX: Limit retries to prevent retry loops
    retryDelay: 1000,
    refetchOnWindowFocus: false, // ✅ CRITICAL FIX: Prevent refetch on window focus
    refetchOnReconnect: false,   // ✅ CRITICAL FIX: Prevent refetch on reconnect
    refetchOnMount: true,        // Only refetch on mount
    
    // ✅ NO onSuccess, onError, or onSettled callbacks that could trigger loops
  });

  // ✅ FIXED: Memoized search function to prevent infinite loops
  const searchUsers = useCallback((
    userList: UserManagementUser[],
    searchTerm: string,
    filterStatus: string,
    filterRole: string
  ): UserManagementUser[] => {
    if (!userList || userList.length === 0) return [];
    
    return userList.filter(user => {
      // Status filter
      const statusMatch = filterStatus === 'all' || user.status === filterStatus;
      
      // Role filter  
      const roleMatch = filterRole === 'all' || user.role === filterRole;
      
      // Search term filter
      const searchLower = searchTerm.toLowerCase().trim();
      const searchMatch = !searchTerm || 
        user.email?.toLowerCase().includes(searchLower) ||
        user.username?.toLowerCase().includes(searchLower) ||
        user.display_name?.toLowerCase().includes(searchLower);
      
      return statusMatch && roleMatch && searchMatch;
    });
  }, []); // ✅ Empty dependencies since this is a pure function

  // ✅ CRITICAL FIX: Optimized user status update function without manual refetch
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
      // First update the user status in the database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.error('[useUserManagement] Database update failed:', updateError);
        throw new Error(`Failed to update user status: ${updateError.message}`);
      }

      // Get current users data for activity logging
      const currentUsers = queryClient.getQueryData<UserManagementUser[]>(['users']) || [];
      const previousStatus = currentUsers.find(u => u.id === userId)?.status;

      // Log the activity
      await logActivity(
        actionType === 'suspend' ? 'suspend_user' : 
        actionType === 'ban' ? 'ban_user' : 'unban_user',
        `User status changed to ${status}. Reason: ${reason}`,
        'user',
        userId,
        { 
          previousStatus,
          newStatus: status,
          reason,
          actionType
        }
      );

      // ✅ CRITICAL FIX: Only do optimistic update, DON'T manually refetch
      queryClient.setQueryData(['users'], (oldUsers: UserManagementUser[] | undefined) => {
        if (!oldUsers) return oldUsers;
        return oldUsers.map(user => 
          user.id === userId 
            ? { ...user, status, updated_at: new Date().toISOString() }
            : user
        );
      });

      // Show success message
      const actionName = actionType === 'suspend' ? 'suspended' : 
                         actionType === 'ban' ? 'banned' : 'unbanned';
      
      toast({
        title: "User Updated",
        description: `User has been ${actionName} successfully`,
      });

      console.log(`[useUserManagement] User ${userId} status updated successfully`);
      
      // ✅ REMOVED: Manual refetch that was causing the infinite loop!
      // DO NOT ADD: await refetchUsers(); // This was the source of the infinite loop
      
      return true;

    } catch (error: any) {
      console.error('[useUserManagement] Error updating user status:', error);
      
      // ✅ FIXED: On error, invalidate cache to refetch from server using correct format
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update user status",
        variant: "destructive"
      });
      return false;
    }
  }, [logActivity, queryClient, toast]); // ✅ FIXED: Removed 'users' dependency to prevent stale closures

  // ✅ FIXED: Optimized send message function without manual refetch
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
      // Get current user (staff member)
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !currentUser) {
        throw new Error('Not authenticated as staff member');
      }

      // Insert message into user_messages table
      const { error: messageError } = await supabase
        .from('user_messages')
        .insert({
          recipient_id: userId,
          sender_id: currentUser.id,
          subject: subject.trim(),
          message: content.trim(),
          created_at: new Date().toISOString(),
          is_read: false
        });

      if (messageError) {
        console.error('[useUserManagement] Message send failed:', messageError);
        throw new Error(`Failed to send message: ${messageError.message}`);
      }

      // Log the activity
      await logActivity(
        'send_user_message',
        `Message sent to user: "${subject}"`,
        'user',
        userId,
        { subject, contentLength: content.length }
      );

      toast({
        title: "Message Sent",
        description: "Message has been sent to the user successfully",
      });

      console.log(`[useUserManagement] Message sent successfully to user ${userId}`);
      
      // ✅ No manual refetch needed for messages
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
  }, [logActivity, toast]); // ✅ Stable dependencies only

  // ✅ FIXED: Manual refresh function with better error handling
  const refreshUsers = useCallback(async () => {
    console.log('[useUserManagement] Manual refresh requested');
    try {
      await refetchUsers();
      console.log('[useUserManagement] Manual refresh completed successfully');
    } catch (error) {
      console.error('[useUserManagement] Error during manual refresh:', error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh user data",
        variant: "destructive"
      });
    }
  }, [refetchUsers, toast]);

  // ✅ Memoized error message to prevent unnecessary re-renders
  const errorMessage = useMemo(() => {
    if (!error) return null;
    return error instanceof Error ? error.message : 'An unknown error occurred';
  }, [error]);

  // ✅ CRITICAL FIX: Memoize return object to prevent infinite re-renders
  return useMemo(() => ({
    users,
    loading,
    error: errorMessage,
    updateUserStatus,
    sendUserMessage,
    refreshUsers,
    searchUsers,
  }), [
    users,
    loading,
    errorMessage,
    updateUserStatus,
    sendUserMessage,
    refreshUsers,
    searchUsers,
  ]);
};
