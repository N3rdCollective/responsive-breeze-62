
-- Fix the staff_permissions insert by providing the required resource_type and action_type columns
INSERT INTO public.staff_permissions (permission_name, description, resource_type, action_type) 
VALUES 
    ('user.suspend', 'Permission to suspend user accounts', 'user', 'suspend'),
    ('user.ban', 'Permission to ban user accounts', 'user', 'ban'),
    ('user.unban', 'Permission to unban/restore user accounts', 'user', 'unban'),
    ('user.view', 'Permission to view user accounts', 'user', 'view'),
    ('user_action.create', 'Permission to create user action logs', 'user_action', 'create')
ON CONFLICT (permission_name) DO NOTHING;

-- Make sure admin and super_admin roles have these permissions
-- First get the permission IDs
WITH permission_ids AS (
    SELECT id, permission_name 
    FROM staff_permissions 
    WHERE permission_name IN ('user.suspend', 'user.ban', 'user.unban', 'user.view', 'user_action.create')
)
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'admin', id FROM permission_ids
UNION ALL
SELECT 'super_admin', id FROM permission_ids
ON CONFLICT (role, permission_id) DO NOTHING;

-- Also fix the validate_staff_action function to handle the permission validation correctly
CREATE OR REPLACE FUNCTION public.validate_staff_action(
    staff_id uuid, 
    action_type text, 
    resource_type text DEFAULT NULL::text, 
    target_id uuid DEFAULT NULL::uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  permission_name TEXT;
  is_valid BOOLEAN := FALSE;
  staff_role TEXT;
BEGIN
  -- Get the staff member's role first
  SELECT role INTO staff_role 
  FROM public.staff 
  WHERE id = staff_id;
  
  -- If not a staff member, deny access
  IF staff_role IS NULL THEN
    RAISE LOG 'User % is not a staff member', staff_id;
    RETURN FALSE;
  END IF;
  
  -- Construct permission name from resource and action type
  IF resource_type IS NOT NULL THEN
    permission_name := resource_type || '.' || action_type;
  ELSE
    permission_name := action_type;
  END IF;
  
  RAISE LOG 'Checking permission: % for staff role: %', permission_name, staff_role;
  
  -- Check if staff has the required permission
  SELECT EXISTS (
    SELECT 1 
    FROM public.role_permissions rp
    JOIN public.staff_permissions sp ON rp.permission_id = sp.id
    WHERE rp.role = staff_role 
    AND sp.permission_name = permission_name
  ) INTO is_valid;
  
  RAISE LOG 'Permission validation result for %: %', permission_name, is_valid;
  
  -- Log the validation attempt
  INSERT INTO public.staff_activity_logs (
    staff_id, 
    action_type, 
    description,
    entity_type,
    entity_id,
    details
  ) VALUES (
    staff_id,
    'permission_check',
    'Permission validation for: ' || permission_name,
    resource_type,
    target_id,
    jsonb_build_object(
      'permission', permission_name,
      'staff_role', staff_role,
      'granted', is_valid,
      'timestamp', NOW()
    )
  );
  
  RETURN is_valid;
END;
$function$;
