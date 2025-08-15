-- Fix profiles table security by properly removing all existing policies first
-- Then create comprehensive security policies

-- Drop ALL existing policies on profiles table to avoid conflicts
DO $$ 
DECLARE 
  policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT schemaname, tablename, policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'profiles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                   policy_record.policyname, 
                   policy_record.schemaname, 
                   policy_record.tablename);
  END LOOP;
END $$;

-- Now create secure policies for the profiles table

-- Policy 1: Users can view and manage their own complete profile
CREATE POLICY "Users manage own profile" 
ON public.profiles 
FOR ALL 
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Policy 2: Staff can view all profiles for moderation purposes
CREATE POLICY "Staff view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE staff.id = auth.uid() 
    AND staff.role IN ('admin', 'super_admin', 'moderator')
  )
);

-- Policy 3: Staff can update profiles for moderation
CREATE POLICY "Staff update profiles" 
ON public.profiles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE staff.id = auth.uid() 
    AND staff.role IN ('admin', 'super_admin', 'moderator')
  )
);

-- Policy 4: Allow profile creation during signup process
CREATE POLICY "Allow profile creation" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
  id = auth.uid() OR auth.uid() IS NULL  -- Allow system/trigger inserts
);

-- IMPORTANT: The application layer must implement column filtering
-- Public users should only see: username, display_name, profile_picture, bio
-- Authenticated users should see the above plus: created_at, updated_at, forum_post_count
-- Only the profile owner and staff should see: email, role, first_name, last_name

COMMENT ON TABLE public.profiles IS 'SECURITY NOTE: Application must filter sensitive columns (email, role, first_name, last_name) for non-owner access';