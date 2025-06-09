
-- Drop all existing problematic staff table policies
DROP POLICY IF EXISTS "Staff can view own record" ON public.staff;
DROP POLICY IF EXISTS "Admins can view all staff" ON public.staff;
DROP POLICY IF EXISTS "Super admins can modify staff" ON public.staff;

-- Create a simple, non-recursive policy that allows staff to view their own record
CREATE POLICY "Allow staff to view own record" ON public.staff
FOR SELECT TO authenticated
USING (id = auth.uid());

-- Create a function to safely check if a user is admin without recursion
CREATE OR REPLACE FUNCTION public.is_staff_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = user_id 
    AND role IN ('admin', 'super_admin')
  );
$$;

-- Create a policy for admins to view all staff using the function
CREATE POLICY "Admins can view all staff via function" ON public.staff
FOR SELECT TO authenticated
USING (
  id = auth.uid() OR 
  public.is_staff_admin(auth.uid())
);

-- Create a policy for super admins to modify staff
CREATE POLICY "Super admins can modify staff via function" ON public.staff
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.staff s
    WHERE s.id = auth.uid() 
    AND s.role = 'super_admin'
  )
);
