-- HR Data Access Security Fix
-- Add HR permissions column to staff table
ALTER TABLE public.staff 
ADD COLUMN hr_permissions boolean NOT NULL DEFAULT false;

-- Add comment to document the sensitive nature of this permission
COMMENT ON COLUMN public.staff.hr_permissions IS 'SENSITIVE: Grants access to confidential job application data including personal information';

-- Update job_applications RLS policies to restrict access to HR personnel only

-- Drop existing overly broad policies
DROP POLICY IF EXISTS "hr_staff_view_applications" ON public.job_applications;
DROP POLICY IF EXISTS "hr_staff_update_applications" ON public.job_applications;

-- Create new HR-specific policies
CREATE POLICY "hr_personnel_view_applications" 
ON public.job_applications 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.staff s
    WHERE s.id = auth.uid() 
    AND (s.hr_permissions = true OR s.role = 'super_admin')
  )
);

CREATE POLICY "hr_personnel_update_applications" 
ON public.job_applications 
FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.staff s
    WHERE s.id = auth.uid() 
    AND (s.hr_permissions = true OR s.role = 'super_admin')
  )
) 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.staff s
    WHERE s.id = auth.uid() 
    AND (s.hr_permissions = true OR s.role = 'super_admin')
  )
);

-- Add audit logging trigger for HR permissions changes
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

-- Create trigger for HR permission changes
DROP TRIGGER IF EXISTS log_hr_permission_changes_trigger ON public.staff;
CREATE TRIGGER log_hr_permission_changes_trigger
  AFTER UPDATE ON public.staff
  FOR EACH ROW
  EXECUTE FUNCTION public.log_hr_permission_changes();