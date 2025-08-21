-- Fix search path security issues for the functions we just created

-- Fix get_public_profile_safe function
CREATE OR REPLACE FUNCTION public.get_public_profile_safe(profile_user_id uuid)
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
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
  WHERE p.id = profile_user_id;
$$;

-- Fix get_public_profile_by_username function
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
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;

-- Fix get_public_profile_by_id function
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
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;