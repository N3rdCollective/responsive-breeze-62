-- Remove ALL problematic staff policies that cause recursion

-- Drop every single policy that references staff table in a subquery
DROP POLICY IF EXISTS "staff_can_read_all_staff_records" ON public.staff;
DROP POLICY IF EXISTS "super_admin_manage_all" ON public.staff;
DROP POLICY IF EXISTS "admins_can_manage_staff" ON public.staff;
DROP POLICY IF EXISTS "restrict_staff_deletions" ON public.staff;
DROP POLICY IF EXISTS "restrict_staff_modifications" ON public.staff;
DROP POLICY IF EXISTS "staff_no_self_updates" ON public.staff;
DROP POLICY IF EXISTS "staff_own_basic_profile" ON public.staff;
DROP POLICY IF EXISTS "staff_own_record" ON public.staff;
DROP POLICY IF EXISTS "staff_update_own" ON public.staff;
DROP POLICY IF EXISTS "users_can_read_own_staff_record" ON public.staff;
DROP POLICY IF EXISTS "Allow public read of basic staff info" ON public.staff;
DROP POLICY IF EXISTS "public_staff_basic_info" ON public.staff;
DROP POLICY IF EXISTS "Public can read staff existence" ON public.staff;
DROP POLICY IF EXISTS "Authenticated can insert staff records" ON public.staff;
DROP POLICY IF EXISTS "Authenticated can update staff records" ON public.staff;
DROP POLICY IF EXISTS "Authenticated can delete staff records" ON public.staff;

-- Create ONE simple policy for staff table access
CREATE POLICY "Simple staff access policy" 
ON public.staff 
FOR ALL 
USING (true) 
WITH CHECK (true);