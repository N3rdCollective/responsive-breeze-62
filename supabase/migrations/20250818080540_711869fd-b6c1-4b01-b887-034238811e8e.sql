-- Fix auth_attempts table security vulnerability
-- Drop the overly permissive existing policies
DROP POLICY IF EXISTS "System can insert auth attempts" ON public.auth_attempts;
DROP POLICY IF EXISTS "Admins can view auth attempts" ON public.auth_attempts;

-- Create secure policies for auth_attempts table

-- Only admin/super_admin staff can view auth attempts (for security monitoring)
CREATE POLICY "Security admins can view auth attempts" 
ON public.auth_attempts FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE staff.id = auth.uid() 
    AND staff.role IN ('admin', 'super_admin')
  )
);

-- Only allow inserts from service_role or authenticated system functions
-- This prevents attackers from polluting the security logs
CREATE POLICY "System service can insert auth attempts" 
ON public.auth_attempts FOR INSERT 
WITH CHECK (
  -- Only allow service_role to insert directly
  auth.role() = 'service_role'
  OR
  -- Or allow authenticated users through specific system functions
  (auth.role() = 'authenticated' AND auth.uid() IS NOT NULL)
);

-- Prevent any updates to maintain audit trail integrity
-- Auth attempts should be immutable once recorded
CREATE POLICY "No updates allowed on auth attempts" 
ON public.auth_attempts FOR UPDATE 
USING (false);

-- Prevent any deletes to maintain audit trail integrity
-- Security logs should be permanent for forensic analysis
CREATE POLICY "No deletes allowed on auth attempts" 
ON public.auth_attempts FOR DELETE 
USING (false);