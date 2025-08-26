-- Final security fix: Address remaining search_path issues and extension updates

-- Fix remaining functions that may not have proper search_path set
-- These are some functions that commonly need search_path fixes

-- Fix validate_staff_action function if it exists
CREATE OR REPLACE FUNCTION public.validate_staff_action(
  staff_id uuid, 
  action_type text, 
  resource_type text DEFAULT NULL, 
  target_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
    PERFORM public.log_security_event(
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
  
  -- Super admins can do everything
  IF staff_role = 'super_admin' THEN
    RETURN TRUE;
  END IF;
  
  -- Check specific permissions for other roles
  CASE action_type
    WHEN 'moderate_content' THEN
      RETURN staff_role IN ('admin', 'moderator');
    WHEN 'manage_users' THEN
      RETURN staff_role = 'admin';
    WHEN 'access_hr_data' THEN
      SELECT hr_permissions INTO is_valid 
      FROM public.staff 
      WHERE id = staff_id;
      RETURN COALESCE(is_valid, FALSE) OR staff_role IN ('admin', 'super_admin');
    ELSE
      -- Default deny for unknown actions
      RETURN FALSE;
  END CASE;
END;
$$;

-- Ensure handle_new_user function has proper search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, first_name, last_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(
        NEW.raw_user_meta_data->>'display_name',
        TRIM(NULLIF(CONCAT(NEW.raw_user_meta_data->>'first_name', ' ', NEW.raw_user_meta_data->>'last_name'), ' ')),
        NEW.raw_user_meta_data->>'username',
        split_part(NEW.email, '@', 1),
        'New User'
    ),
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'user_role', 'user')
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error creating user profile: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Update extensions to latest versions (this addresses the extension version warning)
-- Update uuid-ossp extension to latest version
ALTER EXTENSION "uuid-ossp" UPDATE;

-- Update other commonly used extensions if they exist
DO $$
BEGIN
  -- Update pg_crypto if it exists
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto') THEN
    ALTER EXTENSION "pgcrypto" UPDATE;
  END IF;
  
  -- Update other extensions as needed
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_stat_statements') THEN
    ALTER EXTENSION "pg_stat_statements" UPDATE;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Extensions may not exist or may already be latest version
    NULL;
END $$;