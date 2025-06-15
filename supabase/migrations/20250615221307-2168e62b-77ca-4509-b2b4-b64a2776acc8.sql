
-- Step 1: Drop all problematic RLS policies on profiles table that cause recursion
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Staff can view all profiles for moderation" ON profiles;
DROP POLICY IF EXISTS "Only admin/super_admin can update user status" ON profiles;
DROP POLICY IF EXISTS "Super admins can update user status" ON profiles;

-- Step 2: Create clean, minimal RLS policies for profiles table
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Step 3: Create staff policies using the safe non-recursive functions
CREATE POLICY "Staff can view all profiles for moderation" ON profiles
  FOR SELECT TO authenticated
  USING (
    id = auth.uid() OR
    public.is_user_staff_member(auth.uid())
  );

CREATE POLICY "Super admins can update user status" ON profiles
  FOR UPDATE TO authenticated
  USING (
    id = auth.uid() OR
    public.get_user_staff_role(auth.uid()) = 'super_admin'
  )
  WITH CHECK (
    id = auth.uid() OR
    public.get_user_staff_role(auth.uid()) = 'super_admin'
  );
