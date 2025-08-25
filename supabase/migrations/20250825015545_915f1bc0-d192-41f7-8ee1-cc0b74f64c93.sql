-- Drop existing insecure public profile functions
DROP FUNCTION IF EXISTS public.get_public_profile_by_id(uuid);
DROP FUNCTION IF EXISTS public.get_public_profile_by_username(text);
DROP FUNCTION IF EXISTS public.get_public_profile_data(uuid);

-- Create secure function to get public profile by username with privacy controls
CREATE OR REPLACE FUNCTION public.get_public_profile_by_username(p_username text)
RETURNS TABLE(
  id uuid, 
  username text, 
  display_name text, 
  profile_picture text, 
  bio text, 
  created_at timestamp with time zone, 
  forum_post_count integer, 
  social_links jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  target_profile_id uuid;
  current_user_id uuid;
  profile_is_public boolean;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  -- Get target profile info
  SELECT p.id, COALESCE(p.is_public, false) 
  INTO target_profile_id, profile_is_public
  FROM public.profiles p
  WHERE p.username = p_username;
  
  -- If profile doesn't exist, return empty
  IF target_profile_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Check access permissions:
  -- 1. Profile is public, OR
  -- 2. Current user is viewing their own profile, OR  
  -- 3. Current user is staff (for moderation)
  IF NOT (
    profile_is_public OR 
    current_user_id = target_profile_id OR
    EXISTS(SELECT 1 FROM public.staff WHERE id = current_user_id)
  ) THEN
    -- Log unauthorized access attempt
    PERFORM public.log_security_event(
      'unauthorized_profile_access',
      current_user_id,
      NULL,
      NULL,
      jsonb_build_object(
        'target_profile_id', target_profile_id,
        'target_username', p_username,
        'access_method', 'username_lookup',
        'reason', 'private_profile'
      ),
      'medium'
    );
    RETURN;
  END IF;
  
  -- Log legitimate access
  PERFORM public.log_profile_access_secure(
    target_profile_id,
    'public_profile_view',
    CASE 
      WHEN current_user_id = target_profile_id THEN 'own_profile_access'
      WHEN EXISTS(SELECT 1 FROM public.staff WHERE id = current_user_id) THEN 'staff_moderation'
      ELSE 'public_profile_access'
    END,
    ARRAY['username', 'display_name', 'profile_picture', 'bio', 'created_at', 'forum_post_count', 'social_links']
  );
  
  -- Return the profile data
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
  WHERE p.username = p_username;
END;
$$;

-- Create secure function to get public profile by ID with privacy controls
CREATE OR REPLACE FUNCTION public.get_public_profile_by_id(p_id uuid)
RETURNS TABLE(
  id uuid, 
  username text, 
  display_name text, 
  profile_picture text, 
  bio text, 
  created_at timestamp with time zone, 
  forum_post_count integer, 
  social_links jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_id uuid;
  profile_is_public boolean;
  target_username text;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  -- Get target profile info
  SELECT COALESCE(p.is_public, false), p.username 
  INTO profile_is_public, target_username
  FROM public.profiles p
  WHERE p.id = p_id;
  
  -- If profile doesn't exist, return empty
  IF target_username IS NULL THEN
    RETURN;
  END IF;
  
  -- Check access permissions:
  -- 1. Profile is public, OR
  -- 2. Current user is viewing their own profile, OR  
  -- 3. Current user is staff (for moderation)
  IF NOT (
    profile_is_public OR 
    current_user_id = p_id OR
    EXISTS(SELECT 1 FROM public.staff WHERE id = current_user_id)
  ) THEN
    -- Log unauthorized access attempt
    PERFORM public.log_security_event(
      'unauthorized_profile_access',
      current_user_id,
      NULL,
      NULL,
      jsonb_build_object(
        'target_profile_id', p_id,
        'target_username', target_username,
        'access_method', 'id_lookup',
        'reason', 'private_profile'
      ),
      'medium'
    );
    RETURN;
  END IF;
  
  -- Log legitimate access
  PERFORM public.log_profile_access_secure(
    p_id,
    'public_profile_view',
    CASE 
      WHEN current_user_id = p_id THEN 'own_profile_access'
      WHEN EXISTS(SELECT 1 FROM public.staff WHERE id = current_user_id) THEN 'staff_moderation'
      ELSE 'public_profile_access'
    END,
    ARRAY['username', 'display_name', 'profile_picture', 'bio', 'created_at', 'forum_post_count', 'social_links']
  );
  
  -- Return the profile data
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
  WHERE p.id = p_id;
END;
$$;

-- Create secure function to get basic profile data with privacy controls
CREATE OR REPLACE FUNCTION public.get_public_profile_data(profile_id uuid)
RETURNS TABLE(
  id uuid, 
  username text, 
  display_name text, 
  profile_picture text, 
  bio text, 
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_id uuid;
  profile_is_public boolean;
  target_username text;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  -- Get target profile info
  SELECT COALESCE(p.is_public, false), p.username 
  INTO profile_is_public, target_username
  FROM public.profiles p
  WHERE p.id = profile_id;
  
  -- If profile doesn't exist, return empty
  IF target_username IS NULL THEN
    RETURN;
  END IF;
  
  -- Check access permissions:
  -- 1. Profile is public, OR
  -- 2. Current user is viewing their own profile, OR  
  -- 3. Current user is staff (for moderation)
  IF NOT (
    profile_is_public OR 
    current_user_id = profile_id OR
    EXISTS(SELECT 1 FROM public.staff WHERE id = current_user_id)
  ) THEN
    -- Log unauthorized access attempt
    PERFORM public.log_security_event(
      'unauthorized_profile_access',
      current_user_id,
      NULL,
      NULL,
      jsonb_build_object(
        'target_profile_id', profile_id,
        'target_username', target_username,
        'access_method', 'data_lookup',
        'reason', 'private_profile'
      ),
      'medium'
    );
    RETURN;
  END IF;
  
  -- Log legitimate access
  PERFORM public.log_profile_access_secure(
    profile_id,
    'basic_profile_view',
    CASE 
      WHEN current_user_id = profile_id THEN 'own_profile_access'
      WHEN EXISTS(SELECT 1 FROM public.staff WHERE id = current_user_id) THEN 'staff_moderation'
      ELSE 'public_profile_access'
    END,
    ARRAY['username', 'display_name', 'profile_picture', 'bio', 'created_at']
  );
  
  -- Return the profile data
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.display_name,
    p.profile_picture,
    p.bio,
    p.created_at
  FROM public.profiles p
  WHERE p.id = profile_id;
END;
$$;

-- Add rate limiting function to prevent bulk scraping
CREATE OR REPLACE FUNCTION public.check_profile_access_rate_limit(user_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  access_count integer := 0;
  identifier uuid;
BEGIN
  -- Use user_id if authenticated, otherwise use a placeholder for anonymous
  identifier := COALESCE(user_id, '00000000-0000-0000-0000-000000000000'::uuid);
  
  -- Count profile access attempts in the last 5 minutes
  SELECT COUNT(*) INTO access_count
  FROM public.profile_access_audit
  WHERE accessor_id = identifier
    AND created_at > NOW() - INTERVAL '5 minutes'
    AND access_type LIKE '%profile%';
  
  -- Allow up to 30 profile views per 5 minutes
  RETURN access_count < 30;
END;
$$;