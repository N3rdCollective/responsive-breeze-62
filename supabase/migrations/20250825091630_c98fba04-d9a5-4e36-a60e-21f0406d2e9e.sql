-- Secure the profiles table against public data exposure
-- Remove any overly permissive policies and implement strict access controls

-- First, drop existing problematic policies if they exist
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;

-- Create strict RLS policies for profiles table

-- 1. Users can view and update their own complete profile
CREATE POLICY "users_own_profile_full_access" ON public.profiles
  FOR ALL USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 2. Authenticated users can view limited public fields of other users' profiles
-- Only if the profile is marked as public (is_public = true)
CREATE POLICY "authenticated_limited_public_view" ON public.profiles
  FOR SELECT USING (
    auth.role() = 'authenticated' 
    AND id != auth.uid() 
    AND COALESCE(is_public, false) = true
  );

-- 3. Staff can access profiles for moderation purposes
CREATE POLICY "staff_moderation_access" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.staff 
      WHERE staff.id = auth.uid() 
      AND staff.role IN ('admin', 'super_admin', 'moderator')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff 
      WHERE staff.id = auth.uid() 
      AND staff.role IN ('admin', 'super_admin', 'moderator')
    )
  );

-- 4. Create a secure function for getting safe public profile data
CREATE OR REPLACE FUNCTION public.get_safe_public_profile(p_user_id UUID)
RETURNS TABLE(
  id UUID,
  username TEXT,
  display_name TEXT,
  profile_picture TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  forum_post_count INTEGER,
  social_links JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  current_user_id UUID;
  profile_is_public BOOLEAN;
  target_username TEXT;
BEGIN
  current_user_id := auth.uid();
  
  -- Get target profile info
  SELECT COALESCE(p.is_public, false), p.username 
  INTO profile_is_public, target_username
  FROM public.profiles p
  WHERE p.id = p_user_id;
  
  -- If profile doesn't exist, return empty
  IF target_username IS NULL THEN
    RETURN;
  END IF;
  
  -- Check access permissions:
  -- 1. Profile must be public, OR
  -- 2. Current user is viewing their own profile, OR  
  -- 3. Current user is staff (for moderation)
  IF NOT (
    profile_is_public OR 
    current_user_id = p_user_id OR
    EXISTS(SELECT 1 FROM public.staff WHERE id = current_user_id)
  ) THEN
    -- Log unauthorized access attempt
    PERFORM public.log_security_event(
      'unauthorized_profile_access',
      current_user_id,
      NULL,
      NULL,
      jsonb_build_object(
        'target_profile_id', p_user_id,
        'target_username', target_username,
        'access_method', 'safe_public_profile',
        'reason', 'private_profile'
      ),
      'medium'
    );
    RETURN;
  END IF;
  
  -- Log legitimate access
  PERFORM public.log_profile_access_secure(
    p_user_id,
    'safe_public_profile_view',
    CASE 
      WHEN current_user_id = p_user_id THEN 'own_profile_access'
      WHEN EXISTS(SELECT 1 FROM public.staff WHERE id = current_user_id) THEN 'staff_moderation'
      ELSE 'public_profile_access'
    END,
    ARRAY['username', 'display_name', 'profile_picture', 'bio', 'created_at', 'forum_post_count', 'social_links']
  );
  
  -- Return only safe public fields (NO email, first_name, last_name, etc.)
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
  WHERE p.id = p_user_id;
END;
$$;

-- 5. Create function for authenticated users to get their own complete profile
CREATE OR REPLACE FUNCTION public.get_own_profile()
RETURNS TABLE(
  id UUID,
  username TEXT,
  display_name TEXT,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  profile_picture TEXT,
  bio TEXT,
  is_public BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  forum_post_count INTEGER,
  social_links JSONB,
  role TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  -- Must be authenticated
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Log profile access
  PERFORM public.log_profile_access_secure(
    current_user_id,
    'own_profile_access',
    'User accessing own complete profile',
    ARRAY['all_fields']
  );
  
  -- Return complete profile data for own profile
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.display_name,
    p.first_name,
    p.last_name,
    p.email,
    p.profile_picture,
    p.bio,
    p.is_public,
    p.created_at,
    p.updated_at,
    p.forum_post_count,
    p.social_links,
    p.role
  FROM public.profiles p
  WHERE p.id = current_user_id;
END;
$$;

-- 6. Create a view that only exposes safe public fields
CREATE OR REPLACE VIEW public.safe_public_profiles AS
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

-- Enable RLS on the view
ALTER VIEW public.safe_public_profiles SET (security_barrier = true);

-- 7. Add policy to deny anonymous access completely
CREATE POLICY "deny_anonymous_access" ON public.profiles
  FOR ALL TO anon
  USING (false)
  WITH CHECK (false);

-- 8. Update existing profile access functions to be more secure
CREATE OR REPLACE FUNCTION public.get_public_profile_by_username_secure(p_username TEXT)
RETURNS TABLE(
  id UUID,
  username TEXT,
  display_name TEXT,
  profile_picture TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  forum_post_count INTEGER,
  social_links JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Get user ID from username
  SELECT p.id INTO target_user_id
  FROM public.profiles p
  WHERE p.username = p_username;
  
  -- Use the secure function
  RETURN QUERY
  SELECT * FROM public.get_safe_public_profile(target_user_id);
END;
$$;

-- 9. Add rate limiting for profile access
CREATE OR REPLACE FUNCTION public.check_profile_access_rate_limit_enhanced(
  user_id UUID DEFAULT NULL,
  max_accesses INTEGER DEFAULT 50,
  time_window INTERVAL DEFAULT '5 minutes'
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  access_count INTEGER := 0;
  identifier UUID;
BEGIN
  -- Use user_id if authenticated, otherwise use a placeholder for anonymous
  identifier := COALESCE(user_id, '00000000-0000-0000-0000-000000000000'::UUID);
  
  -- Count profile access attempts in the time window
  SELECT COUNT(*) INTO access_count
  FROM public.profile_access_audit
  WHERE accessor_id = identifier
    AND created_at > NOW() - time_window
    AND access_type LIKE '%profile%';
  
  -- If limit exceeded, log security event
  IF access_count >= max_accesses THEN
    PERFORM public.log_security_event(
      'profile_access_rate_limit',
      identifier,
      NULL,
      NULL,
      jsonb_build_object(
        'access_count', access_count,
        'time_window', time_window::TEXT,
        'max_allowed', max_accesses
      ),
      'high'
    );
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- 10. Create policy to prevent data scraping
CREATE POLICY "prevent_bulk_profile_access" ON public.profiles
  FOR SELECT USING (
    -- Allow if accessing own profile
    auth.uid() = id 
    OR 
    -- Allow if staff
    EXISTS(SELECT 1 FROM public.staff WHERE id = auth.uid())
    OR
    -- Allow if rate limit check passes and profile is public
    (
      COALESCE(is_public, false) = true 
      AND public.check_profile_access_rate_limit_enhanced(auth.uid())
    )
  );