-- Fix function search path security warnings

-- 1. Fix log_job_application_access function
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

-- 2. Fix check_job_application_rate_limit function  
CREATE OR REPLACE FUNCTION public.check_job_application_rate_limit(applicant_email text)
RETURNS boolean 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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