-- CRITICAL: Secure Job Applications from Unauthorized Access

-- 1. Enable FORCE ROW LEVEL SECURITY for strictest enforcement
ALTER TABLE public.job_applications FORCE ROW LEVEL SECURITY;

-- 2. Drop existing policies and recreate with stricter controls
DROP POLICY IF EXISTS "HR staff only can view applications" ON public.job_applications;
DROP POLICY IF EXISTS "HR staff only can update applications" ON public.job_applications;
DROP POLICY IF EXISTS "Super admins only can delete applications" ON public.job_applications;
DROP POLICY IF EXISTS "Validated public job applications" ON public.job_applications;

-- 3. Create secure INSERT policy for legitimate job applications (public)
CREATE POLICY "Validated public job applications" 
ON public.job_applications 
FOR INSERT 
TO public
WITH CHECK (
  -- Strict validation to prevent data injection
  name IS NOT NULL AND 
  length(trim(name)) >= 2 AND 
  length(trim(name)) <= 100 AND
  email IS NOT NULL AND 
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
  cover_letter IS NOT NULL AND 
  length(trim(cover_letter)) >= 10 AND 
  length(trim(cover_letter)) <= 5000 AND
  (phone IS NULL OR (length(trim(phone)) >= 10 AND length(trim(phone)) <= 20)) AND
  application_status = 'pending'
);

-- 4. Create HR staff SELECT policy with permission check
CREATE POLICY "HR staff only can view applications" 
ON public.job_applications 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.staff s
    JOIN public.role_permissions rp ON s.role = rp.role
    JOIN public.staff_permissions sp ON rp.permission_id = sp.id
    WHERE s.id = auth.uid() 
    AND sp.permission_name = 'hr.manage_applications'
  )
);

-- 5. Create HR staff UPDATE policy
CREATE POLICY "HR staff only can update applications" 
ON public.job_applications 
FOR UPDATE 
TO authenticated
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

-- 6. Create super admin DELETE policy
CREATE POLICY "Super admins only can delete applications" 
ON public.job_applications 
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  )
);

-- 7. Explicit denial for all public access to existing data
CREATE POLICY "Deny public read access to applications" 
ON public.job_applications 
FOR SELECT 
TO public
USING (false);

CREATE POLICY "Deny public update/delete access to applications" 
ON public.job_applications 
FOR UPDATE, DELETE
TO public
USING (false)
WITH CHECK (false);

-- 8. Create audit function for job application access
CREATE OR REPLACE FUNCTION public.log_job_application_access()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log when HR staff access job applications
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
      'sensitive_data_access',
      'Accessed job application: ' || COALESCE(NEW.name, OLD.name),
      'job_applications',
      COALESCE(NEW.id, OLD.id),
      jsonb_build_object(
        'applicant_email', COALESCE(NEW.email, OLD.email),
        'timestamp', NOW()
      )
    );
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.staff_activity_logs (
      staff_id,
      action_type,
      description,
      entity_type,
      entity_id,
      details
    ) VALUES (
      auth.uid(),
      'job_application_updated',
      'Updated job application: ' || OLD.name,
      'job_applications',
      OLD.id,
      jsonb_build_object(
        'old_status', OLD.application_status,
        'new_status', NEW.application_status,
        'timestamp', NOW()
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 9. Create audit trigger for job application access
DROP TRIGGER IF EXISTS audit_job_application_access ON public.job_applications;
CREATE TRIGGER audit_job_application_access
  AFTER UPDATE ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION public.log_job_application_access();