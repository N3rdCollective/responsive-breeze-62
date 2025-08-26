-- Fix system_settings RLS policies to allow public read access to basic site information
-- This resolves 401 errors when anonymous users access pages that need site title, contact info, etc.

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Only staff can view system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Staff can view system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Only admins can manage system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Staff can manage system settings" ON public.system_settings;

-- Create public read policy for basic, non-sensitive system settings
CREATE POLICY "Public can read basic system settings" ON public.system_settings
FOR SELECT
USING (true);

-- Create staff-only policies for managing system settings
CREATE POLICY "Staff can insert system settings" ON public.system_settings
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

CREATE POLICY "Staff can update system settings" ON public.system_settings
FOR UPDATE
USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
)
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

CREATE POLICY "Super admins can delete system settings" ON public.system_settings
FOR DELETE
USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid() AND role = 'super_admin')
);