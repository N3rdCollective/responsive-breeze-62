-- Security Hardening Optimizations Migration

-- 1. Fix Security Definer View issue
-- Drop any remaining security definer views and recreate without SECURITY DEFINER
DROP VIEW IF EXISTS public.safe_public_profiles CASCADE;

-- Create a regular view without security definer property
CREATE VIEW public.safe_public_profiles AS
SELECT 
  id,
  username,
  display_name,
  profile_picture,
  bio,
  created_at,
  forum_post_count,
  social_links
FROM public.profiles
WHERE COALESCE(is_public, false) = true;

-- 2. Fix remaining functions with mutable search paths
-- Update any functions that might still have mutable search paths

-- Update trigger functions to have immutable search paths
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path TO ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path TO ''
AS $$  
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

-- 3. Update extensions to latest versions
ALTER EXTENSION "uuid-ossp" UPDATE;
ALTER EXTENSION "pgcrypto" UPDATE;

-- 4. Enhanced Security Hardening Measures

-- Create comprehensive security monitoring trigger
CREATE OR REPLACE FUNCTION public.enhanced_security_monitor()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  current_user_id UUID;
  user_role TEXT;
  suspicious_activity BOOLEAN := FALSE;
BEGIN
  current_user_id := auth.uid();
  
  -- Get user role safely
  SELECT role INTO user_role FROM public.staff WHERE id = current_user_id;
  
  -- Detect suspicious patterns
  IF TG_OP = 'DELETE' AND user_role NOT IN ('super_admin', 'admin') THEN
    suspicious_activity := TRUE;
  END IF;
  
  -- Log security events for sensitive operations
  IF TG_TABLE_NAME IN ('staff', 'security_events', 'job_applications', 'profiles') THEN
    PERFORM public.log_security_event(
      'sensitive_table_access',
      current_user_id,
      NULL,
      NULL,
      jsonb_build_object(
        'table_name', TG_TABLE_NAME,
        'operation', TG_OP,
        'suspicious', suspicious_activity,
        'timestamp', NOW()
      ),
      CASE WHEN suspicious_activity THEN 'high' ELSE 'low' END
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Apply enhanced monitoring to sensitive tables
DROP TRIGGER IF EXISTS enhanced_security_monitor_staff ON public.staff;
CREATE TRIGGER enhanced_security_monitor_staff
  AFTER INSERT OR UPDATE OR DELETE ON public.staff
  FOR EACH ROW EXECUTE FUNCTION public.enhanced_security_monitor();

DROP TRIGGER IF EXISTS enhanced_security_monitor_profiles ON public.profiles;
CREATE TRIGGER enhanced_security_monitor_profiles
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.enhanced_security_monitor();

-- 5. Enhanced Rate Limiting Function
CREATE OR REPLACE FUNCTION public.enhanced_rate_limit_check(
  p_user_id UUID,
  p_action_type TEXT,
  p_max_attempts INTEGER DEFAULT 5,
  p_time_window INTERVAL DEFAULT '5 minutes'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  attempt_count INTEGER;
BEGIN
  -- Count recent attempts
  SELECT COUNT(*) INTO attempt_count
  FROM public.security_events
  WHERE user_id = p_user_id
    AND event_type = p_action_type
    AND created_at > NOW() - p_time_window;
  
  -- Log rate limit check
  IF attempt_count >= p_max_attempts THEN
    PERFORM public.log_security_event(
      'rate_limit_exceeded',
      p_user_id,
      NULL,
      NULL,
      jsonb_build_object(
        'action_type', p_action_type,
        'attempt_count', attempt_count,
        'max_attempts', p_max_attempts,
        'time_window', p_time_window::TEXT
      ),
      'high'
    );
    
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- 6. Create secure staff data access function with enhanced logging
CREATE OR REPLACE FUNCTION public.get_staff_list_secure()
RETURNS TABLE(
  id UUID,
  role TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  hr_permissions BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  current_user_role TEXT;
BEGIN
  -- Verify caller has appropriate permissions
  SELECT role INTO current_user_role 
  FROM public.staff 
  WHERE id = auth.uid();
  
  IF current_user_role NOT IN ('admin', 'super_admin') THEN
    -- Log unauthorized access attempt
    PERFORM public.log_security_event(
      'unauthorized_staff_list_access',
      auth.uid(),
      NULL,
      NULL,
      jsonb_build_object(
        'attempted_role', current_user_role,
        'required_roles', ARRAY['admin', 'super_admin']
      ),
      'critical'
    );
    
    RAISE EXCEPTION 'Access denied: Administrative permissions required';
  END IF;
  
  -- Rate limit check
  IF NOT public.enhanced_rate_limit_check(auth.uid(), 'staff_list_access', 10, '1 hour') THEN
    RAISE EXCEPTION 'Rate limit exceeded for staff list access';
  END IF;
  
  -- Log successful access
  PERFORM public.log_security_event(
    'staff_list_accessed',
    auth.uid(),
    NULL,
    NULL,
    jsonb_build_object(
      'accessor_role', current_user_role,
      'timestamp', NOW()
    ),
    'low'
  );
  
  -- Return staff list (excluding sensitive data)
  RETURN QUERY
  SELECT 
    s.id,
    s.role,
    s.created_at,
    s.updated_at,
    s.hr_permissions
  FROM public.staff s
  ORDER BY s.role DESC, s.created_at DESC;
END;
$$;

-- 7. Enhanced job application security function
CREATE OR REPLACE FUNCTION public.get_job_applications_secure()
RETURNS TABLE(
  id UUID,
  name TEXT,
  application_status TEXT,
  job_posting_id UUID,
  applied_at TIMESTAMPTZ,
  job_title TEXT,
  department TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  has_hr_access BOOLEAN := FALSE;
BEGIN
  -- Check HR permissions
  SELECT EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid() 
    AND (hr_permissions = TRUE OR role = 'super_admin')
  ) INTO has_hr_access;
  
  IF NOT has_hr_access THEN
    -- Log unauthorized attempt
    PERFORM public.log_security_event(
      'unauthorized_job_app_list_access',
      auth.uid(),
      NULL,
      NULL,
      jsonb_build_object(
        'timestamp', NOW(),
        'user_id', auth.uid()
      ),
      'critical'
    );
    
    RAISE EXCEPTION 'Access denied: HR permissions required';
  END IF;
  
  -- Rate limit check
  IF NOT public.enhanced_rate_limit_check(auth.uid(), 'job_app_list_access', 20, '1 hour') THEN
    RAISE EXCEPTION 'Rate limit exceeded for job application access';
  END IF;
  
  -- Log access
  PERFORM public.log_security_event(
    'job_applications_list_accessed',
    auth.uid(),
    NULL,
    NULL,
    jsonb_build_object(
      'timestamp', NOW(),
      'access_type', 'hr_list_view'
    ),
    'low'
  );
  
  -- Return basic application data (sensitive data requires separate function)
  RETURN QUERY
  SELECT 
    ja.id,
    ja.name,
    ja.application_status,
    ja.job_posting_id,
    ja.applied_at,
    jp.title as job_title,
    jp.department
  FROM public.job_applications ja
  LEFT JOIN public.job_postings jp ON ja.job_posting_id = jp.id
  ORDER BY ja.applied_at DESC;
END;
$$;

-- 8. Create emergency security lockdown function (super admin only)
CREATE OR REPLACE FUNCTION public.emergency_security_lockdown()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  current_user_role TEXT;
BEGIN
  -- Only super admins can trigger emergency lockdown
  SELECT role INTO current_user_role
  FROM public.staff
  WHERE id = auth.uid();
  
  IF current_user_role != 'super_admin' THEN
    -- Log unauthorized lockdown attempt
    PERFORM public.log_security_event(
      'unauthorized_lockdown_attempt',
      auth.uid(),
      NULL,
      NULL,
      jsonb_build_object(
        'user_role', current_user_role,
        'timestamp', NOW()
      ),
      'critical'
    );
    
    RETURN FALSE;
  END IF;
  
  -- Log emergency lockdown activation
  PERFORM public.log_security_event(
    'emergency_lockdown_activated',
    auth.uid(),
    NULL,
    NULL,
    jsonb_build_object(
      'activated_by', auth.uid(),
      'timestamp', NOW(),
      'reason', 'emergency_security_measure'
    ),
    'critical'
  );
  
  -- Could implement additional lockdown measures here in the future
  -- For now, just log the event
  
  RETURN TRUE;
END;
$$;

-- 9. Enhanced audit table for comprehensive logging
CREATE TABLE IF NOT EXISTS public.comprehensive_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action_type TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  session_info JSONB,
  risk_level TEXT DEFAULT 'low',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE public.comprehensive_audit_log ENABLE ROW LEVEL SECURITY;

-- Only super admins can read audit logs
CREATE POLICY "super_admin_only_audit_access" 
ON public.comprehensive_audit_log 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  )
);

-- System can insert audit records
CREATE POLICY "system_can_log_audit" 
ON public.comprehensive_audit_log 
FOR INSERT 
WITH CHECK (TRUE);

-- 10. Create function to clean up old security events and audit logs
CREATE OR REPLACE FUNCTION public.cleanup_security_logs(retention_days INTEGER DEFAULT 90)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  deleted_count INTEGER := 0;
  current_user_role TEXT;
BEGIN
  -- Only super admins can run cleanup
  SELECT role INTO current_user_role
  FROM public.staff
  WHERE id = auth.uid();
  
  IF current_user_role != 'super_admin' THEN
    RAISE EXCEPTION 'Access denied: Super admin role required for log cleanup';
  END IF;
  
  -- Delete old low-severity events beyond retention period
  DELETE FROM public.security_events
  WHERE created_at < NOW() - (retention_days || ' days')::INTERVAL
  AND severity = 'low';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Log cleanup activity
  PERFORM public.log_security_event(
    'security_log_cleanup',
    auth.uid(),
    NULL,
    NULL,
    jsonb_build_object(
      'deleted_records', deleted_count,
      'retention_days', retention_days,
      'cleanup_timestamp', NOW()
    ),
    'low'
  );
  
  RETURN deleted_count;
END;
$$;