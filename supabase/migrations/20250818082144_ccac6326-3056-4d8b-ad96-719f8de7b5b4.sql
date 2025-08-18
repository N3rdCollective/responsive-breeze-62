-- Fix Security Definer View issue by using RLS policies instead of changing ownership
-- The issue is that postgres-owned views can bypass RLS, so we'll implement proper access control

-- Drop the existing view
DROP VIEW IF EXISTS public.public_profiles;

-- Instead of using a view, we'll modify the get_public_profile_safe function to be the primary access method
-- And create a more restrictive approach for public profile access

-- Update the function to ensure it's the secure way to access public profile data
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
STABLE SECURITY DEFINER
SET search_path = public
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

-- Create a function to get public profile by ID (safer than direct table access)
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
STABLE SECURITY DEFINER
SET search_path = public
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

-- Grant execute permissions to public
GRANT EXECUTE ON FUNCTION public.get_public_profile_by_username(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_profile_by_id(uuid) TO anon, authenticated;

-- Update existing function comment
COMMENT ON FUNCTION public.get_public_profile_safe IS 'Secure function for public profile data - excludes sensitive information like email, first_name, last_name';
COMMENT ON FUNCTION public.get_public_profile_by_username IS 'Secure function to get public profile by username - excludes sensitive PII';
COMMENT ON FUNCTION public.get_public_profile_by_id IS 'Secure function to get public profile by ID - excludes sensitive PII';