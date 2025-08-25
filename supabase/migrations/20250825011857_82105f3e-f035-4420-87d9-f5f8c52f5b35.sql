-- Fix remaining SECURITY DEFINER functions without SET search_path
-- These are the most critical ones for our job applications security

-- Fix check_job_application_rate_limit (older function)
CREATE OR REPLACE FUNCTION public.check_job_application_rate_limit(applicant_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_count integer := 0;
  time_window interval := '1 day'::interval;
BEGIN
  -- Check submissions in the last 24 hours
  SELECT COALESCE(submission_count, 0) INTO current_count
  FROM public.job_application_rate_limits
  WHERE email = applicant_email 
  AND last_submission_at > now() - time_window;
  
  -- Allow up to 3 submissions per day
  RETURN current_count < 3;
END;
$$;

-- Fix log_security_event function
CREATE OR REPLACE FUNCTION public.log_security_event(p_event_type text, p_user_id uuid DEFAULT NULL::uuid, p_ip_address inet DEFAULT NULL::inet, p_user_agent text DEFAULT NULL::text, p_details jsonb DEFAULT NULL::jsonb, p_severity text DEFAULT 'medium'::text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  event_id uuid;
  event_count integer;
BEGIN
  -- Rate limiting: Check for excessive events from same source in last minute
  SELECT COUNT(*) INTO event_count
  FROM security_events
  WHERE (p_user_id IS NOT NULL AND user_id = p_user_id)
     OR (p_ip_address IS NOT NULL AND ip_address = p_ip_address)
  AND created_at > NOW() - INTERVAL '1 minute';
  
  -- Allow max 20 events per minute per source to prevent spam
  IF event_count > 20 THEN
    RAISE EXCEPTION 'Rate limit exceeded for security event logging';
  END IF;
  
  -- Validate event type
  IF p_event_type NOT IN (
    'login_attempt', 'login_success', 'login_failure',
    'signup_attempt', 'signup_success', 'signup_failure',
    'password_reset_attempt', 'password_reset_success', 'password_reset_failure',
    'permission_violation', 'suspicious_activity', 'account_lockout',
    'page_access', 'xss_attempt', 'content_validation',
    'unauthorized_access_attempt', 'permission_denied', 'unauthorized_job_app_access'
  ) THEN
    RAISE EXCEPTION 'Invalid security event type: %', p_event_type;
  END IF;
  
  -- Validate severity
  IF p_severity NOT IN ('low', 'medium', 'high', 'critical') THEN
    p_severity := 'medium';
  END IF;
  
  -- Insert the security event
  INSERT INTO security_events (
    event_type, 
    user_id, 
    ip_address, 
    user_agent, 
    details, 
    severity
  )
  VALUES (
    p_event_type, 
    p_user_id, 
    p_ip_address, 
    p_user_agent, 
    COALESCE(p_details, '{}'::jsonb), 
    p_severity
  )
  RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$;

-- Fix validate_staff_action function
CREATE OR REPLACE FUNCTION public.validate_staff_action(staff_id uuid, action_type text, resource_type text DEFAULT NULL::text, target_id uuid DEFAULT NULL::uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  permission_name TEXT;
  is_valid BOOLEAN := FALSE;
  staff_role TEXT;
BEGIN
  -- Get the staff member's role first
  SELECT role INTO staff_role 
  FROM public.staff 
  WHERE id = staff_id;
  
  -- If not a staff member, log security event and deny access
  IF staff_role IS NULL THEN
    PERFORM log_security_event(
      'unauthorized_access_attempt',
      staff_id,
      NULL,
      NULL,
      jsonb_build_object(
        'action_type', action_type,
        'resource_type', resource_type,
        'target_id', target_id
      ),
      'high'
    );
    RETURN FALSE;
  END IF;
  
  -- Construct permission name from resource and action type
  IF resource_type IS NOT NULL THEN
    permission_name := resource_type || '.' || action_type;
  ELSE
    permission_name := action_type;
  END IF;
  
  -- Check if staff has the required permission
  SELECT EXISTS (
    SELECT 1 
    FROM public.role_permissions rp
    JOIN public.staff_permissions sp ON rp.permission_id = sp.id
    WHERE rp.role = staff_role 
    AND sp.permission_name = permission_name
  ) INTO is_valid;
  
  -- Log permission check
  INSERT INTO public.staff_activity_logs (
    staff_id, 
    action_type, 
    description,
    entity_type,
    entity_id,
    details
  ) VALUES (
    staff_id,
    'permission_check',
    'Permission validation for: ' || permission_name,
    resource_type,
    target_id,
    jsonb_build_object(
      'permission', permission_name,
      'staff_role', staff_role,
      'granted', is_valid,
      'timestamp', NOW()
    )
  );
  
  -- Log security event if permission denied
  IF NOT is_valid THEN
    PERFORM log_security_event(
      'permission_denied',
      staff_id,
      NULL,
      NULL,
      jsonb_build_object(
        'permission', permission_name,
        'staff_role', staff_role,
        'action_type', action_type,
        'resource_type', resource_type
      ),
      'medium'
    );
  END IF;
  
  RETURN is_valid;
END;
$$;

-- Fix staff_has_permission function
CREATE OR REPLACE FUNCTION public.staff_has_permission(user_id uuid, permission_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get the staff member's role
  SELECT role INTO user_role 
  FROM public.staff 
  WHERE id = user_id;
  
  IF user_role IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if the role has the specific permission
  RETURN EXISTS (
    SELECT 1 
    FROM public.role_permissions rp
    JOIN public.staff_permissions sp ON rp.permission_id = sp.id
    WHERE rp.role = user_role 
    AND sp.permission_name = permission_name
  );
END;
$$;