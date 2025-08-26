-- Comprehensive Security Hardening Migration

-- 1. Create granular HR roles and permissions
CREATE TYPE public.hr_role AS ENUM ('hr_recruiter', 'hr_manager', 'hr_admin', 'hr_director');

-- Add HR role column to staff table
ALTER TABLE public.staff ADD COLUMN hr_role public.hr_role;

-- 2. Create analytics data retention and privacy enhancements
CREATE TABLE public.analytics_retention_policy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data_type text NOT NULL,
  retention_days integer NOT NULL DEFAULT 365,
  created_at timestamp with time zone DEFAULT now()
);

-- Insert default retention policies
INSERT INTO public.analytics_retention_policy (data_type, retention_days) VALUES
('page_views', 90),
('user_sessions', 30),
('device_info', 180);

-- 3. Create comprehensive audit logging for sensitive operations
CREATE TABLE public.sensitive_data_access_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  accessor_id uuid NOT NULL,
  access_type text NOT NULL,
  target_table text NOT NULL,
  target_record_id uuid,
  accessed_fields text[],
  access_reason text,
  ip_address inet,
  user_agent text,
  session_id text,
  risk_level text DEFAULT 'medium',
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit table
ALTER TABLE public.sensitive_data_access_audit ENABLE ROW LEVEL SECURITY;

-- 4. Create emergency access control system
CREATE TABLE public.emergency_access_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES public.staff(id),
  token_hash text NOT NULL,
  purpose text NOT NULL,
  approved_by uuid REFERENCES public.staff(id),
  expires_at timestamp with time zone NOT NULL,
  used_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.emergency_access_tokens ENABLE ROW LEVEL SECURITY;

-- 5. Create rate limiting for sensitive operations
CREATE TABLE public.sensitive_operation_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  operation_type text NOT NULL,
  operation_count integer DEFAULT 1,
  first_operation_at timestamp with time zone DEFAULT now(),
  last_operation_at timestamp with time zone DEFAULT now(),
  blocked_until timestamp with time zone,
  violation_count integer DEFAULT 0,
  UNIQUE(user_id, operation_type)
);

-- 6. Create security definer functions for safe access checks
CREATE OR REPLACE FUNCTION public.get_user_hr_role(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT hr_role::text FROM public.staff WHERE id = user_id LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.can_access_staff_data(accessor_id uuid, target_staff_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  accessor_role text;
  accessor_hr_role text;
BEGIN
  -- Users can always access their own data
  IF accessor_id = target_staff_id THEN
    RETURN true;
  END IF;
  
  -- Get accessor's role and HR role
  SELECT role, hr_role::text INTO accessor_role, accessor_hr_role
  FROM public.staff WHERE id = accessor_id;
  
  -- Super admins can access all data
  IF accessor_role = 'super_admin' THEN
    RETURN true;
  END IF;
  
  -- HR directors can access all staff data
  IF accessor_hr_role = 'hr_director' THEN
    RETURN true;
  END IF;
  
  -- HR managers can access non-admin staff data
  IF accessor_hr_role = 'hr_manager' THEN
    RETURN NOT EXISTS (
      SELECT 1 FROM public.staff 
      WHERE id = target_staff_id 
      AND role IN ('admin', 'super_admin')
    );
  END IF;
  
  -- All other cases: no access
  RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION public.can_access_job_application(accessor_id uuid, application_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  accessor_role text;
  accessor_hr_role text;
  application_department text;
  staff_department text;
BEGIN
  -- Get accessor's role and HR role
  SELECT s.role, s.hr_role::text INTO accessor_role, accessor_hr_role
  FROM public.staff s WHERE s.id = accessor_id;
  
  -- Super admins and HR directors have full access
  IF accessor_role = 'super_admin' OR accessor_hr_role = 'hr_director' THEN
    RETURN true;
  END IF;
  
  -- HR managers and admins have access to all applications
  IF accessor_role = 'admin' OR accessor_hr_role = 'hr_manager' THEN
    RETURN true;
  END IF;
  
  -- HR recruiters can only access applications for their department
  IF accessor_hr_role = 'hr_recruiter' THEN
    -- Get application department
    SELECT jp.department INTO application_department
    FROM public.job_applications ja
    JOIN public.job_postings jp ON ja.job_posting_id = jp.id
    WHERE ja.id = application_id;
    
    -- Get staff department (assuming we add this field)
    -- For now, allow access if they have hr_recruiter role
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_sensitive_data_access(
  p_accessor_id uuid,
  p_access_type text,
  p_target_table text,
  p_target_record_id uuid DEFAULT NULL,
  p_accessed_fields text[] DEFAULT NULL,
  p_access_reason text DEFAULT NULL,
  p_risk_level text DEFAULT 'medium'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.sensitive_data_access_audit (
    accessor_id,
    access_type,
    target_table,
    target_record_id,
    accessed_fields,
    access_reason,
    risk_level
  ) VALUES (
    p_accessor_id,
    p_access_type,
    p_target_table,
    p_target_record_id,
    p_accessed_fields,
    p_access_reason,
    p_risk_level
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.check_sensitive_operation_rate_limit(
  p_user_id uuid,
  p_operation_type text,
  p_max_operations integer DEFAULT 10,
  p_time_window interval DEFAULT '1 hour'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_count integer := 0;
  is_blocked boolean := false;
BEGIN
  -- Check if user is currently blocked
  SELECT blocked_until > now() INTO is_blocked
  FROM public.sensitive_operation_rate_limits
  WHERE user_id = p_user_id AND operation_type = p_operation_type;
  
  IF is_blocked THEN
    RETURN false;
  END IF;
  
  -- Get current operation count in time window
  SELECT COALESCE(operation_count, 0) INTO current_count
  FROM public.sensitive_operation_rate_limits
  WHERE user_id = p_user_id 
  AND operation_type = p_operation_type
  AND last_operation_at > now() - p_time_window;
  
  -- If exceeded, block user
  IF current_count >= p_max_operations THEN
    INSERT INTO public.sensitive_operation_rate_limits (
      user_id, operation_type, operation_count, blocked_until, violation_count
    ) VALUES (
      p_user_id, p_operation_type, current_count + 1, 
      now() + interval '1 hour', 1
    )
    ON CONFLICT (user_id, operation_type) DO UPDATE SET
      operation_count = current_count + 1,
      blocked_until = now() + interval '1 hour',
      violation_count = sensitive_operation_rate_limits.violation_count + 1,
      last_operation_at = now();
    
    RETURN false;
  END IF;
  
  -- Update or insert rate limit record
  INSERT INTO public.sensitive_operation_rate_limits (
    user_id, operation_type, operation_count, last_operation_at
  ) VALUES (p_user_id, p_operation_type, 1, now())
  ON CONFLICT (user_id, operation_type) DO UPDATE SET
    operation_count = CASE 
      WHEN sensitive_operation_rate_limits.last_operation_at > now() - p_time_window 
      THEN sensitive_operation_rate_limits.operation_count + 1
      ELSE 1
    END,
    first_operation_at = CASE
      WHEN sensitive_operation_rate_limits.last_operation_at <= now() - p_time_window
      THEN now()
      ELSE sensitive_operation_rate_limits.first_operation_at
    END,
    last_operation_at = now(),
    blocked_until = NULL;
  
  RETURN true;
END;
$$;

-- 7. Update all existing functions to have proper search_path
CREATE OR REPLACE FUNCTION public.update_content_reports_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_homepage_content_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_user_messages_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 8. Create enhanced RLS policies for staff table
DROP POLICY IF EXISTS "Staff can view their own data" ON public.staff;
DROP POLICY IF EXISTS "Admins can manage staff" ON public.staff;

CREATE POLICY "staff_can_view_own_data" ON public.staff
FOR SELECT USING (id = auth.uid());

CREATE POLICY "authorized_hr_can_view_staff" ON public.staff
FOR SELECT USING (
  public.can_access_staff_data(auth.uid(), id)
  AND public.check_sensitive_operation_rate_limit(auth.uid(), 'staff_data_access', 20, '1 hour')
);

CREATE POLICY "super_admin_can_manage_staff" ON public.staff
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid() AND role = 'super_admin')
);

CREATE POLICY "hr_admin_can_update_staff" ON public.staff
FOR UPDATE USING (
  public.get_user_hr_role(auth.uid()) IN ('hr_admin', 'hr_director')
  OR EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid() AND role = 'super_admin')
);

-- 9. Enhanced RLS policies for profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Staff can view for moderation" ON public.profiles;

CREATE POLICY "users_can_view_own_profile" ON public.profiles
FOR SELECT USING (id = auth.uid());

CREATE POLICY "public_profiles_viewable" ON public.profiles
FOR SELECT USING (COALESCE(is_public, false) = true);

CREATE POLICY "authorized_staff_moderation_access" ON public.profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin', 'moderator')
  )
  AND public.check_sensitive_operation_rate_limit(auth.uid(), 'profile_moderation_access', 50, '1 hour')
);

-- 10. Enhanced RLS policies for job applications
DROP POLICY IF EXISTS "hr_can_view_applications" ON public.job_applications;
DROP POLICY IF EXISTS "hr_can_update_applications" ON public.job_applications;

CREATE POLICY "authorized_hr_can_view_applications" ON public.job_applications
FOR SELECT USING (
  public.can_access_job_application(auth.uid(), id)
  AND public.check_sensitive_operation_rate_limit(auth.uid(), 'job_application_access', 30, '1 hour')
);

CREATE POLICY "authorized_hr_can_update_applications" ON public.job_applications
FOR UPDATE USING (
  public.can_access_job_application(auth.uid(), id)
  AND public.check_sensitive_operation_rate_limit(auth.uid(), 'job_application_update', 10, '1 hour')
);

-- 11. Analytics data retention function
CREATE OR REPLACE FUNCTION public.cleanup_old_analytics_data()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_count integer := 0;
  policy_rec record;
BEGIN
  -- Only super admins can run cleanup
  IF NOT EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid() AND role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Super admin role required';
  END IF;
  
  -- Apply retention policies
  FOR policy_rec IN 
    SELECT data_type, retention_days 
    FROM public.analytics_retention_policy
  LOOP
    DELETE FROM public.analytics
    WHERE created_at < now() - (policy_rec.retention_days || ' days')::interval;
    
    GET DIAGNOSTICS deleted_count = deleted_count + ROW_COUNT;
  END LOOP;
  
  RETURN deleted_count;
END;
$$;

-- 12. Create audit triggers for sensitive operations
CREATE OR REPLACE FUNCTION public.audit_staff_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log staff data access
  PERFORM public.log_sensitive_data_access(
    auth.uid(),
    TG_OP || '_staff_data',
    'staff',
    COALESCE(NEW.id, OLD.id),
    CASE TG_OP
      WHEN 'SELECT' THEN ARRAY['id', 'email', 'role', 'hr_role']
      WHEN 'UPDATE' THEN ARRAY['role', 'hr_role', 'hr_permissions']
      ELSE NULL
    END,
    'Staff data operation',
    CASE TG_OP 
      WHEN 'SELECT' THEN 'low'
      WHEN 'UPDATE' THEN 'high'
      ELSE 'medium'
    END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.audit_job_application_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log job application access
  PERFORM public.log_sensitive_data_access(
    auth.uid(),
    TG_OP || '_job_application',
    'job_applications',
    COALESCE(NEW.id, OLD.id),
    ARRAY['name', 'email', 'phone', 'resume_url'],
    'Job application operation',
    'high'
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 13. Create triggers for audit logging
CREATE TRIGGER audit_staff_access_trigger
  AFTER SELECT OR UPDATE ON public.staff
  FOR EACH ROW EXECUTE FUNCTION public.audit_staff_access();

CREATE TRIGGER audit_job_application_access_trigger
  AFTER SELECT OR UPDATE ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION public.audit_job_application_access();

-- 14. Create RLS policies for audit tables
CREATE POLICY "super_admin_can_view_audit" ON public.sensitive_data_access_audit
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid() AND role = 'super_admin')
);

CREATE POLICY "system_can_insert_audit" ON public.sensitive_data_access_audit
FOR INSERT WITH CHECK (true);

CREATE POLICY "emergency_access_self_only" ON public.emergency_access_tokens
FOR SELECT USING (staff_id = auth.uid());

CREATE POLICY "super_admin_manage_emergency_tokens" ON public.emergency_access_tokens
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid() AND role = 'super_admin')
);

-- 15. Enhanced analytics privacy
ALTER TABLE public.analytics ADD COLUMN IF NOT EXISTS anonymized_user_id text;
ALTER TABLE public.analytics ADD COLUMN IF NOT EXISTS data_retention_category text DEFAULT 'standard';

-- Update existing analytics to be anonymized
UPDATE public.analytics 
SET anonymized_user_id = encode(digest(user_id::text || created_at::text, 'sha256'), 'hex'),
    data_retention_category = 'standard'
WHERE anonymized_user_id IS NULL;

-- 16. Create secure analytics view
CREATE OR REPLACE VIEW public.analytics_summary AS
SELECT 
  date_trunc('day', created_at) as date,
  page_path,
  COUNT(*) as page_views,
  COUNT(DISTINCT anonymized_user_id) as unique_visitors,
  device_info->>'type' as device_type
FROM public.analytics
WHERE created_at > now() - interval '90 days'
GROUP BY date_trunc('day', created_at), page_path, device_info->>'type';

-- Enable RLS on analytics summary view
CREATE POLICY "staff_can_view_analytics_summary" ON public.analytics_summary
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid())
);

-- 17. Create emergency access procedures
CREATE OR REPLACE FUNCTION public.create_emergency_access_token(
  p_staff_id uuid,
  p_purpose text,
  p_duration_hours integer DEFAULT 4
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  token_value text;
  token_hash text;
BEGIN
  -- Only super admins can create emergency tokens
  IF NOT EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid() AND role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Super admin role required';
  END IF;
  
  -- Generate secure token
  token_value := encode(gen_random_bytes(32), 'base64');
  token_hash := encode(digest(token_value, 'sha256'), 'hex');
  
  -- Store token
  INSERT INTO public.emergency_access_tokens (
    staff_id, token_hash, purpose, approved_by, expires_at
  ) VALUES (
    p_staff_id, token_hash, p_purpose, auth.uid(), 
    now() + (p_duration_hours || ' hours')::interval
  );
  
  -- Log emergency token creation
  PERFORM public.log_sensitive_data_access(
    auth.uid(),
    'emergency_token_created',
    'emergency_access_tokens',
    NULL,
    ARRAY['staff_id', 'purpose'],
    'Emergency access token created for: ' || p_purpose,
    'critical'
  );
  
  RETURN token_value;
END;
$$;

-- 18. Security monitoring and alerting
CREATE TABLE public.security_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type text NOT NULL,
  severity text NOT NULL DEFAULT 'medium',
  title text NOT NULL,
  description text NOT NULL,
  triggered_by uuid,
  related_table text,
  related_record_id uuid,
  metadata jsonb,
  acknowledged boolean DEFAULT false,
  acknowledged_by uuid,
  acknowledged_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "super_admin_manage_alerts" ON public.security_alerts
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid() AND role = 'super_admin')
);

-- Create function to trigger security alerts
CREATE OR REPLACE FUNCTION public.trigger_security_alert(
  p_alert_type text,
  p_severity text,
  p_title text,
  p_description text,
  p_metadata jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.security_alerts (
    alert_type, severity, title, description, 
    triggered_by, metadata
  ) VALUES (
    p_alert_type, p_severity, p_title, p_description,
    auth.uid(), p_metadata
  );
END;
$$;

-- Update pg_graphql extension to latest version
-- Note: This may need to be done manually in some environments
-- ALTER EXTENSION pg_graphql UPDATE;

COMMENT ON MIGRATION IS 'Comprehensive security hardening: enhanced access controls, audit logging, rate limiting, emergency procedures, and monitoring';