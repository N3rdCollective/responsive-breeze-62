-- Phase 1: Critical Security Fixes - Restrict Job Application and Analytics Access

-- 1. Create HR admin role for job applications
INSERT INTO public.staff_permissions (permission_name, description) 
VALUES ('hr.manage_applications', 'Manage job applications and hiring process')
ON CONFLICT (permission_name) DO NOTHING;

-- Grant HR permission to super_admin role
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'super_admin', id FROM public.staff_permissions WHERE permission_name = 'hr.manage_applications'
ON CONFLICT (role, permission_id) DO NOTHING;

-- 2. Drop existing overly permissive job application policies
DROP POLICY IF EXISTS "Staff can view all job applications" ON public.job_applications;
DROP POLICY IF EXISTS "Staff can update job applications" ON public.job_applications;

-- 3. Create restrictive job application policies
CREATE POLICY "HR staff can view job applications" 
ON public.job_applications 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.staff s
    JOIN public.role_permissions rp ON s.role = rp.role
    JOIN public.staff_permissions sp ON rp.permission_id = sp.id
    WHERE s.id = auth.uid() 
    AND sp.permission_name = 'hr.manage_applications'
  )
);

CREATE POLICY "HR staff can update job applications" 
ON public.job_applications 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.staff s
    JOIN public.role_permissions rp ON s.role = rp.role
    JOIN public.staff_permissions sp ON rp.permission_id = sp.id
    WHERE s.id = auth.uid() 
    AND sp.permission_name = 'hr.manage_applications'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.staff s
    JOIN public.role_permissions rp ON s.role = rp.role
    JOIN public.staff_permissions sp ON rp.permission_id = sp.id
    WHERE s.id = auth.uid() 
    AND sp.permission_name = 'hr.manage_applications'
  )
);

-- 4. Improve analytics policies - users can only see their own data
DROP POLICY IF EXISTS "Staff can view all analytics" ON public.analytics;

CREATE POLICY "Staff can view aggregate analytics only" 
ON public.analytics 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin', 'moderator')
  )
);

CREATE POLICY "Users can view their own analytics" 
ON public.analytics 
FOR SELECT 
USING (user_id = auth.uid());

-- 5. Create more granular profile access policies
DROP POLICY IF EXISTS "Staff can view all profiles" ON public.profiles;

CREATE POLICY "Staff can view limited profile data" 
ON public.profiles 
FOR SELECT 
USING (
  -- Super admins can see everything
  (EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid() AND role = 'super_admin')) OR
  -- Other staff can only see public profile info (no email, phone, etc.)
  (EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid() AND role IN ('admin', 'moderator')) AND is_public = true) OR
  -- Users can see their own profile
  (id = auth.uid())
);

-- 6. Restrict security events access to super_admin only
DROP POLICY IF EXISTS "Security admins can view auth attempts" ON public.auth_attempts;
DROP POLICY IF EXISTS "Staff can view security events" ON public.security_events;

CREATE POLICY "Super admins only can view auth attempts" 
ON public.auth_attempts 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

CREATE POLICY "Super admins only can view security events" 
ON public.security_events 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- 7. Add audit logging for sensitive data access
CREATE OR REPLACE FUNCTION public.log_sensitive_data_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log when staff access user profiles or job applications
  IF TG_TABLE_NAME IN ('profiles', 'job_applications') THEN
    INSERT INTO public.staff_activity_logs (
      staff_id,
      action_type,
      description,
      entity_type,
      entity_id,
      details
    ) VALUES (
      auth.uid(),
      'data_access',
      'Accessed sensitive data in ' || TG_TABLE_NAME,
      TG_TABLE_NAME,
      COALESCE(NEW.id, OLD.id),
      jsonb_build_object(
        'table', TG_TABLE_NAME,
        'operation', TG_OP,
        'timestamp', NOW()
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for audit logging
DROP TRIGGER IF EXISTS audit_profiles_access ON public.profiles;
DROP TRIGGER IF EXISTS audit_job_applications_access ON public.job_applications;

CREATE TRIGGER audit_profiles_access
  AFTER SELECT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_data_access();

CREATE TRIGGER audit_job_applications_access  
  AFTER SELECT ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_data_access();