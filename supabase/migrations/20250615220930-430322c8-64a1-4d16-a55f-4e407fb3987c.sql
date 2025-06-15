
-- Step 1: Drop ALL policies that depend on the problematic function
DROP POLICY IF EXISTS "Admins access pending staff" ON public.pending_staff;
DROP POLICY IF EXISTS "Super admins can delete featured artists" ON public.featured_artists;
DROP POLICY IF EXISTS "Super admins can delete featured videos" ON public.featured_videos;
DROP POLICY IF EXISTS "Admins can insert home settings" ON public.home_settings;
DROP POLICY IF EXISTS "Super admins can delete home settings" ON public.home_settings;
DROP POLICY IF EXISTS "Super admins can update user status" ON public.profiles;
DROP POLICY IF EXISTS "Staff can view activity logs" ON public.staff_activity_logs;

-- Step 2: Drop all existing staff table policies
DROP POLICY IF EXISTS "Staff view own record" ON public.staff;
DROP POLICY IF EXISTS "Admins view all staff" ON public.staff;
DROP POLICY IF EXISTS "Super admins insert staff" ON public.staff;
DROP POLICY IF EXISTS "Super admins update staff" ON public.staff;
DROP POLICY IF EXISTS "Super admins delete staff" ON public.staff;
DROP POLICY IF EXISTS "Allow staff to view own record" ON public.staff;
DROP POLICY IF EXISTS "Admins can view all staff via function" ON public.staff;
DROP POLICY IF EXISTS "Super admins can modify staff via function" ON public.staff;

-- Step 3: Now safely drop the problematic function
DROP FUNCTION IF EXISTS public.check_staff_admin_role(uuid);

-- Step 4: Create simple, direct functions that bypass RLS entirely
CREATE OR REPLACE FUNCTION public.is_user_staff_member(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  -- Direct query without RLS to avoid any recursion
  SELECT EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_staff_role(user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  -- Direct query without RLS to avoid any recursion
  SELECT role FROM public.staff 
  WHERE id = user_id
  LIMIT 1;
$$;

-- Step 5: Create minimal, safe RLS policies for the staff table
CREATE POLICY "Staff members can view own record" ON public.staff
FOR SELECT TO authenticated
USING (id = auth.uid());

CREATE POLICY "Admins can view all staff records" ON public.staff
FOR SELECT TO authenticated
USING (
  id = auth.uid() OR 
  public.get_user_staff_role(auth.uid()) IN ('admin', 'super_admin')
);

CREATE POLICY "Super admins can insert staff" ON public.staff
FOR INSERT TO authenticated
WITH CHECK (
  public.get_user_staff_role(auth.uid()) = 'super_admin'
);

CREATE POLICY "Super admins can update staff" ON public.staff
FOR UPDATE TO authenticated
USING (
  public.get_user_staff_role(auth.uid()) = 'super_admin'
);

CREATE POLICY "Super admins can delete staff" ON public.staff
FOR DELETE TO authenticated
USING (
  public.get_user_staff_role(auth.uid()) = 'super_admin'
);

-- Step 6: Recreate the dependent policies using the new functions
CREATE POLICY "Admins can access pending staff" ON public.pending_staff
FOR ALL TO authenticated
USING (public.get_user_staff_role(auth.uid()) IN ('admin', 'super_admin'));

CREATE POLICY "Super admins can delete featured artists" ON public.featured_artists
FOR DELETE TO authenticated
USING (public.get_user_staff_role(auth.uid()) = 'super_admin');

CREATE POLICY "Super admins can delete featured videos" ON public.featured_videos
FOR DELETE TO authenticated
USING (public.get_user_staff_role(auth.uid()) = 'super_admin');

CREATE POLICY "Admins can insert home settings" ON public.home_settings
FOR INSERT TO authenticated
WITH CHECK (public.get_user_staff_role(auth.uid()) IN ('admin', 'super_admin'));

CREATE POLICY "Super admins can delete home settings" ON public.home_settings
FOR DELETE TO authenticated
USING (public.get_user_staff_role(auth.uid()) = 'super_admin');

CREATE POLICY "Super admins can update user status" ON public.profiles
FOR UPDATE TO authenticated
USING (public.get_user_staff_role(auth.uid()) = 'super_admin');

CREATE POLICY "Staff can view activity logs" ON public.staff_activity_logs
FOR SELECT TO authenticated
USING (public.is_user_staff_member(auth.uid()));

-- Step 7: Fix permission table policies
DROP POLICY IF EXISTS "Staff view permissions" ON public.staff_permissions;
DROP POLICY IF EXISTS "Staff view role permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "Staff can view permissions" ON public.staff_permissions;
DROP POLICY IF EXISTS "Staff can view role permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "Staff can view all permissions" ON public.staff_permissions;
DROP POLICY IF EXISTS "Staff can view all role permissions" ON public.role_permissions;

CREATE POLICY "Authenticated staff can view permissions" ON public.staff_permissions
FOR SELECT TO authenticated
USING (public.is_user_staff_member(auth.uid()));

CREATE POLICY "Authenticated staff can view role permissions" ON public.role_permissions
FOR SELECT TO authenticated
USING (public.is_user_staff_member(auth.uid()));
