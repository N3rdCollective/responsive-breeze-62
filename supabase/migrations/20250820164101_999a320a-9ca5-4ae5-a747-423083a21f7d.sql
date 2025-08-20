-- FINAL SECURITY HARDENING: Fix linter warnings

-- ===========================================
-- 1. FIX FUNCTION SEARCH PATH MUTABLE (0011)
-- ===========================================

-- Update all existing security definer functions to have proper search_path
-- This prevents schema-based attacks

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = 'public'
AS $$
BEGIN
  -- Insert user profile, ignore if already exists to prevent conflicts
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

-- Fix staff permission functions
CREATE OR REPLACE FUNCTION public.staff_has_permission(user_id uuid, permission_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
  RETURN EXISTS (
    SELECT 1 
    FROM public.role_permissions rp
    JOIN public.staff_permissions sp ON rp.permission_id = sp.id
    WHERE rp.role = user_role 
    AND sp.permission_name = permission_name
  );
END;
$$;

-- Fix validate_staff_action function
CREATE OR REPLACE FUNCTION public.validate_staff_action(staff_id uuid, action_type text, resource_type text DEFAULT NULL::text, target_id uuid DEFAULT NULL::uuid)
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
  SELECT EXISTS (
    SELECT 1 
    FROM public.role_permissions rp
    JOIN public.staff_permissions sp ON rp.permission_id = sp.id
    WHERE rp.role = staff_role 
    AND sp.permission_name = permission_name
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
$$;

-- Fix other security definer functions
CREATE OR REPLACE FUNCTION public.get_user_role_simple(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role FROM public.profiles WHERE id = user_id LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_user_staff_simple(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (SELECT 1 FROM public.staff WHERE id = user_id);
$$;

CREATE OR REPLACE FUNCTION public.is_user_staff_member(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_staff_role(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role FROM public.staff 
  WHERE id = user_id
  LIMIT 1;
$$;

-- ===========================================
-- 2. UPDATE EXTENSION VERSIONS (0022)
-- ===========================================

-- Update common Supabase extensions to latest versions
-- Note: This might fail if extensions are already at latest versions
DO $$
BEGIN
  -- Update uuid-ossp extension
  BEGIN
    ALTER EXTENSION "uuid-ossp" UPDATE;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not update uuid-ossp extension: %', SQLERRM;
  END;
  
  -- Update extensions extension
  BEGIN
    ALTER EXTENSION "extensions" UPDATE;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not update extensions extension: %', SQLERRM;
  END;
  
  -- Update pgcrypto extension
  BEGIN
    ALTER EXTENSION "pgcrypto" UPDATE;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not update pgcrypto extension: %', SQLERRM;
  END;
  
  -- Update pgjwt extension
  BEGIN
    ALTER EXTENSION "pgjwt" UPDATE;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not update pgjwt extension: %', SQLERRM;
  END;
END $$;

-- ===========================================
-- 3. FINAL SECURITY VALIDATION
-- ===========================================

-- Ensure all critical tables have proper RLS enabled
DO $$
DECLARE
  table_record RECORD;
BEGIN
  -- Check critical tables have RLS enabled
  FOR table_record IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'staff', 'system_settings', 'homepage_content', 'auth_attempts', 'security_events')
  LOOP
    -- Enable RLS if not already enabled
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_record.tablename);
    RAISE NOTICE 'Ensured RLS is enabled for table: %', table_record.tablename;
  END LOOP;
END $$;