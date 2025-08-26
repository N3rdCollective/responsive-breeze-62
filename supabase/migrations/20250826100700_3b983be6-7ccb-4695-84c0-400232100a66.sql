-- Fix system_settings table RLS policies to resolve permission denied errors

-- Drop any existing policies first to avoid conflicts
DROP POLICY IF EXISTS "public_read_system_settings" ON public.system_settings;
DROP POLICY IF EXISTS "staff_manage_system_settings" ON public.system_settings;

-- Allow public read access to system_settings (needed for homepage functionality)
CREATE POLICY "public_read_system_settings" ON public.system_settings 
  FOR SELECT USING (true);

-- Allow staff to manage system settings  
CREATE POLICY "staff_manage_system_settings" ON public.system_settings 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.staff 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'content_manager')
    )
  );