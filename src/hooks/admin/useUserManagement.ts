import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { User, UserAction } from './utils/userTypes';
import { fetchUserData } from './utils/userDataFetcher';
import { searchUsers as searchUsersUtil } from './utils/userSearchUtils';
import { useUserActions } from './useUserActions';
import { useUserMessages } from './useUserMessages';

/**
 * Main hook for user management that combines data fetching, actions, and messaging
 */
export const useUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Import sub-hooks for actions and messaging
  const { updateUserStatus: actionUpdateUserStatus, createUserAction, getUserActions } = useUserActions();
  const { sendUserMessage } = useUserMessages();

  // Remove useCallback to prevent unstable dependencies
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

  // Wrapper for updateUserStatus that refreshes user data after update
  const updateUserStatus = async (userId: string, status: User['status'], reason: string, actionType: 'suspend' | 'ban' | 'unban') => {
    const success = await actionUpdateUserStatus(userId, status, reason, actionType);
    if (success) {
      // Immediately refresh the users list
      await fetchUsers();
    }
    return success;
  };

  // Wrapper for sendUserMessage that doesn't require refresh but ensures UI consistency
  const sendMessage = async (userId: string, subject: string, content: string) => {
    const success = await sendUserMessage(userId, subject, content);
    // No need to refresh for messages, but we could add notification count updates here
    return success;
  };

  // Local search function - keep existing implementation
  const searchUsersLocal = (allUsers: User[], searchTermLocal: string, statusFilterLocal: string, roleFilterLocal: string) => {
    return searchUsersUtil(allUsers, searchTermLocal, statusFilterLocal, roleFilterLocal);
  };
  
  // Simplified refresh function without useCallback
  const refreshUsers = () => {
    console.log("refreshUsers called in useUserManagement");
    fetchUsers();
  };

  // Stable useEffect for initial load
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
