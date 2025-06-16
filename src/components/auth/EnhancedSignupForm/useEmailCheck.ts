
import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { validateEmail } from './validation';

export const useEmailCheck = () => {
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const emailCheckRef = useRef<string>('');

  const checkEmail = useCallback(async (email: string) => {
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
      // Check if email exists in profiles table (which is populated from auth.users)
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

  // Return both the new and old method names for compatibility
  return {
    emailAvailable,
    emailExists: emailAvailable === false, // Convert to the expected format
    isCheckingEmail,
    checkEmail,
    checkEmailAvailability: checkEmail,
    resetEmailCheck
  };
};
