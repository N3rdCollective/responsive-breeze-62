
-- Step 1: Fix Staff Table RLS Policies to Prevent Infinite Recursion

-- Drop existing problematic policies that may cause recursion
DROP POLICY IF EXISTS "Staff can view other staff with permission" ON public.staff;
DROP POLICY IF EXISTS "Super admins can manage staff" ON public.staff;

-- Create simple, non-recursive policies for staff table
-- Policy 1: Staff can view their own record
CREATE POLICY "Staff can view own record" ON public.staff
FOR SELECT TO authenticated
USING (id = auth.uid());

-- Policy 2: Admins can view all staff records (using direct role check)
CREATE POLICY "Admins can view all staff" ON public.staff
FOR SELECT TO authenticated
USING (
  id = auth.uid() OR -- Always allow viewing own record
  EXISTS (
    SELECT 1 FROM public.staff s
    WHERE s.id = auth.uid() 
    AND s.role IN ('admin', 'super_admin')
  )
);

-- Policy 3: Super admins can modify staff records
CREATE POLICY "Super admins can modify staff" ON public.staff
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.staff s
    WHERE s.id = auth.uid() 
    AND s.role = 'super_admin'
  )
);

-- Update role permissions policies to be more efficient
DROP POLICY IF EXISTS "Staff can view their permissions" ON public.staff_permissions;
DROP POLICY IF EXISTS "Staff can view role permissions" ON public.role_permissions;

-- Allow all authenticated staff to view permissions (needed for the hook)
CREATE POLICY "Staff can view all permissions" ON public.staff_permissions
FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid())
);

CREATE POLICY "Staff can view all role permissions" ON public.role_permissions
FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid())
);
