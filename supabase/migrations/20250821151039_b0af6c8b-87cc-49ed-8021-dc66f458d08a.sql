-- Fix Job Applications RLS policies and permissions

-- First, let's add hr.manage_applications permission to admin role
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'admin', sp.id 
FROM public.staff_permissions sp 
WHERE sp.permission_name = 'hr.manage_applications'
AND NOT EXISTS (
  SELECT 1 FROM public.role_permissions rp 
  WHERE rp.role = 'admin' AND rp.permission_id = sp.id
);

-- Drop existing problematic policies on job_applications
DROP POLICY IF EXISTS "Deny public delete access to applications" ON public.job_applications;
DROP POLICY IF EXISTS "Deny public read access to applications" ON public.job_applications;
DROP POLICY IF EXISTS "Deny public update access to applications" ON public.job_applications;
DROP POLICY IF EXISTS "HR staff only can update applications" ON public.job_applications;
DROP POLICY IF EXISTS "HR staff only can view applications" ON public.job_applications;
DROP POLICY IF EXISTS "Super admins only can delete applications" ON public.job_applications;
DROP POLICY IF EXISTS "Validated public job applications" ON public.job_applications;

-- Create clean, secure RLS policies for job_applications

-- 1. Absolute deny for anonymous users
CREATE POLICY "deny_anonymous_job_applications" ON public.job_applications
  FOR ALL TO anon
  USING (false)
  WITH CHECK (false);

-- 2. Allow validated public job applications (INSERT only)
CREATE POLICY "public_can_submit_applications" ON public.job_applications
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    name IS NOT NULL 
    AND length(trim(name)) >= 2 
    AND length(trim(name)) <= 100
    AND email IS NOT NULL 
    AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    AND cover_letter IS NOT NULL 
    AND length(trim(cover_letter)) >= 10 
    AND length(trim(cover_letter)) <= 5000
    AND (phone IS NULL OR (length(trim(phone)) >= 10 AND length(trim(phone)) <= 20))
    AND application_status = 'pending'
  );

-- 3. HR Staff (admin and super_admin) can view all applications
CREATE POLICY "hr_staff_view_applications" ON public.job_applications
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff s
      WHERE s.id = auth.uid() 
      AND s.role IN ('admin', 'super_admin')
    )
  );

-- 4. HR Staff (admin and super_admin) can update applications
CREATE POLICY "hr_staff_update_applications" ON public.job_applications
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff s
      WHERE s.id = auth.uid() 
      AND s.role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff s
      WHERE s.id = auth.uid() 
      AND s.role IN ('admin', 'super_admin')
    )
  );

-- 5. Only super admins can delete applications
CREATE POLICY "super_admin_delete_applications" ON public.job_applications
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff s
      WHERE s.id = auth.uid() 
      AND s.role = 'super_admin'
    )
  );

-- Create audit logging function for job application access
CREATE OR REPLACE FUNCTION public.log_job_application_access_audit()
RETURNS TRIGGER AS $$
BEGIN
  -- Log when HR staff access job applications
  IF TG_OP IN ('SELECT', 'UPDATE') THEN
    INSERT INTO public.staff_activity_logs (
      staff_id,
      action_type,
      description,
      entity_type,
      entity_id,
      details
    ) VALUES (
      auth.uid(),
      CASE 
        WHEN TG_OP = 'SELECT' THEN 'job_application_viewed'
        WHEN TG_OP = 'UPDATE' THEN 'job_application_updated'
      END,
      CASE 
        WHEN TG_OP = 'SELECT' THEN 'Viewed job application: ' || COALESCE(NEW.name, OLD.name)
        WHEN TG_OP = 'UPDATE' THEN 'Updated job application: ' || COALESCE(OLD.name, NEW.name)
      END,
      'job_applications',
      COALESCE(NEW.id, OLD.id),
      jsonb_build_object(
        'applicant_email', COALESCE(NEW.email, OLD.email),
        'old_status', CASE WHEN TG_OP = 'UPDATE' THEN OLD.application_status END,
        'new_status', CASE WHEN TG_OP = 'UPDATE' THEN NEW.application_status END,
        'operation', TG_OP,
        'timestamp', NOW()
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply the audit logging trigger (but only for staff access, not public submissions)
-- Note: We'll implement this selectively in the application layer to avoid triggering on public inserts

-- Ensure RLS is enabled
ALTER TABLE public.job_applications FORCE ROW LEVEL SECURITY;