
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

type SecurityEventType = 
  | 'login_attempt'
  | 'login_success'
  | 'login_failure'
  | 'signup_attempt'
  | 'signup_success'
  | 'signup_failure'
  | 'password_reset_attempt'
  | 'password_reset_success'
  | 'password_reset_failure'
  | 'permission_violation'
  | 'suspicious_activity'
  | 'account_lockout'
  | 'page_access';

type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical';

interface SecurityEventDetails {
  email?: string;
  userAgent?: string;
  ipAddress?: string;
  attemptType?: string;
  errorMessage?: string;
  [key: string]: any;
}

export const useSecurityEventLogger = () => {
  const logSecurityEvent = useCallback(async (
    eventType: SecurityEventType,
    severity: SecuritySeverity = 'medium',
    details: SecurityEventDetails = {}
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get user agent and other client info
      const userAgent = navigator.userAgent;

      // Sanitize URL to avoid logging tokens or query params
      const safeUrl = (typeof window !== 'undefined' && window.location)
        ? `${window.location.origin}${window.location.pathname}`
        : null;
      
      const { error } = await supabase.rpc('log_security_event', {
        p_event_type: eventType,
        p_user_id: user?.id || null,
        p_ip_address: null, // IP will be captured server-side if needed
        p_user_agent: userAgent,
        p_details: {
          ...details,
          timestamp: new Date().toISOString(),
          url: safeUrl
        },
        p_severity: severity
      });

      if (error) {
        console.error('Failed to log security event:', error);
      }
    } catch (error) {
      console.error('Security event logging error:', error);
    }
  }, []);

  return { logSecurityEvent };
};
