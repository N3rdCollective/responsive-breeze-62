-- Create security definer function to get staff role without RLS recursion
CREATE OR REPLACE FUNCTION public.get_user_staff_role_simple(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role FROM public.staff WHERE id = user_id LIMIT 1;
$$;

-- Create security definer function to check HR permissions without RLS recursion
CREATE OR REPLACE FUNCTION public.has_hr_permissions(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(hr_permissions, false) FROM public.staff WHERE id = user_id LIMIT 1;
$$;

-- Drop existing problematic policies that cause recursion
DROP POLICY IF EXISTS admin_manage_staff_limited ON staff;
DROP POLICY IF EXISTS hr_view_staff_data ON staff;
DROP POLICY IF EXISTS super_admin_manage_all_staff ON staff;
DROP POLICY IF EXISTS staff_view_own_record ON staff;
DROP POLICY IF EXISTS staff_update_own_basic_info ON staff;

-- Recreate policies using security definer functions to avoid recursion
CREATE POLICY admin_manage_staff_limited ON staff
FOR ALL
TO authenticated
USING (
  get_user_staff_role_simple(auth.uid()) = 'admin'
  AND role NOT IN ('super_admin', 'admin')
)
WITH CHECK (
  get_user_staff_role_simple(auth.uid()) = 'admin'
  AND role NOT IN ('super_admin', 'admin')
);

CREATE POLICY hr_view_staff_data ON staff
FOR SELECT
TO authenticated
USING (
  get_user_staff_role_simple(auth.uid()) IN ('admin', 'super_admin')
  OR has_hr_permissions(auth.uid()) = true
);

CREATE POLICY super_admin_manage_all_staff ON staff
FOR ALL
TO authenticated
USING (get_user_staff_role_simple(auth.uid()) = 'super_admin')
WITH CHECK (get_user_staff_role_simple(auth.uid()) = 'super_admin');

CREATE POLICY staff_view_own_record ON staff
FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY staff_update_own_basic_info ON staff
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());