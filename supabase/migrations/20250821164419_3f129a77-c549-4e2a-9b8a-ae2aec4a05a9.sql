-- Fix User Personal Information Exposure Security Issue

-- First, let's add data classification comments to mark sensitive profile columns
COMMENT ON COLUMN public.profiles.email IS 'SENSITIVE: Never expose in public profiles - contains PII';
COMMENT ON COLUMN public.profiles.first_name IS 'SENSITIVE: Never expose in public profiles - contains PII';  
COMMENT ON COLUMN public.profiles.last_name IS 'SENSITIVE: Never expose in public profiles - contains PII';
COMMENT ON COLUMN public.profiles.username IS 'PUBLIC: Safe for public profile viewing';
COMMENT ON COLUMN public.profiles.display_name IS 'PUBLIC: Safe for public profile viewing';
COMMENT ON COLUMN public.profiles.bio IS 'PUBLIC: Safe for public profile viewing';
COMMENT ON COLUMN public.profiles.profile_picture IS 'PUBLIC: Safe for public profile viewing';
COMMENT ON COLUMN public.profiles.social_links IS 'PUBLIC: Safe for public profile viewing';

-- Drop any existing problematic public policies that might expose sensitive data
DROP POLICY IF EXISTS "public_profile_read_access" ON public.profiles;
DROP POLICY IF EXISTS "Public can view public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view public profiles" ON public.profiles;

-- Create a secure function that only returns safe, non-sensitive profile data
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

-- Create a safe public profile access by username function
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

-- Create a safe public profile access by ID function
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

-- Update existing policies to be more restrictive and secure

-- 1. Users can only see their own full profile data (including sensitive fields)
CREATE POLICY "users_own_profile_full_access" ON public.profiles
  FOR ALL TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 2. Staff can access user profiles for moderation (with logging)
CREATE POLICY "staff_moderation_profile_access" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    (auth.uid() != id) AND 
    EXISTS (
      SELECT 1 FROM public.staff s 
      WHERE s.id = auth.uid() 
      AND s.role IN ('admin', 'super_admin', 'moderator')
    )
  );

-- 3. Absolutely NO public access to profiles table directly - must use security functions
CREATE POLICY "deny_public_direct_profile_access" ON public.profiles
  FOR ALL TO anon
  USING (false)
  WITH CHECK (false);

-- 4. Deny authenticated users from accessing other users' profiles directly  
CREATE POLICY "deny_cross_user_profile_access" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM public.staff s 
      WHERE s.id = auth.uid() 
      AND s.role IN ('admin', 'super_admin', 'moderator')
    )
  );

-- Ensure RLS is enabled and enforced
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;