
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast'; // Ensure this path is correct, usually it's `@/components/ui/use-toast` for shadcn

export interface User {
  id: string;
  username: string; // Expecting non-null, provide fallback if DB is null
  display_name: string; // Expecting non-null, provide fallback if DB is null
  email: string; // Expecting non-null, provide fallback if DB is null
  profile_picture?: string;
  created_at: string;
  last_active: string;
  forum_post_count?: number;
  timeline_post_count?: number;
  pending_report_count?: number;
  status: 'active' | 'suspended' | 'banned';
  role: 'user' | 'moderator' | 'admin';
}

// Interface representing the structure of data from user_stats_view
interface UserStatData {
  id: string;
  username: string | null;
  display_name: string | null;
  email: string | null; // The view might return null if profiles.email doesn't exist or is null
  profile_picture: string | null;
  profile_created_at: string; // Alias from the view
  last_active: string | null;
  status: 'active' | 'suspended' | 'banned' | null;
  role: 'user' | 'moderator' | 'admin' | null;
  forum_post_count: number | null;
  timeline_post_count: number | null;
  pending_report_count: number | null;
}

export interface UserAction {
  id: string;
  user_id: string;
  action_type: 'suspend' | 'ban' | 'unban' | 'warn' | 'note';
  reason: string;
  moderator_id: string;
  created_at: string;
  expires_at?: string;
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

      // Fetch from user_stats_view, casting to handle unknown type by TS client
      const { data: usersData, error: usersError } = await supabase
        .from('user_stats_view' as any) // Cast to any because TS doesn't know this view
        .select('*')
        .order('profile_created_at', { ascending: false }) as { data: UserStatData[] | null; error: any };

      if (usersError) throw usersError;

      const mappedUsers = usersData?.map((userViewData): User => ({
        id: userViewData.id,
        username: userViewData.username || 'N/A',
        display_name: userViewData.display_name || userViewData.username || 'Anonymous',
        email: userViewData.email || 'N/A', // Provide fallback if email is null
        profile_picture: userViewData.profile_picture || undefined,
        created_at: userViewData.profile_created_at,
        last_active: userViewData.last_active || userViewData.profile_created_at,
        forum_post_count: userViewData.forum_post_count || 0,
        timeline_post_count: userViewData.timeline_post_count || 0,
        pending_report_count: userViewData.pending_report_count || 0,
        status: (userViewData.status || 'active') as User['status'], // Default to 'active' if null
        role: (userViewData.role || 'user') as User['role'], // Default to 'user' if null
      })) || [];
      
      setUsers(mappedUsers);
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
      // Cast update object to any to bypass strict type checking for 'status' column
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ status } as any) // Cast update object
        .eq('id', userId);

      if (updateError) throw updateError;

      await createUserAction(userId, actionType, reason);
      
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

      // Cast table name to any
      const { error: insertError } = await supabase
        .from('user_actions' as any) // Cast to any
        .insert({
          user_id: userId,
          action_type: actionType,
          reason,
          moderator_id: currentUser.id, 
          expires_at: expiresAt
        });

      if (insertError) throw insertError;
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

      // Cast table name to any
      const { error: insertError } = await supabase
        .from('user_messages' as any) // Cast to any
        .insert({
          recipient_id: userId,
          sender_id: currentUser.id, 
          subject,
          message,
          message_type: 'admin' 
        });

      if (insertError) throw insertError;

      toast({
        title: "Message sent",
        description: "Your message has been sent to the user.",
      });
      return true;
    } catch (err: any)
    {
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
      // Cast table name to any and result data
      const { data, error: fetchError } = await supabase
        .from('user_actions' as any) // Cast to any
        .select(`
          id,
          user_id,
          action_type,
          reason,
          moderator_id,
          created_at,
          expires_at,
          moderator:profiles!user_actions_moderator_id_fkey(username, display_name)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      return (data as UserAction[] | null) || []; // Cast data and handle null
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
                        (user.email?.toLowerCase().includes(searchLower)); // email might be 'N/A'
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
    searchUsers: searchUsersLocal,
    refreshUsers,
    fetchUsers // Exposing fetchUsers directly if needed
  };
};
