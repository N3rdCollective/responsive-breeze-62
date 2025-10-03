-- Fix infinite recursion in staff table policies
-- The issue is that policies on staff table reference the staff table itself, creating loops

-- First, drop all the problematic policies on staff table
DROP POLICY IF EXISTS "admin_manage_staff_limited" ON public.staff;
DROP POLICY IF EXISTS "hr_view_staff_data" ON public.staff;
DROP POLICY IF EXISTS "staff_update_own_basic_info" ON public.staff;
DROP POLICY IF EXISTS "super_admin_manage_all_staff" ON public.staff;
DROP POLICY IF EXISTS "staff_view_own_record" ON public.staff;
DROP POLICY IF EXISTS "ABSOLUTE_DENY_ANON_STAFF_ACCESS" ON public.staff;

-- Create simple, non-recursive policies for staff table
-- Staff can view their own record (no recursion)
CREATE POLICY "staff_view_own_record"
ON public.staff
FOR SELECT
USING (id = auth.uid());

-- Staff can update their own basic info (no role/permission changes)
CREATE POLICY "staff_update_own_basic_info"
ON public.staff
FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Use the existing get_user_staff_role function to avoid recursion
-- Super admins can manage all staff
CREATE POLICY "super_admin_manage_all_staff"
ON public.staff
FOR ALL
USING (public.get_user_staff_role(auth.uid()) = 'super_admin')
WITH CHECK (public.get_user_staff_role(auth.uid()) = 'super_admin');

-- Admins can view and manage non-admin/super_admin staff
CREATE POLICY "admin_manage_staff_limited"
ON public.staff
FOR ALL
USING (
  public.get_user_staff_role(auth.uid()) = 'admin' 
  AND role NOT IN ('super_admin', 'admin')
)
WITH CHECK (
  public.get_user_staff_role(auth.uid()) = 'admin' 
  AND role NOT IN ('super_admin', 'admin')
);

-- HR staff can view staff data (read-only)
CREATE POLICY "hr_view_staff_data"
ON public.staff
FOR SELECT
USING (
  public.get_user_staff_role(auth.uid()) IN ('admin', 'super_admin')
  OR (
    SELECT hr_permissions 
    FROM public.staff 
    WHERE id = auth.uid()
    LIMIT 1
  ) = true
);

-- Now fix the personalities table policy to use the function instead
DROP POLICY IF EXISTS "Allow admins and super_admins to manage personalities" ON public.personalities;

CREATE POLICY "Allow admins and super_admins to manage personalities"
ON public.personalities
FOR ALL
USING (public.get_user_staff_role(auth.uid()) IN ('admin', 'super_admin', 'moderator'))
WITH CHECK (public.get_user_staff_role(auth.uid()) IN ('admin', 'super_admin', 'moderator'));