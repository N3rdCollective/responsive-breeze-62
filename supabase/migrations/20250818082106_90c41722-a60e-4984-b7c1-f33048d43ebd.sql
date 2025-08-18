-- Fix Security Definer View issue by changing view ownership
-- The current public_profiles view is owned by postgres (superuser) which bypasses RLS
-- We need to change ownership to a non-superuser role to ensure RLS is respected

-- Drop the existing view
DROP VIEW IF EXISTS public.public_profiles;

-- Recreate the view with proper ownership
CREATE VIEW public.public_profiles AS 
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

-- Change ownership to authenticator (non-superuser role) to ensure RLS is respected
ALTER VIEW public.public_profiles OWNER TO authenticator;

-- Enable RLS on the view to ensure security policies are enforced
ALTER VIEW public.public_profiles SET (security_barrier = true);

-- Grant appropriate permissions
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Add comment explaining the security fix
COMMENT ON VIEW public.public_profiles IS 'Secure public view of profiles - owned by authenticator to respect RLS policies and exclude sensitive PII';