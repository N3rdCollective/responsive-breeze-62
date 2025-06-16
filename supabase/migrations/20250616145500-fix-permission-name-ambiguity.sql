
-- Fix the ambiguous permission_name column reference in staff permissions
CREATE OR REPLACE FUNCTION public.staff_has_permission(user_id uuid, permission_name text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  user_role TEXT;
BEGIN
  -- Get the staff member's role
  SELECT role INTO user_role 
  FROM public.staff 
  WHERE id = user_id;
  
  IF user_role IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if the role has the specific permission
  -- Fixed: Use table aliases to avoid ambiguous column reference
  RETURN EXISTS (
    SELECT 1 
    FROM public.role_permissions rp
    JOIN public.staff_permissions sp ON rp.permission_id = sp.id
    WHERE rp.role = user_role 
    AND sp.permission_name = permission_name  -- Explicitly use staff_permissions.permission_name
  );
END;
$function$

-- Also fix the validate_staff_action function
CREATE OR REPLACE FUNCTION public.validate_staff_action(staff_id uuid, action_type text, resource_type text DEFAULT NULL::text, target_id uuid DEFAULT NULL::uuid)
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
  
  -- If not a staff member, log security event and deny access
  IF staff_role IS NULL THEN
    PERFORM log_security_event(
      'unauthorized_access_attempt',
      staff_id,
      NULL,
      NULL,
      jsonb_build_object(
        'action_type', action_type,
        'resource_type', resource_type,
        'target_id', target_id
      ),
      'high'
    );
    RETURN FALSE;
  END IF;
  
  -- Construct permission name from resource and action type
  IF resource_type IS NOT NULL THEN
    permission_name := resource_type || '.' || action_type;
  ELSE
    permission_name := action_type;
  END IF;
  
  -- Check if staff has the required permission
  -- Fixed: Use table aliases to avoid ambiguous column reference
  SELECT EXISTS (
    SELECT 1 
    FROM public.role_permissions rp
    JOIN public.staff_permissions sp ON rp.permission_id = sp.id
    WHERE rp.role = staff_role 
    AND sp.permission_name = permission_name  -- Explicitly use staff_permissions.permission_name
  ) INTO is_valid;
  
  -- Log permission check
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
  
  -- Log security event if permission denied
  IF NOT is_valid THEN
    PERFORM log_security_event(
      'permission_denied',
      staff_id,
      NULL,
      NULL,
      jsonb_build_object(
        'permission', permission_name,
        'staff_role', staff_role,
        'action_type', action_type,
        'resource_type', resource_type
      ),
      'medium'
    );
  END IF;
  
  RETURN is_valid;
END;
$function$
