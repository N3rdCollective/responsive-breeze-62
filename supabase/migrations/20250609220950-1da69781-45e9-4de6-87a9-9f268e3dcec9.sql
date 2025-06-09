
-- Step 1: Remove ALL policies that depend on can_manage_staff function
DROP POLICY IF EXISTS "Only admins and super_admins can add staff" ON public.staff;
DROP POLICY IF EXISTS "Admins and super_admins can update non-super_admin staff" ON public.staff;
DROP POLICY IF EXISTS "Admins and super_admins can delete non-super_admin staff" ON public.staff;
DROP POLICY IF EXISTS "Allow admins to access all pending staff" ON public.pending_staff;

-- Step 2: Remove ALL remaining staff table policies to eliminate circular dependencies
DROP POLICY IF EXISTS "Allow staff to view own record" ON public.staff;
DROP POLICY IF EXISTS "Admins can view all staff" ON public.staff;
DROP POLICY IF EXISTS "Super admins can modify staff" ON public.staff;
DROP POLICY IF EXISTS "Staff can view own record" ON public.staff;
DROP POLICY IF EXISTS "Admins can view all staff via function" ON public.staff;
DROP POLICY IF EXISTS "Super admins can modify staff via function" ON public.staff;

-- Step 3: Now drop the problematic functions (they should have no dependencies now)
DROP FUNCTION IF EXISTS public.is_staff_admin(uuid);
DROP FUNCTION IF EXISTS public.can_manage_staff(uuid);

-- Step 4: Create a simple, non-recursive function to check admin status
CREATE OR REPLACE FUNCTION public.check_staff_admin_role(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  -- Direct query without RLS to avoid recursion
  SELECT EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = user_id 
    AND role IN ('admin', 'super_admin')
  );
$$;

-- Step 5: Create simple, non-recursive policies for staff table
-- Policy 1: Staff can view their own record only
CREATE POLICY "Staff view own record" ON public.staff
FOR SELECT TO authenticated
USING (id = auth.uid());

-- Policy 2: Admins can view all staff using the non-recursive function
CREATE POLICY "Admins view all staff" ON public.staff
FOR SELECT TO authenticated
USING (
  id = auth.uid() OR 
  public.check_staff_admin_role(auth.uid())
);

-- Policy 3: Super admins can insert new staff
CREATE POLICY "Super admins insert staff" ON public.staff
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.staff s
    WHERE s.id = auth.uid() 
    AND s.role = 'super_admin'
  )
);

-- Policy 4: Super admins can update staff records
CREATE POLICY "Super admins update staff" ON public.staff
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.staff s
    WHERE s.id = auth.uid() 
    AND s.role = 'super_admin'
  )
);

-- Policy 5: Super admins can delete staff records
CREATE POLICY "Super admins delete staff" ON public.staff
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.staff s
    WHERE s.id = auth.uid() 
    AND s.role = 'super_admin'
  )
);

-- Step 6: Recreate pending_staff policy with new function
CREATE POLICY "Admins access pending staff" ON public.pending_staff
FOR ALL TO authenticated
USING (public.check_staff_admin_role(auth.uid()));

-- Step 7: Ensure permissions tables allow staff to view permissions
DROP POLICY IF EXISTS "Staff view permissions" ON public.staff_permissions;
DROP POLICY IF EXISTS "Staff view role permissions" ON public.role_permissions;

CREATE POLICY "Staff view permissions" ON public.staff_permissions
FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid())
);

CREATE POLICY "Staff view role permissions" ON public.role_permissions
FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid())
);
