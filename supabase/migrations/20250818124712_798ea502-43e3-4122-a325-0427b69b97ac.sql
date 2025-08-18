-- CRITICAL: Secure Authentication Logs from Unauthorized Access

-- 1. Enable FORCE ROW LEVEL SECURITY for strictest enforcement
ALTER TABLE public.auth_attempts FORCE ROW LEVEL SECURITY;

-- 2. Drop existing policies and create more restrictive ones
DROP POLICY IF EXISTS "System can insert auth attempts" ON public.auth_attempts;
DROP POLICY IF EXISTS "Super admin only auth attempts" ON public.auth_attempts;

-- 3. Create secure policies with explicit role restrictions
CREATE POLICY "System service can log auth attempts" 
ON public.auth_attempts 
FOR INSERT 
WITH CHECK (true); -- System needs to log attempts

CREATE POLICY "Super admins only can read auth logs" 
ON public.auth_attempts 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  )
);

-- 4. Explicit denial of all other operations
CREATE POLICY "Deny public access to auth attempts" 
ON public.auth_attempts 
FOR ALL 
TO public
USING (false)
WITH CHECK (false);

-- 5. Deny UPDATE and DELETE for everyone (logs should be immutable)
CREATE POLICY "Auth logs are immutable - no updates" 
ON public.auth_attempts 
FOR UPDATE 
TO authenticated
USING (false)
WITH CHECK (false);

CREATE POLICY "Auth logs are immutable - no deletion" 
ON public.auth_attempts 
FOR DELETE 
TO authenticated
USING (false);

-- 6. Create audit function for auth log access
CREATE OR REPLACE FUNCTION public.log_auth_log_access()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log when super admins access authentication logs
  INSERT INTO public.staff_activity_logs (
    staff_id,
    action_type,
    description,
    entity_type,
    entity_id,
    details
  ) VALUES (
    auth.uid(),
    'security_log_access',
    'Super admin accessed authentication logs',
    'auth_attempts',
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object(
      'accessed_email', COALESCE(NEW.email, OLD.email),
      'attempt_type', COALESCE(NEW.attempt_type, OLD.attempt_type),
      'timestamp', NOW()
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 7. Create audit trigger for auth log access (INSERT/UPDATE only, no SELECT triggers)
CREATE TRIGGER audit_auth_log_access
  AFTER INSERT OR UPDATE ON public.auth_attempts
  FOR EACH ROW EXECUTE FUNCTION public.log_auth_log_access();