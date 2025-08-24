-- Security Fix: Clean up profiles table RLS policies (robust version)
-- First, let's see what policies exist and drop them systematically

-- Drop policies that might exist (using IF EXISTS to prevent errors)
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    -- Get all existing policies for profiles table
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

-- Now create the clean, secure policy structure
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

-- 3. Staff can view all profiles for moderation
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