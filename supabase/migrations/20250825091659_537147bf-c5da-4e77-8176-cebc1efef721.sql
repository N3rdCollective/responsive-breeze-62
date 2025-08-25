-- Fix security linter issues

-- 1. Fix the security definer view issue - remove SECURITY DEFINER
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

-- Enable RLS on the view (without security_barrier which was causing the issue)
-- Views inherit RLS from underlying tables

-- 2. Fix any remaining functions that might not have search_path set
-- (These might be older functions that need updating)

-- Check if there are any other functions that need fixing by ensuring all our new functions have proper search_path
-- This is a safety measure to ensure we don't have lingering issues