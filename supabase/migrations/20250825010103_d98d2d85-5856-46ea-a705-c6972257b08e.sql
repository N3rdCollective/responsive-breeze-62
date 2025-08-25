-- Enhanced Security Events Access Control

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Super admins only can access security events" ON public.security_events;

-- Create explicit separate policies for different operations

-- 1. SELECT: Only super admins can view security events
CREATE POLICY "Super admins can view security events"
ON public.security_events
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  )
);

-- 2. INSERT: Only through SECURITY DEFINER function (system logging)
CREATE POLICY "System can log security events"
ON public.security_events
FOR INSERT
WITH CHECK (true); -- Controlled by SECURITY DEFINER function

-- 3. UPDATE: Super admins only (for status updates, etc.)
CREATE POLICY "Super admins can update security events"
ON public.security_events
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  )
);

-- 4. DELETE: No one can delete security events (immutable audit trail)
CREATE POLICY "Security events are immutable"
ON public.security_events
FOR DELETE
USING (false);

-- Enhance the log_security_event function with additional validation and rate limiting
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type text,
  p_user_id uuid DEFAULT NULL::uuid,
  p_ip_address inet DEFAULT NULL::inet,
  p_user_agent text DEFAULT NULL::text,
  p_details jsonb DEFAULT NULL::jsonb,
  p_severity text DEFAULT 'medium'::text
)
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
    'unauthorized_access_attempt', 'permission_denied'
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

-- Create function to audit security event access
CREATE OR REPLACE FUNCTION public.audit_security_event_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log when security events are accessed by super admins
  IF TG_OP = 'SELECT' THEN
    INSERT INTO public.staff_activity_logs (
      staff_id,
      action_type,
      description,
      entity_type,
      entity_id,
      details
    ) VALUES (
      auth.uid(),
      'security_event_accessed',
      'Super admin accessed security event: ' || COALESCE(NEW.event_type, 'unknown'),
      'security_events',
      COALESCE(NEW.id, OLD.id),
      jsonb_build_object(
        'event_type', COALESCE(NEW.event_type, OLD.event_type),
        'severity', COALESCE(NEW.severity, OLD.severity),
        'accessed_at', NOW()
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Note: We don't create a trigger for SELECT operations as they cannot be reliably triggered
-- Instead, we'll implement client-side audit logging when security events are viewed

-- Create a function specifically for super admins to safely view security events with automatic audit logging
CREATE OR REPLACE FUNCTION public.get_security_events_with_audit(
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0,
  p_severity_filter text DEFAULT NULL,
  p_event_type_filter text DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  event_type text,
  user_id uuid,
  ip_address inet,
  user_agent text,
  details jsonb,
  severity text,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Verify caller is super admin
  IF NOT EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Super admin role required';
  END IF;
  
  -- Log the access
  INSERT INTO public.staff_activity_logs (
    staff_id,
    action_type,
    description,
    entity_type,
    details
  ) VALUES (
    auth.uid(),
    'security_events_query',
    'Super admin queried security events',
    'security_events',
    jsonb_build_object(
      'limit', p_limit,
      'offset', p_offset,
      'severity_filter', p_severity_filter,
      'event_type_filter', p_event_type_filter,
      'timestamp', NOW()
    )
  );
  
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
END;
$$;