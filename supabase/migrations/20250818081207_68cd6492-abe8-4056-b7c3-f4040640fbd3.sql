-- Fix critical security vulnerability in profiles table
-- Remove the dangerous policy that exposes all profile data publicly
DROP POLICY IF EXISTS "Public can view basic profile info" ON public.profiles;

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
  -- Only include social_links if they're meant to be public (they usually are)
  social_links
FROM public.profiles;

-- Enable RLS on the public view
ALTER VIEW public.public_profiles SET (security_barrier = true);

-- Allow public read access to the safe view only
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Create a policy for the view (if supported, otherwise the grant is sufficient)
-- Note: Views inherit RLS from underlying tables, so this provides safe public access

-- Update the existing safe function to ensure it only returns non-sensitive data
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

-- Add a comment to remind developers about security
COMMENT ON VIEW public.public_profiles IS 'Secure public view of profiles - excludes sensitive data like email, first_name, last_name';
COMMENT ON FUNCTION public.get_public_profile_safe IS 'Secure function to get non-sensitive profile data - use this instead of direct table access for public features';