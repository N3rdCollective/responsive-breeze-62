-- Fix conflicting RLS policies on profiles table
-- Drop all existing policies to start clean
DROP POLICY IF EXISTS "ABSOLUTE_DENY_ANON_PROFILES_ACCESS" ON public.profiles;
DROP POLICY IF EXISTS "ABSOLUTE_DENY_PUBLIC_PROFILES_ACCESS" ON public.profiles;
DROP POLICY IF EXISTS "Admin staff can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Only super admins can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "STAFF_VIEW_ALL_PROFILES" ON public.profiles;
DROP POLICY IF EXISTS "Staff can view public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "USERS_OWN_PROFILE_ONLY" ON public.profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profiles" ON public.profiles;

-- Create clean, secure RLS policies
-- 1. Absolute deny for anonymous users
CREATE POLICY "deny_anonymous_access" ON public.profiles
  FOR ALL TO anon
  USING (false)
  WITH CHECK (false);

-- 2. Users can only access their own profiles
CREATE POLICY "users_own_profile_access" ON public.profiles
  FOR ALL TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- 3. Staff can view all profiles (for moderation)
CREATE POLICY "staff_view_all_profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff 
      WHERE staff.id = auth.uid() 
      AND staff.role IN ('admin', 'super_admin', 'moderator')
    )
  );

-- 4. Admin staff can update any profile (for user management)
CREATE POLICY "admin_staff_update_profiles" ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff 
      WHERE staff.id = auth.uid() 
      AND staff.role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff 
      WHERE staff.id = auth.uid() 
      AND staff.role IN ('admin', 'super_admin')
    )
  );

-- 5. Only super admins can delete profiles
CREATE POLICY "super_admin_delete_profiles" ON public.profiles
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff 
      WHERE staff.id = auth.uid() 
      AND staff.role = 'super_admin'
    )
  );

-- 6. Public read access for profiles marked as public (for user discovery)
CREATE POLICY "public_profile_read_access" ON public.profiles
  FOR SELECT TO authenticated
  USING (is_public = true);

-- Ensure RLS is enabled
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;