-- Fix security warnings: Set search_path for functions

-- Update log_hr_permission_changes function with proper search_path
CREATE OR REPLACE FUNCTION public.log_hr_permission_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log when HR permissions are granted or revoked
  IF OLD.hr_permissions != NEW.hr_permissions THEN
    INSERT INTO public.staff_activity_logs (
      staff_id,
      action_type,
      description,
      entity_type,
      entity_id,
      details
    ) VALUES (
      auth.uid(),
      CASE WHEN NEW.hr_permissions THEN 'hr_permission_granted' ELSE 'hr_permission_revoked' END,
      CASE WHEN NEW.hr_permissions 
           THEN 'Granted HR permissions to: ' || NEW.email 
           ELSE 'Revoked HR permissions from: ' || NEW.email 
      END,
      'staff',
      NEW.id,
      jsonb_build_object(
        'target_email', NEW.email,
        'target_role', NEW.role,
        'previous_hr_permissions', OLD.hr_permissions,
        'new_hr_permissions', NEW.hr_permissions,
        'timestamp', NOW()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;