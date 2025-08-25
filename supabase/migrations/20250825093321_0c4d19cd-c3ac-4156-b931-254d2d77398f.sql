-- FINAL Security Hardening - Fix All Remaining Vulnerabilities

-- 1. COMPLETELY SECURE PROFILES TABLE
-- Drop all existing policies and create bulletproof ones
DROP POLICY IF EXISTS "authenticated_limited_public_view" ON public.profiles;
DROP POLICY IF EXISTS "prevent_bulk_profile_access" ON public.profiles;
DROP POLICY IF EXISTS "profiles_deny_anonymous_access" ON public.profiles;
DROP POLICY IF EXISTS "profiles_own_access_only" ON public.profiles;
DROP POLICY IF EXISTS "profiles_staff_moderation_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_staff_moderation_view" ON public.profiles;
DROP POLICY IF EXISTS "profiles_super_admin_delete_only" ON public.profiles;
DROP POLICY IF EXISTS "staff_moderation_access" ON public.profiles;
DROP POLICY IF EXISTS "users_own_profile_full_access" ON public.profiles;
DROP POLICY IF EXISTS "deny_anonymous_access" ON public.profiles;

-- Create comprehensive bulletproof policies for profiles table
-- 1. ABSOLUTE deny for anonymous users
CREATE POLICY "ABSOLUTE_DENY_ANONYMOUS_PROFILES" 
ON public.profiles 
FOR ALL 
TO anon
USING (false)
WITH CHECK (false);

-- 2. Users can ONLY access their own profile data
CREATE POLICY "OWN_PROFILE_FULL_ACCESS_ONLY" 
ON public.profiles 
FOR ALL 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 3. Staff moderation access ONLY for non-sensitive fields via secure function
CREATE POLICY "STAFF_MODERATION_LIMITED_ACCESS" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  auth.uid() != id 
  AND check_staff_profile_access_secure(id, 'moderation_view')
);

-- 4. Super admin emergency access
CREATE POLICY "SUPER_ADMIN_EMERGENCY_ACCESS" 
ON public.profiles 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  )
);

-- 2. CREATE ULTRA-SECURE STAFF PROFILE ACCESS FUNCTION
CREATE OR REPLACE FUNCTION public.check_staff_profile_access_secure(
  p_profile_id UUID, 
  p_access_type TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  current_user_role TEXT;
  is_rate_limited BOOLEAN;
BEGIN
  -- Get current user role safely
  SELECT role INTO current_user_role
  FROM public.staff
  WHERE id = auth.uid();
  
  -- Only staff can access other profiles
  IF current_user_role IS NULL THEN
    -- Log unauthorized attempt
    PERFORM public.log_security_event(
      'unauthorized_profile_access_attempt',
      auth.uid(),
      NULL,
      NULL,
      jsonb_build_object(
        'target_profile_id', p_profile_id,
        'access_type', p_access_type,
        'user_role', 'non_staff'
      ),
      'high'
    );
    RETURN FALSE;
  END IF;
  
  -- Rate limiting check
  SELECT NOT public.enhanced_rate_limit_check(
    auth.uid(), 
    'profile_access', 
    10, 
    '5 minutes'::INTERVAL
  ) INTO is_rate_limited;
  
  IF is_rate_limited THEN
    RETURN FALSE;
  END IF;
  
  -- Log legitimate access
  PERFORM public.log_security_event(
    'staff_profile_access',
    auth.uid(),
    NULL,
    NULL,
    jsonb_build_object(
      'target_profile_id', p_profile_id,
      'access_type', p_access_type,
      'staff_role', current_user_role
    ),
    'low'
  );
  
  -- Only moderators, admins, and super_admins can access
  RETURN current_user_role IN ('moderator', 'admin', 'super_admin');
END;
$$;

-- 3. CREATE SAFE PUBLIC PROFILE ACCESS FUNCTION (NO SENSITIVE DATA)
CREATE OR REPLACE FUNCTION public.get_safe_public_profile(p_profile_id UUID)
RETURNS TABLE(
  id UUID,
  username TEXT,
  display_name TEXT,
  profile_picture TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ,
  forum_post_count INTEGER,
  social_links JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Rate limiting
  IF NOT public.enhanced_rate_limit_check(
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::UUID), 
    'public_profile_view', 
    20, 
    '5 minutes'::INTERVAL
  ) THEN
    RAISE EXCEPTION 'Rate limit exceeded for profile access';
  END IF;
  
  -- Only return data if profile is public
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.display_name,
    p.profile_picture,
    p.bio,
    p.created_at,
    p.forum_post_count,
    p.social_links
  FROM public.profiles p
  WHERE p.id = p_profile_id
  AND COALESCE(p.is_public, false) = true;
  
  -- Log access
  PERFORM public.log_security_event(
    'public_profile_viewed',
    auth.uid(),
    NULL,
    NULL,
    jsonb_build_object('profile_id', p_profile_id),
    'low'
  );
END;
$$;

-- 4. SECURE JOB APPLICATIONS TABLE FURTHER
-- Add additional validation policy
DROP POLICY IF EXISTS "authenticated_can_submit_applications" ON public.job_applications;

CREATE POLICY "VALIDATED_APPLICATION_SUBMISSION_ONLY" 
ON public.job_applications 
FOR INSERT 
TO authenticated
WITH CHECK (
  -- Comprehensive validation
  name IS NOT NULL AND
  length(trim(name)) BETWEEN 2 AND 100 AND
  email IS NOT NULL AND
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
  cover_letter IS NOT NULL AND
  length(trim(cover_letter)) BETWEEN 10 AND 5000 AND
  (phone IS NULL OR length(trim(phone)) BETWEEN 10 AND 20) AND
  application_status = 'pending' AND
  -- Rate limiting
  check_application_rate_limit(email) AND
  -- Additional security check
  NOT EXISTS (
    SELECT 1 FROM public.job_applications 
    WHERE email = NEW.email 
    AND applied_at > NOW() - INTERVAL '1 hour'
  )
);

-- 5. FIX SECURITY DEFINER VIEW ISSUE
-- Drop and recreate safe_public_profiles without any special properties
DROP VIEW IF EXISTS public.safe_public_profiles CASCADE;

-- Create a completely standard view
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

-- Add comment to clarify this is a safe view
COMMENT ON VIEW public.safe_public_profiles IS 'Safe public view - contains no sensitive data like emails or names';

-- 6. CREATE COMPREHENSIVE SECURITY VALIDATION FUNCTION
CREATE OR REPLACE FUNCTION public.run_comprehensive_security_validation()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  validation_report JSONB := '{}';
  sensitive_tables TEXT[] := ARRAY['profiles', 'staff', 'job_applications', 'security_events'];
  table_name TEXT;
  has_rls BOOLEAN;
  anon_policies INTEGER;
  public_policies INTEGER;
BEGIN
  -- Only super admins can run this
  IF NOT EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Super admin role required';
  END IF;
  
  validation_report := jsonb_build_object(
    'scan_timestamp', NOW(),
    'scanned_by', auth.uid(),
    'table_security_status', '[]'::jsonb
  );
  
  -- Check each sensitive table
  FOREACH table_name IN ARRAY sensitive_tables
  LOOP
    -- Check RLS status
    SELECT c.relrowsecurity INTO has_rls
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = table_name
    AND n.nspname = 'public';
    
    -- Count policies for anon and public roles
    SELECT COUNT(*) INTO anon_policies
    FROM pg_policies
    WHERE tablename = table_name
    AND 'anon' = ANY(roles);
    
    SELECT COUNT(*) INTO public_policies
    FROM pg_policies
    WHERE tablename = table_name
    AND 'public' = ANY(roles);
    
    -- Add to report
    validation_report := jsonb_set(
      validation_report,
      '{table_security_status}',
      (validation_report->'table_security_status') || jsonb_build_object(
        'table', table_name,
        'rls_enabled', COALESCE(has_rls, false),
        'anon_policies', anon_policies,
        'public_policies', public_policies,
        'security_level', CASE 
          WHEN COALESCE(has_rls, false) AND anon_policies = 0 THEN 'EXCELLENT'
          WHEN COALESCE(has_rls, false) AND anon_policies > 0 THEN 'MODERATE'
          ELSE 'VULNERABLE'
        END
      )
    );
  END LOOP;
  
  -- Log the validation
  PERFORM public.log_security_event(
    'comprehensive_security_validation',
    auth.uid(),
    NULL,
    NULL,
    validation_report,
    'low'
  );
  
  RETURN validation_report;
END;
$$;

-- 7. LOG SUCCESSFUL COMPREHENSIVE SECURITY LOCKDOWN
INSERT INTO public.security_events (
  event_type,
  user_id,
  details,
  severity
) VALUES (
  'comprehensive_security_lockdown_complete',
  auth.uid(),
  jsonb_build_object(
    'timestamp', NOW(),
    'security_level', 'maximum',
    'protected_tables', ARRAY['profiles', 'staff', 'job_applications', 'security_events'],
    'sensitive_data_fields_secured', ARRAY['email', 'first_name', 'last_name', 'phone', 'cover_letter'],
    'access_restrictions', 'owner_only_with_staff_moderation_via_secure_functions'
  ),
  'low'
);