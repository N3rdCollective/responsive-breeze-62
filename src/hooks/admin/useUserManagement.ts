
import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useStaffPermissions } from '@/hooks/staff/useStaffPermissions';
import { User, UserAction } from './utils/userTypes';
import { fetchUserData } from './utils/userDataFetcher';
import { searchUsers as searchUsersUtil } from './utils/userSearchUtils';
import { useUserActions } from './useUserActions';
import { useUserMessages } from './useUserMessages';

/**
 * Main hook for user management with server-side security validation
 */
export const useUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { hasPermission, validateAction, loading: permissionsLoading } = useStaffPermissions();
  
  // Track if we've already fetched data to prevent duplicate fetches
  const hasInitiallyFetchedRef = useRef(false);
  const fetchInProgressRef = useRef(false);
  
  // Import sub-hooks for actions and messaging
  const { updateUserStatus: actionUpdateUserStatus, createUserAction, getUserActions } = useUserActions();
  const { sendUserMessage } = useUserMessages();

  const fetchUsers = useCallback(async () => {
    // Prevent concurrent fetches
    if (fetchInProgressRef.current) {
      console.log("🔄 User fetch already in progress, skipping...");
      return;
    }

    // Don't fetch if permissions are still loading
    if (permissionsLoading) {
      console.log("⏳ Permissions still loading, deferring user fetch...");
      return;
    }

    fetchInProgressRef.current = true;
    
    try {
      setLoading(true);
      setError(null);
      console.log("🔍 fetchUsers called in useUserManagement");

      // Check permission before fetching user data
      if (!hasPermission('user.view')) {
        const canView = await validateAction('view', 'user');
        if (!canView) {
          setError('Insufficient permissions to view user data');
          return;
        }
      }

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
      hasInitiallyFetchedRef.current = true;
      
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
      fetchInProgressRef.current = false;
    }
  }, [toast, hasPermission, validateAction, permissionsLoading]);

  // Optimistic update wrapper for updateUserStatus with server-side validation
  const updateUserStatus = useCallback(async (userId: string, status: User['status'], reason: string, actionType: 'suspend' | 'ban' | 'unban') => {
    // Pre-validate action before optimistic update
    const canPerform = await validateAction(actionType, 'user', userId);
    if (!canPerform) {
      return false;
    }

    // Optimistically update the local state immediately
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId ? { ...user, status } : user
      )
    );

    try {
      const success = await actionUpdateUserStatus(userId, status, reason, actionType);
      
      if (!success) {
        // Simple rollback without expensive refetch
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId ? { ...user, status: user.status === status ? 'active' : user.status } : user
          )
        );
      }
      
      return success;
    } catch (error) {
      console.error("Error in optimistic updateUserStatus:", error);
      // Simple rollback on error
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, status: 'active' } : user
        )
      );
      return false;
    }
  }, [actionUpdateUserStatus, validateAction]);

  // Memoized search function to prevent recreation
  const searchUsersLocal = useCallback((allUsers: User[], searchTermLocal: string, statusFilterLocal: string, roleFilterLocal: string) => {
    return searchUsersUtil(allUsers, searchTermLocal, statusFilterLocal, roleFilterLocal);
  }, []);
  
  // Refresh function that doesn't disrupt UI state
  const refreshUsers = useCallback(async () => {
    console.log("🔄 refreshUsers called in useUserManagement");
    hasInitiallyFetchedRef.current = false; // Allow fresh fetch
    await fetchUsers();
  }, [fetchUsers]);

  // Initial load - only fetch once permissions are loaded
  useEffect(() => {
    let mounted = true;
    
    const initializeUsers = async () => {
      // Only fetch if permissions are loaded and we haven't fetched yet
      if (!permissionsLoading && !hasInitiallyFetchedRef.current && mounted) {
        console.log("✅ Initial fetchUsers call in useEffect, useUserManagement");
        await fetchUsers();
      }
    };

    initializeUsers();

    return () => {
      mounted = false;
    };
  }, [permissionsLoading, fetchUsers]);

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
