
import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { validateEmail } from './validation';

export const useEmailCheck = () => {
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const emailCheckRef = useRef<string>('');

  const checkEmailAvailability = useCallback(async (email: string) => {
    const emailValidationError = validateEmail(email);
    if (emailValidationError || !email) {
      setEmailAvailable(null);
      return;
    }

    // Set this as the current request
    emailCheckRef.current = email;
    setIsCheckingEmail(true);
    setEmailAvailable(null);
    
    try {
      // Check if email exists in auth.users table
      const { data: authData, error: authError } = await supabase.auth.admin.getUserByEmail(email);
      
      // If we can't check auth.users, fall back to checking profiles table
      if (authError) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .ilike('email', email)
          .single();

        // Only process if this is still the latest request
        if (emailCheckRef.current === email) {
          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Error checking email in profiles:', profileError);
            setEmailAvailable(null);
          } else {
            const isAvailable = !profileData;
            setEmailAvailable(isAvailable);
          }
        }
      } else {
        // Only process if this is still the latest request
        if (emailCheckRef.current === email) {
          const isAvailable = !authData?.user;
          setEmailAvailable(isAvailable);
        }
      }
    } catch (error) {
      console.error('Exception checking email:', error);
      if (emailCheckRef.current === email) {
        setEmailAvailable(null);
      }
    } finally {
      if (emailCheckRef.current === email) {
        setIsCheckingEmail(false);
      }
    }
  }, []);

  const resetEmailCheck = useCallback(() => {
    setEmailAvailable(null);
  }, []);

  return {
    emailAvailable,
    isCheckingEmail,
    checkEmailAvailability,
    resetEmailCheck
  };
};
