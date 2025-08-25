-- Phase 1: Secure Job Applications Table
-- Drop existing problematic policies
DROP POLICY IF EXISTS "deny_anonymous_job_applications" ON public.job_applications;
DROP POLICY IF EXISTS "public_can_submit_applications" ON public.job_applications;
DROP POLICY IF EXISTS "hr_personnel_view_applications" ON public.job_applications;
DROP POLICY IF EXISTS "hr_personnel_update_applications" ON public.job_applications;
DROP POLICY IF EXISTS "super_admin_delete_applications" ON public.job_applications;

-- Phase 2: Remove problematic security definer view
DROP VIEW IF EXISTS public.staff_own_profile;

-- Create audit table for job application access
CREATE TABLE IF NOT EXISTS public.job_application_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accessor_id UUID REFERENCES auth.users(id),
  application_id UUID REFERENCES public.job_applications(id),
  access_type TEXT NOT NULL, -- 'view', 'update', 'download_resume'
  access_reason TEXT,
  ip_address INET,
  user_agent TEXT,
  accessed_fields TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit table
ALTER TABLE public.job_application_audit ENABLE ROW LEVEL SECURITY;

-- Only super admins can view audit logs
CREATE POLICY "super_admin_view_job_app_audit" ON public.job_application_audit
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.staff 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- Create secure function to log job application access
CREATE OR REPLACE FUNCTION public.log_job_application_access_secure(
  p_application_id UUID,
  p_access_type TEXT,
  p_access_reason TEXT DEFAULT NULL,
  p_accessed_fields TEXT[] DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only log if user is HR personnel or super admin
  IF EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid() 
    AND (hr_permissions = true OR role = 'super_admin')
  ) THEN
    INSERT INTO public.job_application_audit (
      accessor_id,
      application_id,
      access_type,
      access_reason,
      accessed_fields
    ) VALUES (
      auth.uid(),
      p_application_id,
      p_access_type,
      p_access_reason,
      p_accessed_fields
    );
  END IF;
END;
$$;

-- Create secure function to check HR access with logging
CREATE OR REPLACE FUNCTION public.check_hr_access_with_audit(
  p_application_id UUID,
  p_access_type TEXT DEFAULT 'view'
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  has_access BOOLEAN := FALSE;
BEGIN
  -- Check if user has HR permissions or is super admin
  SELECT EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid() 
    AND (hr_permissions = true OR role = 'super_admin')
  ) INTO has_access;
  
  -- Log the access attempt
  IF has_access THEN
    PERFORM public.log_job_application_access_secure(
      p_application_id,
      p_access_type,
      'HR data access'
    );
  ELSE
    -- Log unauthorized attempt
    PERFORM public.log_security_event(
      'unauthorized_job_app_access',
      auth.uid(),
      NULL,
      NULL,
      jsonb_build_object(
        'application_id', p_application_id,
        'access_type', p_access_type,
        'timestamp', NOW()
      ),
      'high'
    );
  END IF;
  
  RETURN has_access;
END;
$$;

-- Enhanced rate limiting for job applications
CREATE OR REPLACE FUNCTION public.check_application_rate_limit(
  p_email TEXT,
  p_ip_address INET DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  email_count INTEGER := 0;
  ip_count INTEGER := 0;
BEGIN
  -- Check email-based rate limit (3 per day)
  SELECT COALESCE(submission_count, 0) INTO email_count
  FROM public.job_application_rate_limits
  WHERE email = p_email 
  AND last_submission_at > NOW() - INTERVAL '1 day';
  
  -- Check IP-based rate limit if IP provided (10 per day)
  IF p_ip_address IS NOT NULL THEN
    SELECT COUNT(*) INTO ip_count
    FROM public.job_application_rate_limits
    WHERE ip_address = p_ip_address
    AND last_submission_at > NOW() - INTERVAL '1 day';
    
    IF ip_count >= 10 THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  RETURN email_count < 3;
END;
$$;

-- Create new restrictive RLS policies for job_applications

-- 1. Deny all anonymous access
CREATE POLICY "deny_all_anonymous_access" ON public.job_applications
  FOR ALL
  TO anon
  USING (FALSE)
  WITH CHECK (FALSE);

-- 2. Allow public to submit applications with validation and rate limiting
CREATE POLICY "authenticated_can_submit_applications" ON public.job_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Validate required fields
    name IS NOT NULL AND 
    length(TRIM(name)) BETWEEN 2 AND 100 AND
    email IS NOT NULL AND 
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
    cover_letter IS NOT NULL AND 
    length(TRIM(cover_letter)) BETWEEN 10 AND 5000 AND
    (phone IS NULL OR length(TRIM(phone)) BETWEEN 10 AND 20) AND
    application_status = 'pending' AND
    -- Check rate limiting
    public.check_application_rate_limit(email)
  );

-- 3. HR personnel can view applications with audit logging
CREATE POLICY "hr_can_view_applications" ON public.job_applications
  FOR SELECT
  TO authenticated
  USING (
    public.check_hr_access_with_audit(id, 'view')
  );

-- 4. HR personnel can update applications with audit logging
CREATE POLICY "hr_can_update_applications" ON public.job_applications
  FOR UPDATE
  TO authenticated
  USING (
    public.check_hr_access_with_audit(id, 'update')
  )
  WITH CHECK (
    public.check_hr_access_with_audit(id, 'update')
  );

-- 5. Only super admins can delete applications
CREATE POLICY "super_admin_can_delete_applications" ON public.job_applications
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- Create trigger to update rate limiting table on application submission
CREATE OR REPLACE FUNCTION public.update_application_rate_limit()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or insert rate limit record
  INSERT INTO public.job_application_rate_limits (
    email, 
    submission_count, 
    first_submission_at, 
    last_submission_at
  ) VALUES (
    NEW.email, 
    1, 
    NOW(), 
    NOW()
  )
  ON CONFLICT (email) DO UPDATE SET
    submission_count = CASE 
      WHEN job_application_rate_limits.last_submission_at > NOW() - INTERVAL '1 day' 
      THEN job_application_rate_limits.submission_count + 1
      ELSE 1
    END,
    first_submission_at = CASE
      WHEN job_application_rate_limits.last_submission_at <= NOW() - INTERVAL '1 day'
      THEN NOW()
      ELSE job_application_rate_limits.first_submission_at
    END,
    last_submission_at = NOW();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for rate limiting
DROP TRIGGER IF EXISTS update_job_application_rate_limit ON public.job_applications;
CREATE TRIGGER update_job_application_rate_limit
  AFTER INSERT ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_application_rate_limit();

-- Create secure view for HR to access job applications
CREATE VIEW public.job_applications_hr_view AS
SELECT 
  ja.id,
  ja.name,
  ja.email,
  ja.phone,
  ja.cover_letter,
  ja.resume_url,
  ja.resume_filename,
  ja.application_status,
  ja.job_posting_id,
  ja.applied_at,
  ja.reviewed_at,
  ja.reviewed_by,
  ja.notes,
  jp.title as job_title,
  jp.department
FROM public.job_applications ja
LEFT JOIN public.job_postings jp ON ja.job_posting_id = jp.id
WHERE public.check_hr_access_with_audit(ja.id, 'view_hr_list');

-- Enable RLS on the HR view
ALTER VIEW public.job_applications_hr_view SET (security_barrier = true);

-- Grant access to the HR view for authenticated users (RLS will handle permissions)
GRANT SELECT ON public.job_applications_hr_view TO authenticated;