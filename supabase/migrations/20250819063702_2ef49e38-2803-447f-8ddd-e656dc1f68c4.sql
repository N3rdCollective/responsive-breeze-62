-- EMERGENCY: Force complete RLS lockdown on staff table

-- 1. Ensure RLS is enabled and forced
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff FORCE ROW LEVEL SECURITY;

-- 2. Drop ALL existing policies and start fresh
DROP POLICY IF EXISTS "Staff can view own record only" ON public.staff;
DROP POLICY IF EXISTS "Super admins only can add staff" ON public.staff;  
DROP POLICY IF EXISTS "Super admins only can update staff" ON public.staff;
DROP POLICY IF EXISTS "Super admins only can delete staff" ON public.staff;
DROP POLICY IF EXISTS "Deny all public access to staff" ON public.staff;

-- 3. Create the most restrictive policies possible
-- ABSOLUTE DENIAL for public role
CREATE POLICY "ABSOLUTE_DENY_PUBLIC_STAFF_ACCESS" 
ON public.staff 
FOR ALL 
TO public
USING (false)
WITH CHECK (false);

-- ABSOLUTE DENIAL for anon role  
CREATE POLICY "ABSOLUTE_DENY_ANON_STAFF_ACCESS" 
ON public.staff 
FOR ALL 
TO anon
USING (false)
WITH CHECK (false);

-- Super restrictive authenticated access - staff can only see own record
CREATE POLICY "STAFF_OWN_RECORD_ONLY" 
ON public.staff 
FOR SELECT 
TO authenticated
USING (id = auth.uid());

-- Super admin full access
CREATE POLICY "SUPER_ADMIN_FULL_ACCESS" 
ON public.staff 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.staff s 
    WHERE s.id = auth.uid() 
    AND s.role = 'super_admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.staff s 
    WHERE s.id = auth.uid() 
    AND s.role = 'super_admin'
  )
);

-- 4. Revoke any dangerous permissions
REVOKE ALL ON public.staff FROM public;
REVOKE ALL ON public.staff FROM anon;