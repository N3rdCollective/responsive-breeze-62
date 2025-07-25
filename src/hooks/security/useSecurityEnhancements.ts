import { useSecurityContext } from '@/components/security/SecurityProvider';
import { useToast } from '@/hooks/use-toast';

/**
 * Security enhancement hook for XSS prevention logging
 */
export const useSecurityEnhancements = () => {
  const { logSecurityEvent } = useSecurityContext();
  const { toast } = useToast();

  /**
   * Log potential XSS attempts when malicious content is detected and sanitized
   */
  const logXSSAttempt = async (content: string, source: string) => {
    // Check for common XSS patterns
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe\b[^>]*>/gi,
      /<object\b[^>]*>/gi,
      /<embed\b[^>]*>/gi,
      /<link\b[^>]*>/gi,
      /<style\b[^>]*>/gi
    ];

    const detectedPatterns = xssPatterns.filter(pattern => pattern.test(content));
    
    if (detectedPatterns.length > 0) {
      await logSecurityEvent('xss_attempt', 'high', {
        source,
        patterns_detected: detectedPatterns.length,
        content_length: content.length,
        sanitized: true,
        timestamp: new Date().toISOString()
      });

      // Show warning toast to user
      toast({
        title: "Content Sanitized",
        description: "Potentially dangerous content was automatically removed for security.",
        variant: "destructive"
      });
    }
  };

  /**
   * Log content validation events for rich text
   */
  const logContentValidation = async (contentType: 'news' | 'forum', isValid: boolean, errors?: string[]) => {
    await logSecurityEvent('content_validation', isValid ? 'low' : 'medium', {
      content_type: contentType,
      is_valid: isValid,
      validation_errors: errors,
      timestamp: new Date().toISOString()
    });
  };

  return {
    logXSSAttempt,
    logContentValidation
  };
};