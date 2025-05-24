
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast'; // Corrected path

export interface User {
  id: string;
  username: string; 
  display_name: string; 
  email: string; 
  profile_picture?: string;
  created_at: string;
  last_active: string; // This will be based on profile.last_active or profile.created_at
  forum_post_count?: number; // Renamed from post_count to match view
  timeline_post_count?: number; // Added from view
  pending_report_count?: number; // Added from view
  status: 'active' | 'suspended' | 'banned';
  role: 'user' | 'moderator' | 'admin';
}

// Interface representing the structure of data from user_stats_view
// This will be used once the view is confirmed to be created by the user
interface UserStatData {
  id: string;
  username: string | null;
  display_name: string | null;
  email: string | null; 
  profile_picture: string | null;
  profile_created_at: string; 
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
  action_type: 'suspend' | 'ban' | 'unban' | 'warn' | 'note'; // Added 'note'
  reason: string;
  moderator_id: string;
  created_at: string;
  expires_at?: string;
  moderator?: { // For joining moderator details
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
      console.log("fetchUsers called in useUserManagement");

      // Check if user_stats_view exists by attempting a select with a limit of 0.
      // This is a less intrusive way than querying pg_catalog.
      let viewExists = false;
      try {
        const { error: viewCheckError } = await supabase
          .from('user_stats_view')
          .select('id', { count: 'exact', head: true }); // Just check if selectable
        if (!viewCheckError) {
          viewExists = true;
          console.log("user_stats_view seems to exist.");
        } else {
          console.warn("user_stats_view does not seem to exist or is not accessible:", viewCheckError.message);
        }
      } catch (e) {
        console.warn("Error checking for user_stats_view:", e);
      }

      let mappedUsers: User[] = [];

      if (viewExists) {
        console.log("Fetching from user_stats_view");
        const { data: usersData, error: usersError } = await supabase
          .from('user_stats_view')
          .select('*')
          .order('profile_created_at', { ascending: false });

        if (usersError) {
          console.error("Error fetching from user_stats_view:", usersError);
          // Fallback to profiles if view fetch fails but view was thought to exist
          // This could happen if RLS on view fails, etc.
          // For now, we'll let it throw to simplify, or user can implement specific fallback logic.
          if (usersError.message.includes("relation \"user_stats_view\" does not exist")) {
             // The view *really* doesn't exist, set viewExists to false to trigger fallback logic
            viewExists = false;
            console.warn("Confirmed: user_stats_view does not exist. Falling back to profiles table.");
          } else {
            throw usersError; // Other errors (RLS, etc.)
          }
        }
        
        if (viewExists && usersData) {
            mappedUsers = usersData.map((userViewData: UserStatData): User => ({
            id: userViewData.id,
            username: userViewData.username || 'N/A',
            display_name: userViewData.display_name || userViewData.username || 'Anonymous',
            email: userViewData.email || 'N/A',
            profile_picture: userViewData.profile_picture || undefined,
            created_at: userViewData.profile_created_at,
            last_active: userViewData.last_active || userViewData.profile_created_at, // Fallback to created_at
            forum_post_count: userViewData.forum_post_count || 0,
            timeline_post_count: userViewData.timeline_post_count || 0,
            pending_report_count: userViewData.pending_report_count || 0,
            status: (userViewData.status || 'active') as User['status'],
            role: (userViewData.role || 'user') as User['role'],
          }));
        }
      }
      
      // Fallback or initial fetch if view doesn't exist or fetch from view failed definitively
      if (!viewExists) {
        console.log("Fetching from profiles table (fallback or view does not exist)");
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, display_name, email, profile_picture, created_at, last_active, status, role')
          .order('created_at', { ascending: false });

        if (profilesError) {
          console.error("Error fetching from profiles table:", profilesError);
          throw profilesError;
        }

        const userIds = profilesData?.map(p => p.id) || [];
        let postCountsData: { user_id: string; count: number }[] = [];
        if (userIds.length > 0) {
            const { data: forumPostCounts, error: forumPostCountsError } = await supabase
                .rpc('get_post_counts_for_users', { user_ids: userIds });
            if (forumPostCountsError) console.warn('Error fetching forum post counts via RPC:', forumPostCountsError);
            else postCountsData = forumPostCounts;
        }
        
        let reportCountsData: { reported_user_id: string, count: number }[] = [];
        if (userIds.length > 0) {
            const { data: pendingReportCounts, error: pendingReportCountsError } = await supabase
                .rpc('get_pending_report_counts_for_users', { user_ids: userIds });

            if (pendingReportCountsError) console.warn('Error fetching pending report counts via RPC:', pendingReportCountsError);
            else reportCountsData = pendingReportCounts;
        }


        mappedUsers = profilesData?.map(profile => {
          const forumPosts = postCountsData.find(pc => pc.user_id === profile.id)?.count || 0;
          const pendingReports = reportCountsData.find(rc => rc.reported_user_id === profile.id)?.count || 0;
          
          return {
            id: profile.id,
            username: profile.username || 'N/A',
            display_name: profile.display_name || profile.username || 'Anonymous',
            email: profile.email || 'N/A', // Assuming email is now on profiles
            profile_picture: profile.profile_picture || undefined,
            created_at: profile.created_at,
            last_active: profile.last_active || profile.created_at,
            forum_post_count: forumPosts,
            timeline_post_count: 0, // Placeholder, as timeline_posts table isn't directly queried here
            pending_report_count: pendingReports,
            status: (profile.status || 'active') as User['status'],
            role: (profile.role || 'user') as User['role'],
          };
        }) || [];
      }
      
      setUsers(mappedUsers);
      console.log("Users fetched and mapped:", mappedUsers.length);

    } catch (err: any) {
      console.error('Error in fetchUsers:', err);
      setError(err.message);
      toast({
        title: "Error loading users",
        description: `Could not load user data. ${err.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);


  const updateUserStatus = async (userId: string, status: User['status'], reason: string, actionType: 'suspend' | 'ban' | 'unban') => {
    setLoading(true);
    try {
      console.log(`Attempting to update user ${userId} to status ${status} with reason: ${reason}`);
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ status: status })
        .eq('id', userId);

      if (updateError) {
        console.error("Error updating user status in DB:", updateError);
        throw updateError;
      }

      await createUserAction(userId, actionType, reason);
      
      // Optimistic update or refetch
      // setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, status } : u));
      await fetchUsers(); // Refetch to ensure data consistency from the source

      toast({
        title: `User ${status === 'active' ? 'Restored' : status === 'suspended' ? 'Suspended' : 'Banned'}`,
        description: `User status has been updated to ${status}. Reason: ${reason}`
      });
      return true;
    } catch (err: any) {
      console.error('Error in updateUserStatus:', err);
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

  const createUserAction = async (
    userId: string, 
    actionType: UserAction['action_type'], 
    reason: string,
    expiresAt?: string
  ) => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        toast({ title: "Authentication Error", description: "No authenticated moderator found to log action.", variant: "destructive" });
        throw new Error('No authenticated user found to log action');
      }
      console.log(`Attempting to create user action for ${userId}: ${actionType}`);

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
        console.error("Error inserting user action:", insertError);
        throw insertError;
      }
      console.log("User action logged successfully");
      return true;
    } catch (err: any) {
      console.error('Error in createUserAction:', err);
      // Toast for this error is usually handled by the calling function (e.g. updateUserStatus)
      // to provide more context, but can be added here if direct calls are made.
      // toast({ title: "Action Logging Error", description: `Could not log action: ${err.message}`, variant: "destructive" });
      throw err; // Re-throw to allow calling function to handle
    }
  };

  const sendUserMessage = async (userId: string, subject: string, message: string) => {
    setLoading(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        toast({ title: "Authentication Error", description: "No authenticated sender found for message.", variant: "destructive" });
        throw new Error('No authenticated user found to send message');
      }
      console.log(`Attempting to send message to user ${userId}`);

      const { error: insertError } = await supabase
        .from('user_messages')
        .insert({
          recipient_id: userId,
          sender_id: currentUser.id, 
          subject,
          message,
          message_type: 'admin' // Default message_type
        });

      if (insertError) {
        console.error("Error sending user message:", insertError);
        throw insertError;
      }

      toast({
        title: "Message Sent",
        description: "Your message has been successfully sent to the user.",
      });
      return true;
    } catch (err: any) {
      console.error('Error in sendUserMessage:', err);
      toast({
        title: "Error Sending Message",
        description: `Could not send message. ${err.message}`,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  const getUserActions = async (userId: string): Promise<UserAction[]> => {
    try {
      console.log(`Fetching actions for user ${userId}`);
      // This function assumes 'user_actions' table and related 'profiles' (for moderator) exist and are queryable.
      // If they might not exist yet or RLS prevents access, this could fail.
      // The SQL migration provided by the user should create these.
      const { data, error: fetchError } = await supabase
        .from('user_actions')
        .select(`
          id,
          user_id,
          action_type,
          reason,
          moderator_id,
          created_at,
          expires_at,
          moderator:profiles!user_actions_moderator_id_fkey (username, display_name)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error(`Error fetching user actions for ${userId}:`, fetchError);
        // Check if the error is because the table doesn't exist
        if (fetchError.message.includes("relation \"user_actions\" does not exist")) {
            toast({
                title: "User Actions Unavailable",
                description: "User actions history cannot be loaded as the feature is not fully set up.",
                variant: "default"
            });
            return []; // Return empty if table doesn't exist
        }
        throw fetchError; // Other errors (RLS, etc.)
      }
      return data || [];
    } catch (err: any) {
      console.error('Error in getUserActions catch block:', err);
      toast({
        title: "Error Fetching User Actions",
        description: `Could not load actions history. ${err.message}`,
        variant: "destructive"
      });
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
    console.log("refreshUsers called in useUserManagement");
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    console.log("Initial fetchUsers call in useEffect, useUserManagement");
    fetchUsers();
  }, [fetchUsers]); // fetchUsers is memoized with useCallback

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
    fetchUsers 
  };
};
