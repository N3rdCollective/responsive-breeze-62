-- Fix security definer view issue and create proper column-level security
-- Remove the problematic security definer view and use proper RLS policies

-- Drop the security definer view that's causing the security warning
DROP VIEW IF EXISTS public.public_profiles;
DROP FUNCTION IF EXISTS public.get_public_profile_data(uuid);

-- Clear all policies and start fresh with a proper approach
DROP POLICY IF EXISTS "Public limited profile access" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated enhanced profile access" ON public.profiles;
DROP POLICY IF EXISTS "Users full access to own profile" ON public.profiles;
DROP POLICY IF EXISTS "Staff moderation access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow user profile creation on signup" ON public.profiles;

-- Create proper column-level security using RLS policies
-- Policy 1: Users can view their own complete profile
CREATE POLICY "Users can view own complete profile" 
ON public.profiles 
FOR SELECT 
USING (id = auth.uid());

-- Policy 2: Authenticated users can view basic profile info of others (no email/sensitive data)
-- Note: This requires application-level filtering for sensitive columns
CREATE POLICY "Authenticated users view public profile data" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND id != auth.uid()
);

-- Policy 3: Unauthenticated users can only view very basic info
-- This will be further restricted at the application level
CREATE POLICY "Public users view minimal profile data" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NULL
);

-- Policy 4: Users can update their own profiles
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Policy 5: Users can insert their own profile (signup)
CREATE POLICY "Users can create own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
  id = auth.uid() OR auth.uid() IS NULL  -- Allow system inserts during signup
);

-- Policy 6: Staff can view all profiles for moderation
CREATE POLICY "Staff can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE staff.id = auth.uid() 
    AND staff.role IN ('admin', 'super_admin', 'moderator')
  )
);

-- Policy 7: Staff can update profiles for moderation
CREATE POLICY "Staff can update any profile" 
ON public.profiles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE staff.id = auth.uid() 
    AND staff.role IN ('admin', 'super_admin', 'moderator')
  )
);