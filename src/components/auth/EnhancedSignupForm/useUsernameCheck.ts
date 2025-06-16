
import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { validateUsername } from './validation';

export const useUsernameCheck = () => {
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const usernameCheckRef = useRef<string>('');

  const checkUsername = useCallback(async (username: string) => {
    const usernameValidationError = validateUsername(username);
    if (usernameValidationError || !username) {
      setUsernameAvailable(null);
      return;
    }

    // Set this as the current request
    usernameCheckRef.current = username;
    setIsCheckingUsername(true);
    setUsernameAvailable(null);
    
    try {
      // Use case-insensitive comparison with explicit typing to avoid deep instantiation
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .ilike('username', username)
        .single();

      // Only process if this is still the latest request
      if (usernameCheckRef.current === username) {
        if (error && error.code !== 'PGRST116') {
          console.error('Error checking username:', error);
          setUsernameAvailable(null);
        } else {
          const isAvailable = !data;
          setUsernameAvailable(isAvailable);
        }
      }
    } catch (error) {
      console.error('Exception checking username:', error);
      if (usernameCheckRef.current === username) {
        setUsernameAvailable(null);
      }
    } finally {
      if (usernameCheckRef.current === username) {
        setIsCheckingUsername(false);
      }
    }
  }, []); // No dependencies needed since we use supabase client and validateUsername directly

  const resetUsernameCheck = useCallback(() => {
    setUsernameAvailable(null);
  }, []);

  // Return both the new and old method names for compatibility
  return {
    usernameAvailable,
    usernameExists: usernameAvailable === false, // Convert to the expected format
    isCheckingUsername,
    checkUsername,
    checkUsernameAvailability: checkUsername,
    resetUsernameCheck
  };
};
