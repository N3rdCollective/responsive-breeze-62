-- Fix security linter warnings

-- Fix search_path for functions that don't have it set
-- This prevents SQL injection via search_path manipulation

-- Update functions to have proper search_path
CREATE OR REPLACE FUNCTION public.audit_staff_table_changes()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public'
AS $$
BEGIN
  -- Log all staff table modifications
  INSERT INTO public.staff_activity_logs (
    staff_id,
    action_type,
    description,
    entity_type,
    entity_id,
    details
  ) VALUES (
    auth.uid(),
    TG_OP,
    CASE 
      WHEN TG_OP = 'INSERT' THEN 'Created staff record: ' || NEW.email
      WHEN TG_OP = 'UPDATE' THEN 'Updated staff record: ' || COALESCE(OLD.email, NEW.email)
      WHEN TG_OP = 'DELETE' THEN 'Deleted staff record: ' || OLD.email
    END,
    'staff',
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object(
      'operation', TG_OP,
      'old_values', CASE WHEN TG_OP != 'INSERT' THEN row_to_json(OLD) ELSE NULL END,
      'new_values', CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END,
      'timestamp', NOW()
    )
  );
  
  -- Alert on role changes
  IF TG_OP = 'UPDATE' AND OLD.role != NEW.role THEN
    PERFORM public.log_security_event(
      'staff_role_changed',
      auth.uid(),
      NULL,
      NULL,
      jsonb_build_object(
        'target_staff_id', NEW.id,
        'old_role', OLD.role,
        'new_role', NEW.role,
        'target_email', NEW.email
      ),
      'high'
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Update other functions that may have search_path issues
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