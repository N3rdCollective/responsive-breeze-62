-- Fix system_settings table RLS policies to resolve permission denied errors

-- Check if system_settings table exists and add RLS policy
-- Allow public read access to system_settings (needed for homepage functionality)
CREATE POLICY IF NOT EXISTS "public_read_system_settings" ON public.system_settings 
  FOR SELECT USING (true);

-- Allow staff to manage system settings  
CREATE POLICY IF NOT EXISTS "staff_manage_system_settings" ON public.system_settings 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.staff 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'content_manager')
    )
  );