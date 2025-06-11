
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
}

// Export User as a separate type alias to avoid conflicts
export type User = UserManagementUser;

interface UserStatusUpdate {
  userId: string;
  status: User['status'];
  reason: string;
  actionType: 'suspend' | 'ban' | 'unban';
}

interface UserMessage {
  userId: string;
  subject: string;
  content: string;
}

export const useUserManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { logActivity } = useStaffActivityLogger();
  
  // Use React Query for data fetching with proper cache management
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
          pending_report_count
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
        email: user.email || 'N/A'
      })) || [];
      
      return usersWithDefaults as UserManagementUser[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (replaces cacheTime in v5)
    retry: 2,
    retryDelay: 1000,
  });

  // Memoized search function to prevent infinite loops
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
  }, []); // Empty dependencies since this is a pure function

  // Optimized user status update function
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

      // Log the activity
      await logActivity(
        actionType === 'suspend' ? 'suspend_user' : 
        actionType === 'ban' ? 'ban_user' : 'unban_user',
        `User status changed to ${status}. Reason: ${reason}`,
        'user',
        userId,
        { 
          previousStatus: users.find(u => u.id === userId)?.status,
          newStatus: status,
          reason,
          actionType
        }
      );

      // Update the cache optimistically
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
  }, [users, logActivity, queryClient, toast]);

  // Optimized send message function
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
  }, [logActivity, toast]);

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
    users,
    loading,
    error: errorMessage,
    updateUserStatus,
    sendUserMessage,
    refreshUsers,
    searchUsers,
  };
};
