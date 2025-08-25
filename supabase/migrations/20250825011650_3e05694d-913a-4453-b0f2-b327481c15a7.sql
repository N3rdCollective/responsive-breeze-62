-- Fix security linter issues: Function Search Path Mutable warnings
-- Update functions to have SET search_path

-- Fix log_job_application_access_secure function
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

-- Fix check_hr_access_with_audit function  
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

-- Fix check_application_rate_limit function
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

-- Fix update_application_rate_limit function
CREATE OR REPLACE FUNCTION public.update_application_rate_limit()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
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
$$;

-- Create trigger for rate limiting (recreate to ensure it uses the updated function)
DROP TRIGGER IF EXISTS update_job_application_rate_limit ON public.job_applications;
CREATE TRIGGER update_job_application_rate_limit
  AFTER INSERT ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_application_rate_limit();

-- For the security definer view warning: Replace with a secure function approach
-- Drop the view that has security issues
DROP VIEW IF EXISTS public.job_applications_hr_view;

-- Create a secure function instead of a view to get HR job applications
CREATE OR REPLACE FUNCTION public.get_job_applications_for_hr()
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  phone TEXT,
  cover_letter TEXT,
  resume_url TEXT,
  resume_filename TEXT,
  application_status TEXT,
  job_posting_id UUID,
  applied_at TIMESTAMP WITH TIME ZONE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  notes TEXT,
  job_title TEXT,
  department TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if user has HR permissions
  IF NOT EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid() 
    AND (hr_permissions = true OR role = 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Access denied: HR permissions required';
  END IF;
  
  -- Log the HR access
  PERFORM public.log_job_application_access_secure(
    NULL, -- No specific application ID for list view
    'view_hr_list',
    'HR accessing job applications list'
  );
  
  -- Return the applications data
  RETURN QUERY
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
  ORDER BY ja.applied_at DESC;
END;
$$;