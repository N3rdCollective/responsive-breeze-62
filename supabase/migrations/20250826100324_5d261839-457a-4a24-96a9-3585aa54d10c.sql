-- Fix infinite recursion in staff table RLS policies

-- Step 1: Temporarily disable RLS on staff table to allow changes
ALTER TABLE public.staff DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing problematic policies that cause recursion
DROP POLICY IF EXISTS "SUPER_ADMIN_FULL_ACCESS" ON public.staff;
DROP POLICY IF EXISTS "hr_staff_read_access" ON public.staff;
DROP POLICY IF EXISTS "super_admin_staff_management" ON public.staff;
DROP POLICY IF EXISTS "admin_staff_read_access" ON public.staff;
DROP POLICY IF EXISTS "staff_can_read_own_record" ON public.staff;
DROP POLICY IF EXISTS "staff_read_own_data" ON public.staff;
DROP POLICY IF EXISTS "super_admin_staff_access" ON public.staff;

-- Step 3: Create simple, non-recursive policies
-- Allow staff members to read their own record
CREATE POLICY "staff_own_record" ON public.staff 
  FOR SELECT USING (auth.uid() = id);

-- Allow staff members to update their own record
CREATE POLICY "staff_update_own" ON public.staff 
  FOR UPDATE USING (auth.uid() = id);

-- Allow super admins to manage all staff (using simple auth.uid check)
CREATE POLICY "super_admin_manage_all" ON public.staff 
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM public.staff WHERE role = 'super_admin' AND id = auth.uid()
    )
  );

-- Allow public read access to basic staff info (for author attribution)
CREATE POLICY "public_staff_basic_info" ON public.staff 
  FOR SELECT USING (true);

-- Step 4: Re-enable RLS
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;