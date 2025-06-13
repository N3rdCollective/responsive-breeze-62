
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RateLimitOptions {
  maxAttempts?: number;
  timeWindow?: string; // PostgreSQL interval format like '15 minutes'
}

export const useRateLimiting = () => {
  const [isRateLimited, setIsRateLimited] = useState(false);

  const checkRateLimit = useCallback(async (
    email: string,
    attemptType: 'login' | 'signup' | 'password_reset',
    options: RateLimitOptions = {}
  ): Promise<boolean> => {
    try {
      const { maxAttempts = 5, timeWindow = '15 minutes' } = options;
      
      const { data: canProceed, error } = await supabase.rpc('check_rate_limit', {
        p_email: email,
        p_attempt_type: attemptType,
        p_time_window: timeWindow,
        p_max_attempts: maxAttempts
      });

      if (error) {
        console.error('Rate limit check error:', error);
        return true; // Allow on error to avoid blocking legitimate users
      }

      const allowed = Boolean(canProceed);
      setIsRateLimited(!allowed);
      return allowed;
    } catch (error) {
      console.error('Rate limiting error:', error);
      return true; // Allow on error
    }
  }, []);

  const logAuthAttempt = useCallback(async (
    email: string,
    attemptType: 'login' | 'signup' | 'password_reset',
    success: boolean,
    ipAddress?: string
  ) => {
    try {
      await supabase.from('auth_attempts').insert({
        email,
        attempt_type: attemptType,
        success,
        ip_address: ipAddress,
        attempted_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to log auth attempt:', error);
    }
  }, []);

  return {
    checkRateLimit,
    logAuthAttempt,
    isRateLimited
  };
};
