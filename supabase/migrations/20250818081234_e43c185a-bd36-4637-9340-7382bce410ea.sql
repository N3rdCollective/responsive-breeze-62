-- Fix critical security vulnerability in profiles table (corrected)
-- Remove the dangerous policy that exposes all profile data publicly
DROP POLICY IF EXISTS "Public can view basic profile info" ON public.profiles;

-- Drop and recreate the function with the updated signature
DROP FUNCTION IF EXISTS public.get_public_profile_safe(uuid);

-- Create a secure public view that only exposes safe, non-sensitive profile fields
CREATE OR REPLACE VIEW public.public_profiles AS 
SELECT 
  id,
  username,
  display_name,
  profile_picture,
  bio,
  created_at,
  forum_post_count,
  social_links
FROM public.profiles;

-- Allow public read access to the safe view
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Recreate the safe function with updated return type
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
  WHERE p.id = profile_user_id;
$$;

-- Add security comments
COMMENT ON VIEW public.public_profiles IS 'Secure public view of profiles - excludes sensitive PII like email, first_name, last_name';
COMMENT ON FUNCTION public.get_public_profile_safe IS 'Secure function for public profile data - excludes sensitive information';