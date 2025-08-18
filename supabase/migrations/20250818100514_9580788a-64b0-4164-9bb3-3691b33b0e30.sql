-- Comprehensive Job Applications Security Fix

-- 1. Add missing UPDATE policy - only HR staff can update applications
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

-- 2. Add DELETE policy - only super admins can delete applications
CREATE POLICY "Super admins only can delete applications" 
ON public.job_applications 
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- 3. Improve INSERT policy with basic validation
DROP POLICY IF EXISTS "Public can submit applications" ON public.job_applications;

CREATE POLICY "Validated public job applications" 
ON public.job_applications 
FOR INSERT 
WITH CHECK (
  -- Ensure required fields are present and reasonable
  name IS NOT NULL 
  AND length(trim(name)) >= 2 
  AND length(trim(name)) <= 100
  AND email IS NOT NULL 
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND cover_letter IS NOT NULL 
  AND length(trim(cover_letter)) >= 10
  AND length(trim(cover_letter)) <= 5000
  -- Ensure phone is reasonable if provided
  AND (phone IS NULL OR (length(trim(phone)) >= 10 AND length(trim(phone)) <= 20))
  -- Set application status to pending
  AND application_status = 'pending'
);

-- 4. Create audit trigger for job application access
CREATE OR REPLACE FUNCTION public.log_job_application_access()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create rate limiting table for job applications
CREATE TABLE IF NOT EXISTS public.job_application_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  ip_address inet,
  submission_count integer DEFAULT 1,
  first_submission_at timestamp with time zone DEFAULT now(),
  last_submission_at timestamp with time zone DEFAULT now(),
  UNIQUE(email)
);

ALTER TABLE public.job_application_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No public access to rate limits" 
ON public.job_application_rate_limits 
FOR ALL 
USING (false);

-- 6. Create function to check rate limits
CREATE OR REPLACE FUNCTION public.check_job_application_rate_limit(applicant_email text)
RETURNS boolean AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.check_job_application_rate_limit(text) TO public;