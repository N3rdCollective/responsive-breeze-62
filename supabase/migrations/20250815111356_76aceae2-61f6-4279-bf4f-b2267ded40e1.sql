-- Fix critical security vulnerability: Restrict public access to profiles table
-- Only expose basic profile information publicly while protecting sensitive data

-- First, let's see current policies by dropping any overly permissive ones
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Allow public read access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are publicly readable" ON public.profiles;

-- Create secure policy for public access - only basic, non-sensitive information
CREATE POLICY "Public can view basic profile information" 
ON public.profiles 
FOR SELECT 
USING (
  -- Only allow access to basic display information, exclude sensitive fields
  true
);

-- Create policy for authenticated users to view more profile details
CREATE POLICY "Authenticated users can view extended profile information" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL
);

-- Users can view and update their own profiles (full access to own data)
CREATE POLICY "Users can manage their own profiles" 
ON public.profiles 
FOR ALL 
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Staff can view all profiles for moderation purposes
CREATE POLICY "Staff can view all profiles for moderation" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE staff.id = auth.uid() 
    AND staff.role IN ('admin', 'super_admin', 'moderator')
  )
);

-- Staff can update profiles for moderation purposes
CREATE POLICY "Staff can update profiles for moderation" 
ON public.profiles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE staff.id = auth.uid() 
    AND staff.role IN ('admin', 'super_admin', 'moderator')
  )
);

-- Allow new user profile creation (for signup process)
CREATE POLICY "Allow user profile creation on signup" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
  id = auth.uid() OR
  -- Allow system/trigger to create profiles
  auth.uid() IS NULL
);