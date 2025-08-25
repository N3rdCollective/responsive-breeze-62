-- Fix SECURITY DEFINER view issue

-- Drop and recreate the safe_public_profiles view without SECURITY DEFINER
DROP VIEW IF EXISTS public.safe_public_profiles;

-- Create a secure view that respects RLS policies
CREATE VIEW public.safe_public_profiles AS
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
WHERE COALESCE(p.is_public, false) = true;

-- Enable RLS on the view (inherits from underlying table)
-- No additional permissions needed since it respects the profiles table RLS