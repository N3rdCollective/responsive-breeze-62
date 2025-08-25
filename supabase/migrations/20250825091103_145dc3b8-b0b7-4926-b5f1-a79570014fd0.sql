-- Enhanced Security Hardening for security_events table
-- 1. Create enhanced audit table for security event access
CREATE TABLE IF NOT EXISTS public.security_event_access_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accessor_id UUID REFERENCES auth.users(id),
  access_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  query_filters JSONB,
  records_accessed INTEGER DEFAULT 0,
  session_id TEXT,
  access_duration_ms INTEGER,
  is_bulk_access BOOLEAN DEFAULT FALSE,
  suspicious_indicators JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit table
ALTER TABLE public.security_event_access_audit ENABLE ROW LEVEL SECURITY;

-- Only super admins can view security audit logs
CREATE POLICY "super_admin_only_security_audit" ON public.security_event_access_audit
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.staff 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- 2. Create rate limiting table for security queries
CREATE TABLE IF NOT EXISTS public.security_query_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  query_count INTEGER DEFAULT 1,
  first_query_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_query_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  blocked_until TIMESTAMP WITH TIME ZONE,
  violation_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.security_query_rate_limits ENABLE ROW LEVEL SECURITY;

-- Super admins only
CREATE POLICY "super_admin_rate_limits" ON public.security_query_rate_limits
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.staff 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- 3. Enhanced rate limiting function
CREATE OR REPLACE FUNCTION public.check_security_query_rate_limit(
  p_user_id UUID,
  p_max_queries INTEGER DEFAULT 10,
  p_time_window INTERVAL DEFAULT '1 hour'
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  current_count INTEGER := 0;
  is_blocked BOOLEAN := FALSE;
BEGIN
  -- Check if user is currently blocked
  SELECT blocked_until > NOW() INTO is_blocked
  FROM public.security_query_rate_limits
  WHERE user_id = p_user_id;
  
  IF is_blocked THEN
    RETURN FALSE;
  END IF;
  
  -- Get current query count in time window
  SELECT COALESCE(query_count, 0) INTO current_count
  FROM public.security_query_rate_limits
  WHERE user_id = p_user_id 
  AND last_query_at > NOW() - p_time_window;
  
  -- If exceeded, block user and log violation
  IF current_count >= p_max_queries THEN
    INSERT INTO public.security_query_rate_limits (
      user_id, query_count, blocked_until, violation_count
    ) VALUES (
      p_user_id, 
      current_count + 1, 
      NOW() + INTERVAL '1 hour', -- Block for 1 hour
      1
    )
    ON CONFLICT (user_id) DO UPDATE SET
      query_count = current_count + 1,
      blocked_until = NOW() + INTERVAL '1 hour',
      violation_count = security_query_rate_limits.violation_count + 1,
      last_query_at = NOW();
    
    -- Log security violation
    PERFORM public.log_security_event(
      'rate_limit_violation',
      p_user_id,
      NULL,
      NULL,
      jsonb_build_object(
        'query_type', 'security_events',
        'exceeded_limit', p_max_queries,
        'time_window', p_time_window::text,
        'violation_count', current_count + 1
      ),
      'high'
    );
    
    RETURN FALSE;
  END IF;
  
  -- Update or insert rate limit record
  INSERT INTO public.security_query_rate_limits (user_id, query_count, last_query_at)
  VALUES (p_user_id, 1, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    query_count = CASE 
      WHEN security_query_rate_limits.last_query_at > NOW() - p_time_window 
      THEN security_query_rate_limits.query_count + 1
      ELSE 1
    END,
    first_query_at = CASE
      WHEN security_query_rate_limits.last_query_at <= NOW() - p_time_window
      THEN NOW()
      ELSE security_query_rate_limits.first_query_at
    END,
    last_query_at = NOW(),
    blocked_until = NULL;
  
  RETURN TRUE;
END;
$$;

-- 4. Enhanced security events access function with comprehensive logging
CREATE OR REPLACE FUNCTION public.get_security_events_with_enhanced_audit(
  p_limit INTEGER DEFAULT 50, 
  p_offset INTEGER DEFAULT 0, 
  p_severity_filter TEXT DEFAULT NULL,
  p_event_type_filter TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL
) RETURNS TABLE(
  id UUID,
  event_type TEXT,
  user_id UUID,
  ip_address INET,
  user_agent TEXT,
  details JSONB,
  severity TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  start_time TIMESTAMP WITH TIME ZONE := NOW();
  access_duration INTEGER;
  is_bulk_access BOOLEAN := FALSE;
  suspicious_flags JSONB := '{}';
BEGIN
  -- Verify caller is super admin
  IF NOT EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  ) THEN
    -- Log unauthorized access attempt
    PERFORM public.log_security_event(
      'unauthorized_security_access',
      auth.uid(),
      NULL,
      p_user_agent,
      jsonb_build_object(
        'attempted_function', 'get_security_events_with_enhanced_audit',
        'user_agent', p_user_agent,
        'session_id', p_session_id
      ),
      'critical'
    );
    RAISE EXCEPTION 'Access denied: Super admin role required';
  END IF;
  
  -- Check rate limits
  IF NOT public.check_security_query_rate_limit(auth.uid(), 10, '1 hour') THEN
    RAISE EXCEPTION 'Rate limit exceeded. Access temporarily blocked.';
  END IF;
  
  -- Detect suspicious patterns
  IF p_limit > 100 THEN
    is_bulk_access := TRUE;
    suspicious_flags := suspicious_flags || jsonb_build_object('large_limit', p_limit);
  END IF;
  
  -- Log enhanced access details
  INSERT INTO public.security_event_access_audit (
    accessor_id,
    ip_address,
    user_agent,
    query_filters,
    session_id,
    is_bulk_access,
    suspicious_indicators
  ) VALUES (
    auth.uid(),
    NULL, -- Will be populated by trigger if needed
    p_user_agent,
    jsonb_build_object(
      'limit', p_limit,
      'offset', p_offset,
      'severity_filter', p_severity_filter,
      'event_type_filter', p_event_type_filter
    ),
    p_session_id,
    is_bulk_access,
    suspicious_flags
  );
  
  -- Alert on bulk access
  IF is_bulk_access THEN
    PERFORM public.log_security_event(
      'bulk_security_access',
      auth.uid(),
      NULL,
      p_user_agent,
      jsonb_build_object(
        'requested_limit', p_limit,
        'session_id', p_session_id,
        'timestamp', NOW()
      ),
      'high'
    );
  END IF;
  
  -- Return filtered security events
  RETURN QUERY
  SELECT 
    se.id,
    se.event_type,
    se.user_id,
    se.ip_address,
    se.user_agent,
    se.details,
    se.severity,
    se.created_at
  FROM public.security_events se
  WHERE (p_severity_filter IS NULL OR se.severity = p_severity_filter)
    AND (p_event_type_filter IS NULL OR se.event_type = p_event_type_filter)
  ORDER BY se.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
  
  -- Calculate and log access duration
  access_duration := EXTRACT(EPOCH FROM (NOW() - start_time)) * 1000;
  
  UPDATE public.security_event_access_audit 
  SET 
    access_duration_ms = access_duration,
    records_accessed = p_limit
  WHERE accessor_id = auth.uid() 
  AND access_timestamp = start_time;
  
END;
$$;

-- 5. Create automatic cleanup function for old security events (optional retention)
CREATE OR REPLACE FUNCTION public.cleanup_old_security_events(
  p_retention_days INTEGER DEFAULT 365
) RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Only super admins can run cleanup
  IF NOT EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Super admin role required';
  END IF;
  
  -- Delete old low-severity events beyond retention period
  DELETE FROM public.security_events
  WHERE created_at < NOW() - (p_retention_days || ' days')::INTERVAL
  AND severity = 'low';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Log cleanup activity
  PERFORM public.log_security_event(
    'security_cleanup',
    auth.uid(),
    NULL,
    NULL,
    jsonb_build_object(
      'deleted_records', deleted_count,
      'retention_days', p_retention_days,
      'cleanup_timestamp', NOW()
    ),
    'low'
  );
  
  RETURN deleted_count;
END;
$$;

-- 6. Add trigger to detect and log suspicious access patterns
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

-- Create trigger
DROP TRIGGER IF EXISTS trigger_detect_suspicious_access ON public.security_event_access_audit;
CREATE TRIGGER trigger_detect_suspicious_access
  BEFORE INSERT ON public.security_event_access_audit
  FOR EACH ROW
  EXECUTE FUNCTION public.detect_suspicious_security_access();

-- 7. Update original function to use enhanced version
CREATE OR REPLACE FUNCTION public.get_security_events_with_audit(
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0,
  p_severity_filter TEXT DEFAULT NULL,
  p_event_type_filter TEXT DEFAULT NULL
) RETURNS TABLE(
  id UUID,
  event_type TEXT,
  user_id UUID,
  ip_address INET,
  user_agent TEXT,
  details JSONB,
  severity TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Redirect to enhanced function
  RETURN QUERY
  SELECT * FROM public.get_security_events_with_enhanced_audit(
    p_limit,
    p_offset,
    p_severity_filter,
    p_event_type_filter,
    NULL, -- user_agent
    NULL  -- session_id
  );
END;
$$;