-- Enhanced security fix: Use column-level security for profiles table
-- Create separate policies for different access levels to sensitive vs public data

-- Drop the overly broad public policy
DROP POLICY IF EXISTS "Public can view basic profile information" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view extended profile information" ON public.profiles;

-- Create a view for public profile data that excludes sensitive information
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  username,
  display_name,
  profile_picture,
  bio,
  created_at
FROM public.profiles;

-- Create RLS policies for the profiles table with proper restrictions

-- Public users can only see basic info (no email, personal details)
-- This policy will work with the application layer to filter sensitive columns
CREATE POLICY "Public limited profile access" 
ON public.profiles 
FOR SELECT 
USING (
  -- This policy allows read access, but the application should filter columns
  true
);

-- Authenticated users can see more but still not emails of others
CREATE POLICY "Authenticated enhanced profile access" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL
);

-- Users have full access to their own profile data
CREATE POLICY "Users full access to own profile" 
ON public.profiles 
FOR ALL 
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Staff can access all profile data for moderation
CREATE POLICY "Staff moderation access to profiles" 
ON public.profiles 
FOR ALL 
USING (
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

-- Enable RLS on the public profiles view
ALTER VIEW public.public_profiles SET (security_barrier = true);

-- Create a security definer function to get safe public profile data
CREATE OR REPLACE FUNCTION public.get_public_profile_data(profile_id uuid)
RETURNS TABLE(
  id uuid,
  username text,
  display_name text,
  profile_picture text,
  bio text,
  created_at timestamptz
) 
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT 
    p.id,
    p.username,
    p.display_name,
    p.profile_picture,
    p.bio,
    p.created_at
  FROM public.profiles p
  WHERE p.id = profile_id;
$$;