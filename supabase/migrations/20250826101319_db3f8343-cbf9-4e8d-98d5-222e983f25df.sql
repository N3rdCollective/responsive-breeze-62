-- Fix staff table RLS infinite recursion by creating proper security definer functions

-- First, create security definer functions to avoid recursive RLS issues
CREATE OR REPLACE FUNCTION public.get_user_staff_role(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT role FROM public.staff WHERE id = user_id LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.is_user_staff_member(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (SELECT 1 FROM public.staff WHERE id = user_id);
$function$;

-- Drop existing problematic staff table policies
DROP POLICY IF EXISTS "Users can read own staff record" ON public.staff;
DROP POLICY IF EXISTS "Staff can read all staff records" ON public.staff;
DROP POLICY IF EXISTS "Admins can manage staff" ON public.staff;
DROP POLICY IF EXISTS "Super admins can delete staff" ON public.staff;
DROP POLICY IF EXISTS "Users can view own staff record" ON public.staff;
DROP POLICY IF EXISTS "Staff can view other staff records" ON public.staff;
DROP POLICY IF EXISTS "Only super admins can modify staff" ON public.staff;

-- Create new non-recursive policies using the security definer functions
CREATE POLICY "users_can_read_own_staff_record" ON public.staff
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "staff_can_read_all_staff_records" ON public.staff
  FOR SELECT USING (public.is_user_staff_member(auth.uid()));

CREATE POLICY "admins_can_manage_staff" ON public.staff
  FOR ALL USING (
    public.get_user_staff_role(auth.uid()) IN ('admin', 'super_admin')
  );

-- Ensure RLS is enabled
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;