
import { useState, useCallback } from 'react';

interface UserActionState {
  [userId: string]: {
    isLoading: boolean;
    action?: 'suspend' | 'ban' | 'unban' | 'warn' | 'message';
    error?: string;
  };
}

export const useUserActionStates = () => {
  const [userActionStates, setUserActionStates] = useState<UserActionState>({});

  const setUserActionLoading = useCallback((userId: string, action: string, isLoading: boolean) => {
    setUserActionStates(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        isLoading,
        action: isLoading ? action as any : undefined,
        error: isLoading ? undefined : prev[userId]?.error
      }
    }));
  }, []);

  const setUserActionError = useCallback((userId: string, error: string) => {
    setUserActionStates(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        isLoading: false,
        action: undefined,
        error
      }
    }));
  }, []);

  const clearUserActionState = useCallback((userId: string) => {
    setUserActionStates(prev => {
      const newState = { ...prev };
      delete newState[userId];
      return newState;
    });
  }, []);

  const getUserActionState = useCallback((userId: string) => {
    return userActionStates[userId] || { isLoading: false };
  }, [userActionStates]);

  return {
    setUserActionLoading,
    setUserActionError,
    clearUserActionState,
    getUserActionState
  };
};
