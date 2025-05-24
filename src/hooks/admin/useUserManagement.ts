import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast'; // Corrected path based on previous versions

// This interface defines what the UI component expects.
export interface User {
  id: string;
  username: string;
  display_name: string;
  email: string; // Will be placeholder for now
  profile_picture?: string;
  created_at: string;
  last_active: string; // Will be derived or placeholder
  forum_post_count: number;
  timeline_post_count: number;
  pending_report_count: number;
  status: 'active' | 'suspended' | 'banned'; // Will be default or placeholder
  role: 'user' | 'moderator' | 'admin';
}

// This interface is for actions, will be simulated.
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
      console.log("fetchUsers called in useUserManagement");

      // Fetch base user data from profiles
      // Only select columns known to be in the base 'profiles' type to avoid TS errors
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, display_name, profile_picture, created_at, role, updated_at') // 'updated_at' can serve as a proxy for last_active if 'last_active' column type isn't ready
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error("Error fetching from profiles table:", profilesError);
        throw profilesError;
      }

      if (!profilesData) {
        setUsers([]);
        setLoading(false);
        return;
      }

      const userIds = profilesData.map(p => p.id);
      let mappedUsers: User[] = [];

      if (userIds.length > 0) {
        // Fetch forum post counts
        const { data: forumPostCountsData, error: forumPostCountsError } = await supabase
          .from('forum_posts')
          .select('user_id, id') // select 'id' to count
          .in('user_id', userIds);

        if (forumPostCountsError) {
          console.warn('Error fetching forum post counts:', forumPostCountsError.message);
        }

        // Fetch timeline post counts
        const { data: timelinePostCountsData, error: timelinePostCountsError } = await supabase
          .from('timeline_posts')
          .select('user_id, id') // select 'id' to count
          .in('user_id', userIds);
        
        if (timelinePostCountsError) {
            console.warn('Error fetching timeline post counts:', timelinePostCountsError.message);
        }

        // Fetch pending report counts
        const { data: pendingReportCountsData, error: pendingReportCountsError } = await supabase
          .from('content_reports')
          .select('reported_user_id, id') // select 'id' to count
          .in('reported_user_id', userIds)
          .eq('status', 'pending');

        if (pendingReportCountsError) {
          console.warn('Error fetching pending report counts:', pendingReportCountsError.message);
        }
        
        mappedUsers = profilesData.map(profile => {
          const forum_post_count = forumPostCountsData?.filter(p => p.user_id === profile.id).length || 0;
          const timeline_post_count = timelinePostCountsData?.filter(p => p.user_id === profile.id).length || 0;
          const pending_report_count = pendingReportCountsData?.filter(p => p.reported_user_id === profile.id).length || 0;

          // The 'status' and 'last_active' columns were added by migration.
          // If types are not updated, 'profile.status' or 'profile.last_active' might not exist.
          // We use fallbacks. 'profile.role' is in the base schema.
          const profileStatus = (profile as any).status || 'active';
          const profileLastActive = (profile as any).last_active || profile.updated_at || profile.created_at;


          return {
            id: profile.id,
            username: profile.username || 'N/A',
            display_name: profile.display_name || profile.username || 'Anonymous',
            email: 'Email N/A', // Email is not on profiles table per schema
            profile_picture: profile.profile_picture || undefined,
            created_at: profile.created_at,
            last_active: profileLastActive,
            forum_post_count,
            timeline_post_count,
            pending_report_count,
            status: profileStatus as User['status'],
            role: (profile.role as User['role']) || 'user',
          };
        });
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

  // Simulated: Update user status
  const updateUserStatus = async (userId: string, status: User['status'], reason: string, actionType: 'suspend' | 'ban' | 'unban') => {
    setLoading(true);
    try {
      console.log(`Simulated: Attempting to update user ${userId} to status ${status} with reason: ${reason} using action ${actionType}`);
      
      // Actual DB call (assuming 'profiles' table has 'status' column and RLS allows update)
      // This part is commented out because 'status' might not be in live Supabase types for 'profiles' update
      /*
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ status: status }) // This line can cause TS error if 'status' not in ProfileUpdate type
        .eq('id', userId);

      if (updateError) {
        console.error("Error updating user status in DB:", updateError);
        throw updateError;
      }
      */

      await createUserAction(userId, actionType, reason); // This is also simulated
      
      // Optimistic update or refetch
      await fetchUsers(); // Refetch to ensure data consistency from the source

      toast({
        title: `User ${status === 'active' ? 'Restored' : status === 'suspended' ? 'Suspended' : 'Banned'} (Simulated)`,
        description: `User status update simulated to ${status}. Reason: ${reason}`
      });
      return true;
    } catch (err: any)
{
      console.error('Error in updateUserStatus (Simulated):', err);
      toast({
        title: "Error updating user status (Simulated)",
        description: `Could not update user status. ${err.message}`,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Simulated: Create user action
  const createUserAction = async (
    userId: string, 
    actionType: UserAction['action_type'], 
    reason: string,
    expiresAt?: string
  ): Promise<boolean> => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser(); // To get moderator_id
      
      if (!currentUser) {
        toast({ title: "Authentication Error", description: "No authenticated moderator found to log action.", variant: "destructive" });
        // throw new Error('No authenticated user found to log action');
        console.warn('Simulated createUserAction: No authenticated moderator found.');
        // return false; // In a real scenario, this would be an error
      }
      console.log(`Simulated: Attempting to create user action for ${userId}: ${actionType}. Moderator: ${currentUser?.id || 'Unknown'}`);
      console.log('Simulated User Action Logged:', {
        user_id: userId,
        action_type: actionType,
        reason,
        moderator_id: currentUser?.id || 'simulated_moderator_id', 
        expires_at: expiresAt,
        created_at: new Date().toISOString()
      });

      // Actual DB call (assuming 'user_actions' table exists and RLS allows insert)
      // This is commented out as 'user_actions' might not be in live Supabase types
      /*
      const { error: insertError } = await supabase
        .from('user_actions') // This line can cause TS error if 'user_actions' not in types
        .insert({
          user_id: userId,
          action_type: actionType,
          reason,
          moderator_id: currentUser.id, 
          expires_at: expiresAt
        });

      if (insertError) {
        console.error("Error inserting user action (Simulated):", insertError);
        throw insertError;
      }
      */
      console.log("User action logged successfully (Simulated)");
      return true;
    } catch (err: any) {
      console.error('Error in createUserAction (Simulated):', err);
      // Toast handled by calling function
      // throw err; // Re-throw if critical, or handle more gracefully for simulation
      return false; // For simulation, indicate failure if needed
    }
  };

  // Simulated: Send user message
  const sendUserMessage = async (userId: string, subject: string, message: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        toast({ title: "Authentication Error", description: "No authenticated sender found for message.", variant: "destructive" });
        console.warn('Simulated sendUserMessage: No authenticated sender found.');
        // return false; 
      }
      console.log(`Simulated: Attempting to send message to user ${userId} from ${currentUser?.id || 'Unknown'}`);
      console.log('Simulated Message Sent:', {
          recipient_id: userId,
          sender_id: currentUser?.id || 'simulated_sender_id', 
          subject,
          message,
          message_type: 'admin',
          created_at: new Date().toISOString()
      });

      // Actual DB call (assuming 'user_messages' table exists)
      // Commented out as 'user_messages' might not be in live Supabase types
      /*
      const { error: insertError } = await supabase
        .from('user_messages') // This line can cause TS error
        .insert({
          recipient_id: userId,
          sender_id: currentUser.id, 
          subject,
          message,
          message_type: 'admin'
        });

      if (insertError) {
        console.error("Error sending user message (Simulated):", insertError);
        throw insertError;
      }
      */

      toast({
        title: "Message Sent (Simulated)",
        description: "Your message has been (simulated) sent to the user.",
      });
      return true;
    } catch (err: any) {
      console.error('Error in sendUserMessage (Simulated):', err);
      toast({
        title: "Error Sending Message (Simulated)",
        description: `Could not send message. ${err.message}`,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Simulated: Get user actions
  const getUserActions = async (userId: string): Promise<UserAction[]> => {
    try {
      console.log(`Simulated: Fetching actions for user ${userId}`);
      // Actual DB call (assuming 'user_actions' table exists)
      // Commented out
      /*
      const { data, error: fetchError } = await supabase
        .from('user_actions') // This line can cause TS error
        .select(\`
          id, user_id, action_type, reason, moderator_id, created_at, expires_at,
          moderator:profiles!user_actions_moderator_id_fkey (username, display_name)
        \`)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error(\`Error fetching user actions for \${userId} (Simulated):\`, fetchError);
        if (fetchError.message.includes("relation \\"user_actions\\" does not exist")) {
             toast({ title: "User Actions Unavailable (Simulated)", description: "Feature not fully set up.", variant: "default" });
             return [];
        }
        throw fetchError;
      }
      return (data as UserAction[]) || [];
      */
      return []; // Return empty array for simulation
    } catch (err: any) {
      console.error('Error in getUserActions (Simulated):', err);
      toast({
        title: "Error Fetching User Actions (Simulated)",
        description: `Could not load actions history. ${err.message}`,
        variant: "destructive"
      });
      return [];
    }
  };

  // Local search function - unchanged
  const searchUsersLocal = useCallback((allUsers: User[], searchTermLocal: string, statusFilterLocal: string, roleFilterLocal: string) => {
    return allUsers.filter(user => {
      const statusMatch = statusFilterLocal === 'all' || user.status === statusFilterLocal;
      const roleMatch = roleFilterLocal === 'all' || user.role === roleFilterLocal;
      const searchLower = searchTermLocal.toLowerCase();
      const termMatch = searchTermLocal === '' || 
                        (user.username?.toLowerCase().includes(searchLower)) ||
                        (user.display_name?.toLowerCase().includes(searchLower)) ||
                        (user.email?.toLowerCase().includes(searchLower)); // email is 'Email N/A'
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
    fetchUsers 
  };
};
