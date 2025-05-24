
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface User {
  id: string;
  username: string;
  display_name: string;
  email: string;
  profile_picture?: string;
  created_at: string;
  last_active: string;
  // Calculated fields from view or aggregated queries
  forum_post_count?: number; // Renamed from post_count to be specific
  timeline_post_count?: number; // Added for timeline posts
  pending_report_count?: number; // Renamed from report_count to be specific
  status: 'active' | 'suspended' | 'banned';
  role: 'user' | 'moderator' | 'admin';
}

export interface UserAction {
  id: string;
  user_id: string;
  action_type: 'suspend' | 'ban' | 'unban' | 'warn' | 'note'; // Added 'note'
  reason: string;
  moderator_id: string;
  created_at: string;
  expires_at?: string;
  // Optional: include moderator display name if joined
  moderator?: {
    username?: string;
    display_name?: string;
  };
}

export const useUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: usersData, error: usersError } = await supabase
        .from('user_stats_view') // Use the new view
        .select('*')
        .order('profile_created_at', { ascending: false });

      if (usersError) throw usersError;

      // The view already contains counts, so map directly
      const mappedUsers = usersData?.map(user => ({
        ...user,
        id: user.id, // ensure id is correctly mapped if view names differ
        username: user.username,
        display_name: user.display_name,
        email: user.email,
        profile_picture: user.profile_picture,
        created_at: user.profile_created_at, // use aliased column
        last_active: user.last_active || user.profile_created_at,
        forum_post_count: user.forum_post_count || 0,
        timeline_post_count: user.timeline_post_count || 0,
        pending_report_count: user.pending_report_count || 0,
        status: user.status as User['status'],
        role: user.role as User['role'],
      })) || [];
      
      setUsers(mappedUsers as User[]);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message);
      toast({
        title: "Error loading users",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateUserStatus = async (userId: string, status: 'active' | 'suspended' | 'banned', reason: string, actionType: 'suspend' | 'ban' | 'unban') => {
    try {
      const { error }ika_profiles_update } = await supabase
        .from('profiles')
        .update({ status })
        .eq('id', userId);

      if (errorika_profiles_update) throw errorika_profiles_update;

      await createUserAction(userId, actionType, reason);
      
      // Optimistic update or refetch
      // setUsers(prevUsers =>
      //   prevUsers.map(user =>
      //     user.id === userId ? { ...user, status } : user
      //   )
      // );
      fetchUsers(); // Refetch to ensure data consistency

      toast({
        title: `User ${status === 'active' ? 'Restored' : status === 'suspended' ? 'Suspended' : 'Banned'}`,
        description: `User status has been updated to ${status}.`
      });
      return true;
    } catch (err: any) {
      console.error('Error updating user status:', err);
      toast({
        title: "Error updating user",
        description: err.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const createUserAction = async (
    userId: string, 
    actionType: 'suspend' | 'ban' | 'unban' | 'warn' | 'note', 
    reason: string,
    expiresAt?: string
  ) => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        toast({ title: "Authentication Error", description: "No authenticated moderator found.", variant: "destructive" });
        throw new Error('No authenticated user found');
      }

      const { error } = await supabase
        .from('user_actions')
        .insert({
          user_id: userId,
          action_type: actionType,
          reason,
          moderator_id: currentUser.id, // This should be the staff/moderator's profile ID from your staff table, not auth.uid() directly if they are different. Assuming current user is staff and their ID in profiles is auth.uid().
          expires_at: expiresAt
        });

      if (error) throw error;
      return true;
    } catch (err: any) {
      console.error('Error creating user action:', err);
      toast({ title: "Action Logging Error", description: `Could not log action: ${err.message}`, variant: "destructive" });
      return false;
    }
  };

  const sendUserMessage = async (userId: string, subject: string, message: string) => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        toast({ title: "Authentication Error", description: "No authenticated sender found.", variant: "destructive" });
        throw new Error('No authenticated user found');
      }

      const { error } = await supabase
        .from('user_messages')
        .insert({
          recipient_id: userId,
          sender_id: currentUser.id, // Similar to createUserAction, ensure this ID matches your profiles table for staff.
          subject,
          message,
          message_type: 'admin' 
        });

      if (error) throw error;

      toast({
        title: "Message sent",
        description: "Your message has been sent to the user.",
      });
      return true;
    } catch (err: any) {
      console.error('Error sending message:', err);
      toast({
        title: "Error sending message",
        description: err.message,
        variant: "destructive"
      });
      return false;
    }
  };
  
  const getUserActions = async (userId: string): Promise<UserAction[]> => {
    try {
      const { data, error } = await supabase
        .from('user_actions')
        .select(`
          *,
          moderator:profiles!user_actions_moderator_id_fkey(username, display_name)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as UserAction[] || [];
    } catch (err: any) {
      console.error('Error fetching user actions:', err);
      return [];
    }
  };

  const searchUsersLocal = useCallback((allUsers: User[], searchTermLocal: string, statusFilterLocal: string, roleFilterLocal: string) => {
    return allUsers.filter(user => {
      const statusMatch = statusFilterLocal === 'all' || user.status === statusFilterLocal;
      const roleMatch = roleFilterLocal === 'all' || user.role === roleFilterLocal;
      const searchLower = searchTermLocal.toLowerCase();
      const termMatch = searchTermLocal === '' || 
                        (user.username?.toLowerCase().includes(searchLower)) ||
                        (user.display_name?.toLowerCase().includes(searchLower)) ||
                        (user.email?.toLowerCase().includes(searchLower));
      return statusMatch && roleMatch && termMatch;
    });
  }, []);
  
  const refreshUsers = useCallback(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    updateUserStatus,
    createUserAction,
    sendUserMessage,
    getUserActions,
    searchUsers: searchUsersLocal, // Expose the local search function
    refreshUsers,
    fetchUsers
  };
};
