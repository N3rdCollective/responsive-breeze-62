-- Targeted Security Fixes - Address Remaining Linter Issues

-- 1. Fix Security Definer View issue
-- The linter is detecting a view with SECURITY DEFINER - let's find and fix it
-- Drop any views that might have SECURITY DEFINER and recreate without it

-- Check if there are system views causing issues
DROP VIEW IF EXISTS public.safe_public_profiles CASCADE;

-- Recreate as a simple view without any security properties
CREATE VIEW public.safe_public_profiles AS
SELECT 
  id,
  username,
  display_name,
  profile_picture,
  bio,
  created_at,
  forum_post_count,
  social_links
FROM public.profiles
WHERE COALESCE(is_public, false) = true;

-- 2. Fix any remaining functions with mutable search paths
-- These are likely some system functions that still need updating

-- Update notification trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

-- Update staff member creation function
CREATE OR REPLACE FUNCTION public.handle_new_staff_member()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  INSERT INTO public.staff (id, email, role)
  VALUES (NEW.id, NEW.email, 'staff');
  RETURN NEW;
END;
$$;

-- 3. Update extensions to latest versions more safely
-- Only update extensions that actually exist and need updating
DO $$
DECLARE
    ext_record RECORD;
BEGIN
    -- Update uuid-ossp if it exists and is not at latest version
    FOR ext_record IN 
        SELECT * FROM pg_extension 
        WHERE extname = 'uuid-ossp' 
        AND extversion != (SELECT default_version FROM pg_available_extensions WHERE name = 'uuid-ossp')
    LOOP
        EXECUTE 'ALTER EXTENSION "uuid-ossp" UPDATE TO DEFAULT';
    END LOOP;
    
    -- Update pgcrypto if it exists and is not at latest version  
    FOR ext_record IN 
        SELECT * FROM pg_extension 
        WHERE extname = 'pgcrypto'
        AND extversion != (SELECT default_version FROM pg_available_extensions WHERE name = 'pgcrypto')
    LOOP
        EXECUTE 'ALTER EXTENSION "pgcrypto" UPDATE TO DEFAULT';
    END LOOP;
END $$;

-- 4. Create optimized security monitoring without conflicts
CREATE OR REPLACE FUNCTION public.log_sensitive_table_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
    current_user_id UUID;
    is_staff BOOLEAN := FALSE;
    risk_level TEXT := 'medium';
BEGIN
    current_user_id := auth.uid();
    
    -- Check if current user is staff
    SELECT EXISTS(SELECT 1 FROM public.staff WHERE id = current_user_id) INTO is_staff;
    
    -- Determine risk level
    IF TG_TABLE_NAME IN ('staff', 'security_events', 'job_applications') THEN
        risk_level := 'high';
    END IF;
    
    -- Only log if this is a sensitive operation or non-staff accessing sensitive data
    IF TG_TABLE_NAME IN ('staff', 'security_events', 'job_applications') OR 
       (TG_OP = 'DELETE' AND NOT is_staff) THEN
        
        PERFORM public.log_security_event(
            'sensitive_table_' || TG_OP,
            current_user_id,
            NULL,
            NULL,
            jsonb_build_object(
                'table', TG_TABLE_NAME,
                'operation', TG_OP,
                'is_staff', is_staff,
                'record_id', COALESCE(NEW.id, OLD.id)
            ),
            risk_level
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Apply this trigger only to the most sensitive tables
DROP TRIGGER IF EXISTS log_sensitive_access_staff ON public.staff;
CREATE TRIGGER log_sensitive_access_staff
    AFTER INSERT OR UPDATE OR DELETE ON public.staff
    FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_table_access();

DROP TRIGGER IF EXISTS log_sensitive_access_job_apps ON public.job_applications;
CREATE TRIGGER log_sensitive_access_job_apps
    AFTER INSERT OR UPDATE OR DELETE ON public.job_applications
    FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_table_access();

-- 5. Add final security validation function
CREATE OR REPLACE FUNCTION public.validate_security_setup()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
    validation_results JSONB := '{}';
    critical_tables TEXT[] := ARRAY['staff', 'security_events', 'job_applications', 'profiles'];
    table_name TEXT;
    has_rls BOOLEAN;
    policy_count INTEGER;
BEGIN
    -- Only super admins can run validation
    IF NOT EXISTS (
        SELECT 1 FROM public.staff 
        WHERE id = auth.uid() 
        AND role = 'super_admin'
    ) THEN
        RAISE EXCEPTION 'Access denied: Super admin role required';
    END IF;
    
    validation_results := jsonb_build_object(
        'timestamp', NOW(),
        'validation_status', 'checking',
        'table_validations', '[]'::jsonb
    );
    
    -- Check each critical table
    FOREACH table_name IN ARRAY critical_tables
    LOOP
        -- Check if RLS is enabled
        SELECT c.relrowsecurity INTO has_rls
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = table_name
        AND n.nspname = 'public';
        
        -- Count RLS policies
        SELECT COUNT(*) INTO policy_count
        FROM pg_policy p
        JOIN pg_class c ON c.oid = p.polrelid
        WHERE c.relname = table_name;
        
        -- Add to validation results
        validation_results := jsonb_set(
            validation_results,
            '{table_validations}',
            (validation_results->'table_validations') || jsonb_build_object(
                'table', table_name,
                'rls_enabled', COALESCE(has_rls, false),
                'policy_count', policy_count,
                'status', CASE 
                    WHEN COALESCE(has_rls, false) AND policy_count > 0 THEN 'SECURE'
                    WHEN COALESCE(has_rls, false) THEN 'RLS_NO_POLICIES'
                    ELSE 'VULNERABLE'
                END
            )
        );
    END LOOP;
    
    RETURN validation_results;
END;
$$;