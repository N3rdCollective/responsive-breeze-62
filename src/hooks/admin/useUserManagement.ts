
import { useState, useEffect, useCallback } from 'react';
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

  const fetchUsers = useCallback(async () => {
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
  }, [toast]);

  // Wrapper for updateUserStatus that refreshes user data after update
  const updateUserStatus = async (userId: string, status: User['status'], reason: string, actionType: 'suspend' | 'ban' | 'unban') => {
    const success = await actionUpdateUserStatus(userId, status, reason, actionType);
    if (success) {
      await fetchUsers();
    }
    return success;
  };

  // Local search function
  const searchUsersLocal = useCallback((allUsers: User[], searchTermLocal: string, statusFilterLocal: string, roleFilterLocal: string) => {
    return searchUsersUtil(allUsers, searchTermLocal, statusFilterLocal, roleFilterLocal);
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

// Re-export the types for convenience
export type { User, UserAction } from './utils/userTypes';
