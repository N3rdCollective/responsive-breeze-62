
-- FINAL CLEANUP: Remove ALL remaining problematic policies on staff table
-- These policies are causing infinite recursion and preventing authenticated users from accessing data

-- Drop all remaining problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Admin/super_admin can view staff records" ON public.staff;
DROP POLICY IF EXISTS "Any authenticated staff can view staff members" ON public.staff;
DROP POLICY IF EXISTS "Only super_admin can modify staff" ON public.staff;
DROP POLICY IF EXISTS "Staff can update own data" ON public.staff;
DROP POLICY IF EXISTS "Staff can view own data" ON public.staff;
DROP POLICY IF EXISTS "Staff can view own record only" ON public.staff;

-- Also drop any other variations that might exist
DROP POLICY IF EXISTS "Admins can view all staff records" ON public.staff;
DROP POLICY IF EXISTS "Super admins can modify staff" ON public.staff;
DROP POLICY IF EXISTS "Staff members can view own record" ON public.staff;
DROP POLICY IF EXISTS "Allow staff to view own record" ON public.staff;
DROP POLICY IF EXISTS "Admins can view all staff via function" ON public.staff;
DROP POLICY IF EXISTS "Super admins can modify staff via function" ON public.staff;

-- Verify that we only have our clean, non-recursive policies remaining:
-- 1. "staff_can_view_own_record" - allows staff to view their own record using direct auth.uid() comparison
-- 2. "super_admin_can_insert_staff" - uses safe get_user_staff_role function
-- 3. "super_admin_can_update_staff" - uses safe get_user_staff_role function  
-- 4. "super_admin_can_delete_staff" - uses safe get_user_staff_role function

-- These policies should remain and are non-recursive:
-- CREATE POLICY "staff_can_view_own_record" ON public.staff FOR SELECT TO authenticated USING (id = auth.uid());
-- CREATE POLICY "super_admin_can_insert_staff" ON public.staff FOR INSERT TO authenticated WITH CHECK (public.get_user_staff_role(auth.uid()) = 'super_admin');
-- CREATE POLICY "super_admin_can_update_staff" ON public.staff FOR UPDATE TO authenticated USING (public.get_user_staff_role(auth.uid()) = 'super_admin');
-- CREATE POLICY "super_admin_can_delete_staff" ON public.staff FOR DELETE TO authenticated USING (public.get_user_staff_role(auth.uid()) = 'super_admin');
