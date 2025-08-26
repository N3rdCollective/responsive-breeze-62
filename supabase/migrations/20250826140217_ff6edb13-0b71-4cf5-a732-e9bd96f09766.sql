-- Fix security linter warnings by properly dropping and recreating functions

-- Drop and recreate functions with proper search_path to fix security warnings

-- Drop existing functions that need to be updated
DROP FUNCTION IF EXISTS public.log_security_event(text,uuid,inet,text,jsonb,text);
DROP FUNCTION IF EXISTS public.log_profile_access_secure(uuid,text,text,text[]);

-- Recreate log_security_event with proper search_path
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type text,
  p_user_id uuid DEFAULT NULL,
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_details jsonb DEFAULT NULL,
  p_severity text DEFAULT 'medium'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.security_events (
    event_type,
    user_id,
    ip_address,
    user_agent,
    details,
    severity
  ) VALUES (
    p_event_type,
    p_user_id,
    p_ip_address,
    p_user_agent,
    p_details,
    p_severity
  );
END;
$$;

-- Recreate log_profile_access_secure with proper search_path
CREATE OR REPLACE FUNCTION public.log_profile_access_secure(
  p_target_profile_id uuid,
  p_access_type text,
  p_access_reason text DEFAULT NULL,
  p_accessed_fields text[] DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only log if user is staff or accessing own profile
  IF auth.uid() = p_target_profile_id OR EXISTS (
    SELECT 1 FROM public.staff WHERE id = auth.uid()
  ) THEN
    INSERT INTO public.profile_access_audit (
      accessor_id,
      target_profile_id,
      access_type,
      access_reason,
      accessed_fields
    ) VALUES (
      auth.uid(),
      p_target_profile_id,
      p_access_type,
      p_access_reason,
      p_accessed_fields
    );
  END IF;
END;
$$;