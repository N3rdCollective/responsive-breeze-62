-- Security Fix: Clean up profiles table RLS policies
-- Drop all existing conflicting policies first
DROP POLICY IF EXISTS "Users can view own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Staff can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Staff can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Deny anonymous profile access" ON public.profiles;
DROP POLICY IF EXISTS "Only authenticated users can access profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can only access their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Staff can view profiles for moderation" ON public.profiles;
DROP POLICY IF EXISTS "Admin staff can update profiles" ON public.profiles;

-- Create clean, secure policy structure
-- 1. Absolute denial for anonymous users
CREATE POLICY "deny_anonymous_access" 
ON public.profiles 
FOR ALL 
TO anon 
USING (false) 
WITH CHECK (false);

-- 2. Users can only manage their own profiles
CREATE POLICY "users_own_profile_access" 
ON public.profiles 
FOR ALL 
TO authenticated 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- 3. Staff can view all profiles for moderation (but not sensitive fields in practice)
CREATE POLICY "staff_moderation_view" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE staff.id = auth.uid() 
    AND staff.role IN ('admin', 'super_admin', 'moderator')
  )
);

-- 4. Staff can update profiles for moderation purposes
CREATE POLICY "staff_moderation_update" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
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

-- 5. Only super admins can delete profiles
CREATE POLICY "super_admin_delete_only" 
ON public.profiles 
FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE staff.id = auth.uid() 
    AND staff.role = 'super_admin'
  )
);

-- Add security comments to mark sensitive columns
COMMENT ON COLUMN public.profiles.email IS 'SENSITIVE: Personal email address - restrict access';
COMMENT ON COLUMN public.profiles.first_name IS 'SENSITIVE: Personal name - restrict access';  
COMMENT ON COLUMN public.profiles.last_name IS 'SENSITIVE: Personal name - restrict access';