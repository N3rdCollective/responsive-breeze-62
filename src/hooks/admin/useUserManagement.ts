
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { User, UserAction } from './utils/userTypes';
import { fetchUserData } from './utils/userDataFetcher';
import { searchUsers as searchUsersUtil } from './utils/userSearchUtils';
import { useUserActions } from './useUserActions';
import { useUserMessages } from './useUserMessages';

/**
 * Main hook for user management with optimistic updates to prevent UI freezing
 */
export const useUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Import sub-hooks for actions and messaging
  const { updateUserStatus: actionUpdateUserStatus, createUserAction, getUserActions } = useUserActions();
  const { sendUserMessage } = useUserMessages();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("fetchUsers called in useUserManagement");

      const { users: fetchedUsers, error: fetchError } = await fetchUserData();
      
      if (fetchError) {
        setError(fetchError);
        toast({
          title: "Error loading users",
          description: `Could not load user data. ${fetchError}`,
          variant: "destructive"
        });
        return;
      }
      
      setUsers(fetchedUsers);
      
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
  };

  // Optimistic update wrapper for updateUserStatus
  const updateUserStatus = async (userId: string, status: User['status'], reason: string, actionType: 'suspend' | 'ban' | 'unban') => {
    // Optimistically update the local state immediately
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId ? { ...user, status } : user
      )
    );

    try {
      const success = await actionUpdateUserStatus(userId, status, reason, actionType);
      
      if (!success) {
        // Rollback optimistic update on failure
        const { users: freshUsers } = await fetchUserData();
        if (freshUsers) {
          setUsers(freshUsers);
        }
      }
      
      return success;
    } catch (error) {
      console.error("Error in optimistic updateUserStatus:", error);
      // Rollback optimistic update on error
      const { users: freshUsers } = await fetchUserData();
      if (freshUsers) {
        setUsers(freshUsers);
      }
      return false;
    }
  };

  // Wrapper for sendUserMessage that doesn't require refresh
  const sendMessage = async (userId: string, subject: string, content: string) => {
    const success = await sendUserMessage(userId, subject, content);
    return success;
  };

  // Local search function
  const searchUsersLocal = (allUsers: User[], searchTermLocal: string, statusFilterLocal: string, roleFilterLocal: string) => {
    return searchUsersUtil(allUsers, searchTermLocal, statusFilterLocal, roleFilterLocal);
  };
  
  // Refresh function that doesn't disrupt UI state
  const refreshUsers = async () => {
    console.log("refreshUsers called in useUserManagement");
    await fetchUsers();
  };

  // Initial load
  useEffect(() => {
    console.log("Initial fetchUsers call in useEffect, useUserManagement");
    fetchUsers();
  }, []); // Empty dependency array for initial load only

  return {
    users,
    loading,
    error,
    updateUserStatus,
    createUserAction,
    sendUserMessage: sendMessage,
    getUserActions,
    searchUsers: searchUsersLocal,
    refreshUsers,
    fetchUsers 
  };
};

// Re-export the types for convenience
export type { User, UserAction } from './utils/userTypes';
