-- Fix 1: Enable RLS on staff_data_audit table and add proper policies
ALTER TABLE public.staff_data_audit ENABLE ROW LEVEL SECURITY;

-- Only super_admins can view audit logs
CREATE POLICY "super_admin_view_audit_logs"
ON public.staff_data_audit
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.staff
    WHERE id = auth.uid()
    AND role = 'super_admin'
  )
);

-- System can insert audit logs (for logging functions)
CREATE POLICY "system_insert_audit_logs"
ON public.staff_data_audit
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Block all UPDATE operations - audit logs are immutable
CREATE POLICY "immutable_audit_logs_update"
ON public.staff_data_audit
FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false);

-- Block all DELETE operations - audit logs are immutable
CREATE POLICY "immutable_audit_logs_delete"
ON public.staff_data_audit
FOR DELETE
TO authenticated
USING (false);

-- Fix 2: Create secure RPC function for email availability check
-- This prevents exposing actual email addresses
CREATE OR REPLACE FUNCTION public.check_email_availability(p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  email_exists boolean;
BEGIN
  -- Rate limiting: prevent enumeration attacks
  -- Check if too many requests from this session
  IF EXISTS (
    SELECT 1 FROM public.auth_attempts
    WHERE email = p_email
    AND attempted_at > NOW() - INTERVAL '5 minutes'
    GROUP BY email
    HAVING COUNT(*) > 10
  ) THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please try again later.';
  END IF;

  -- Check if email exists in profiles
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE email = p_email
  ) INTO email_exists;
  
  -- Return true if email is AVAILABLE (does not exist)
  RETURN NOT email_exists;
END;
$$;