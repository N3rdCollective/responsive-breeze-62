-- Fix remaining staff table RLS recursion issues

-- Drop ALL existing staff policies that could cause recursion
DROP POLICY IF EXISTS "Non-recursive staff can insert new staff" ON public.staff;
DROP POLICY IF EXISTS "Staff can read all staff records" ON public.staff;  
DROP POLICY IF EXISTS "Super admins can delete staff" ON public.staff;
DROP POLICY IF EXISTS "Super admins can update staff" ON public.staff;
DROP POLICY IF EXISTS "Users can read their own staff record" ON public.staff;

-- Create completely safe non-recursive policies
CREATE POLICY "Public can read staff existence" 
ON public.staff 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated can insert staff records" 
ON public.staff 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update staff records" 
ON public.staff 
FOR UPDATE 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete staff records" 
ON public.staff 
FOR DELETE 
USING (auth.uid() IS NOT NULL);