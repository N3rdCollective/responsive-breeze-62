
import React, { useState, useCallback } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Shield } from 'lucide-react';
import { useRateLimiting } from '@/hooks/security/useRateLimiting';
import { useSecurityEventLogger } from '@/hooks/security/useSecurityEventLogger';

interface SecureAuthFormProps {
  children: React.ReactNode;
  onSubmit: (formData: any) => Promise<void>;
  submitButtonText: string;
  email: string;
  authType: 'login' | 'signup' | 'password_reset';
}

const SecureAuthForm: React.FC<SecureAuthFormProps> = ({
  children,
  onSubmit,
  submitButtonText,
  email,
  authType
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [securityError, setSecurityError] = useState<string | null>(null);
  const { checkRateLimit, logAuthAttempt, isRateLimited } = useRateLimiting();
  const { logSecurityEvent } = useSecurityEventLogger();

  const handleSecureSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError(null);
    setIsSubmitting(true);

    try {
      // Check rate limiting before proceeding
      if (email) {
        const canProceed = await checkRateLimit(email, authType);
        if (!canProceed) {
          setSecurityError('Too many attempts. Please wait before trying again.');
          await logSecurityEvent('account_lockout', 'high', { 
            email, 
            attemptType: authType,
            reason: 'rate_limit_exceeded'
          });
          return;
        }
      }

      // Log the attempt
      await logSecurityEvent(`${authType}_attempt`, 'low', { email });

      // Execute the original form submission
      await onSubmit(e);

      // Log successful attempt
      if (email) {
        await logAuthAttempt(email, authType, true);
      }
      await logSecurityEvent(`${authType}_success`, 'low', { email });

    } catch (error: any) {
      console.error('Auth form error:', error);
      
      // Log failed attempt
      if (email) {
        await logAuthAttempt(email, authType, false);
      }
      await logSecurityEvent(`${authType}_failure`, 'medium', { 
        email, 
        errorMessage: error.message 
      });

      // Set appropriate error message
      if (error.message?.includes('rate limit') || isRateLimited) {
        setSecurityError('Too many attempts. Please wait before trying again.');
      } else {
        setSecurityError(error.message || 'An error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [email, authType, onSubmit, checkRateLimit, logAuthAttempt, logSecurityEvent, isRateLimited]);

  return (
    <form onSubmit={handleSecureSubmit}>
      {securityError && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{securityError}</AlertDescription>
        </Alert>
      )}
      
      {isRateLimited && (
        <Alert variant="destructive" className="mb-4">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Account temporarily locked due to multiple failed attempts. Please wait 15 minutes before trying again.
          </AlertDescription>
        </Alert>
      )}

      {children}
      
      <button
        type="submit"
        disabled={isSubmitting || isRateLimited}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-2 px-4 rounded disabled:opacity-50"
      >
        {isSubmitting ? 'Processing...' : submitButtonText}
      </button>
    </form>
  );
};

export default SecureAuthForm;
