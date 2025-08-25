-- Fix search path security issues for newly created functions

-- Fix detect_suspicious_security_access function
CREATE OR REPLACE FUNCTION public.detect_suspicious_security_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  recent_access_count INTEGER;
  rapid_access_threshold INTEGER := 5;
BEGIN
  -- Count recent accesses by this user in last 5 minutes
  SELECT COUNT(*) INTO recent_access_count
  FROM public.security_event_access_audit
  WHERE accessor_id = NEW.accessor_id
  AND access_timestamp > NOW() - INTERVAL '5 minutes';
  
  -- If rapid successive access detected, log as suspicious
  IF recent_access_count >= rapid_access_threshold THEN
    PERFORM public.log_security_event(
      'rapid_security_access',
      NEW.accessor_id,
      NEW.ip_address,
      NEW.user_agent,
      jsonb_build_object(
        'access_count_5min', recent_access_count,
        'session_id', NEW.session_id,
        'query_filters', NEW.query_filters,
        'timestamp', NOW()
      ),
      'medium'
    );
    
    -- Update suspicious indicators
    NEW.suspicious_indicators := NEW.suspicious_indicators || 
      jsonb_build_object('rapid_access', recent_access_count);
  END IF;
  
  RETURN NEW;
END;
$$;