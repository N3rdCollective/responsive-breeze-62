
-- FINAL FIX: Complete cleanup of staff table RLS infinite recursion
-- This removes ALL problematic policies and creates simple, safe ones

-- Step 1: Drop ALL existing RLS policies on the staff table that cause recursion
DROP POLICY IF EXISTS "Staff members can view own record" ON public.staff;
DROP POLICY IF EXISTS "Admins can view all staff records" ON public.staff;
DROP POLICY IF EXISTS "Super admins can insert staff" ON public.staff;
DROP POLICY IF EXISTS "Super admins can update staff" ON public.staff;
DROP POLICY IF EXISTS "Super admins can delete staff" ON public.staff;
DROP POLICY IF EXISTS "Allow staff to view own record" ON public.staff;
DROP POLICY IF EXISTS "Admins can view all staff via function" ON public.staff;
DROP POLICY IF EXISTS "Super admins can modify staff via function" ON public.staff;
DROP POLICY IF EXISTS "Staff can view own record" ON public.staff;
DROP POLICY IF EXISTS "Admins can view all staff" ON public.staff;
DROP POLICY IF EXISTS "Super admins can modify staff" ON public.staff;
DROP POLICY IF EXISTS "Staff view own record" ON public.staff;
DROP POLICY IF EXISTS "Admins view all staff" ON public.staff;
DROP POLICY IF EXISTS "Super admins insert staff" ON public.staff;
DROP POLICY IF EXISTS "Super admins update staff" ON public.staff;
DROP POLICY IF EXISTS "Super admins delete staff" ON public.staff;

-- Step 2: Create ONE simple policy for staff to view their own record
-- This uses direct auth.uid() comparison, no function calls, no recursion
CREATE POLICY "staff_can_view_own_record" ON public.staff
FOR SELECT TO authenticated
USING (id = auth.uid());

-- Step 3: Create ONE simple policy for inserting staff (only for existing super admins)
-- This uses the existing non-recursive function get_user_staff_role
CREATE POLICY "super_admin_can_insert_staff" ON public.staff
FOR INSERT TO authenticated
WITH CHECK (public.get_user_staff_role(auth.uid()) = 'super_admin');

-- Step 4: Create ONE simple policy for updating staff
CREATE POLICY "super_admin_can_update_staff" ON public.staff
FOR UPDATE TO authenticated
USING (public.get_user_staff_role(auth.uid()) = 'super_admin');

-- Step 5: Create ONE simple policy for deleting staff
CREATE POLICY "super_admin_can_delete_staff" ON public.staff
FOR DELETE TO authenticated
USING (public.get_user_staff_role(auth.uid()) = 'super_admin');

-- Step 6: Ensure RLS is enabled
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- Step 7: Clean up any other problematic policies that might reference staff table recursively
DROP POLICY IF EXISTS "Admins can access pending staff" ON public.pending_staff;
CREATE POLICY "admin_access_pending_staff" ON public.pending_staff
FOR ALL TO authenticated
USING (public.get_user_staff_role(auth.uid()) IN ('admin', 'super_admin'));

-- Step 8: Fix staff activity logs policy to use the safe function
DROP POLICY IF EXISTS "Staff can view activity logs" ON public.staff_activity_logs;
CREATE POLICY "staff_view_activity_logs" ON public.staff_activity_logs
FOR SELECT TO authenticated
USING (public.is_user_staff_member(auth.uid()));

-- Step 9: Fix permission table policies to use safe functions
DROP POLICY IF EXISTS "Authenticated staff can view permissions" ON public.staff_permissions;
DROP POLICY IF EXISTS "Authenticated staff can view role permissions" ON public.role_permissions;

CREATE POLICY "staff_view_permissions" ON public.staff_permissions
FOR SELECT TO authenticated
USING (public.is_user_staff_member(auth.uid()));

CREATE POLICY "staff_view_role_permissions" ON public.role_permissions
FOR SELECT TO authenticated
USING (public.is_user_staff_member(auth.uid()));
