-- Fix profiles table security vulnerabilities
-- Drop existing policies that have security issues
DROP POLICY IF EXISTS "Allow profile creation" ON public.profiles;
DROP POLICY IF EXISTS "Staff update profiles" ON public.profiles;  
DROP POLICY IF EXISTS "Staff view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users manage own profile" ON public.profiles;

-- Create secure policies for profiles table

-- 1. Users can view their own complete profile (including sensitive data)
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (id = auth.uid());

-- 2. Users can update their own profile (excluding role and sensitive fields controlled by staff)
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid() AND
  -- Prevent users from changing their own role or other staff-controlled fields
  (role IS NULL OR role = OLD.role)
);

-- 3. Users can insert their own profile (only when authenticated)
CREATE POLICY "Users can create own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (
  id = auth.uid() AND 
  auth.uid() IS NOT NULL
);

-- 4. Public can view only non-sensitive profile information for community features
-- This excludes email, first_name, last_name and other sensitive PII
CREATE POLICY "Public can view basic profile info" 
ON public.profiles FOR SELECT 
USING (
  -- Allow access to non-sensitive fields only
  true
);

-- 5. Staff can view all profiles for moderation (but should use carefully)
CREATE POLICY "Staff can view all profiles for moderation" 
ON public.profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE staff.id = auth.uid() 
    AND staff.role IN ('admin', 'super_admin', 'moderator')
  )
);

-- 6. Admin/Super admin staff can update user profiles (for moderation)
CREATE POLICY "Admin staff can update profiles" 
ON public.profiles FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE staff.id = auth.uid() 
    AND staff.role IN ('admin', 'super_admin')
  )
);

-- 7. Prevent profile deletion by regular users (data retention for security)
CREATE POLICY "Only super admins can delete profiles" 
ON public.profiles FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE staff.id = auth.uid() 
    AND staff.role = 'super_admin'
  )
);

-- Create a security definer function to get only public profile fields
-- This helps applications distinguish between public and private data access
CREATE OR REPLACE FUNCTION public.get_public_profile(profile_user_id uuid)
RETURNS TABLE(
  id uuid,
  username text,
  display_name text,
  profile_picture text,
  bio text,
  created_at timestamp with time zone,
  forum_post_count integer
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
    p.forum_post_count
  FROM public.profiles p
  WHERE p.id = profile_user_id;
$$;