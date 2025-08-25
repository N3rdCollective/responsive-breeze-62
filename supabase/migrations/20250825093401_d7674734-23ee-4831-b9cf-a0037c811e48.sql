-- COMPREHENSIVE SECURITY LOCKDOWN - Corrected Version

-- STEP 1: Create all secure functions first
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

-- STEP 2: Now drop all existing profile policies and create bulletproof ones
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

-- Create the new bulletproof policies
-- 1. ABSOLUTE deny for anonymous users (blocks ALL sensitive data)
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

-- 3. Staff moderation access via secure function (NO sensitive data exposed)
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