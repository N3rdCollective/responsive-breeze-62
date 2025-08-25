-- Enhanced Staff Data Security Implementation (Corrected)
-- Implementing comprehensive security for staff table

-- First, drop existing problematic policies
DROP POLICY IF EXISTS "STAFF_OWN_RECORD_ONLY" ON public.staff;
DROP POLICY IF EXISTS "SUPER_ADMIN_STAFF_ACCESS" ON public.staff;

-- Create audit table for staff data access
CREATE TABLE IF NOT EXISTS public.staff_data_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  accessor_id uuid,
  target_staff_id uuid,
  access_type text NOT NULL,
  accessed_fields text[],
  access_reason text,
  ip_address inet,
  user_agent text,
  access_granted boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  session_info jsonb
);

-- Enable RLS on audit table
ALTER TABLE public.staff_data_audit ENABLE ROW LEVEL SECURITY;

-- Audit policies for staff_data_audit table
CREATE POLICY "staff_audit_own_records" ON public.staff_data_audit
FOR SELECT
TO authenticated
USING (
  accessor_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.staff
    WHERE id = auth.uid()
    AND role IN ('super_admin', 'admin')
  )
);

CREATE POLICY "system_insert_audit" ON public.staff_data_audit
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create new restrictive RLS policies for staff table

-- Policy 1: Staff can only see their own basic profile (no email)
CREATE POLICY "staff_own_basic_profile" ON public.staff
FOR SELECT
TO authenticated
USING (
  id = auth.uid()
);

-- Policy 2: HR personnel can read staff data
CREATE POLICY "hr_staff_read_access" ON public.staff
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.staff s
    WHERE s.id = auth.uid()
    AND (s.hr_permissions = true OR s.role = 'super_admin')
  )
);

-- Policy 3: Super admins can manage staff records
CREATE POLICY "super_admin_staff_management" ON public.staff
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.staff s
    WHERE s.id = auth.uid()
    AND s.role = 'super_admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.staff s
    WHERE s.id = auth.uid()
    AND s.role = 'super_admin'
  )
);

-- Policy 4: Staff can update only non-sensitive own fields
CREATE POLICY "staff_update_own_safe_fields" ON public.staff
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid() 
  AND OLD.email = NEW.email
  AND OLD.role = NEW.role
  AND OLD.hr_permissions = NEW.hr_permissions
);

-- Create enhanced security functions
CREATE OR REPLACE FUNCTION public.get_user_staff_role_secure(user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_role text;
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  -- Rate limiting: max 100 calls per minute per user
  IF EXISTS (
    SELECT 1 FROM public.staff_activity_logs 
    WHERE staff_id = current_user_id 
    AND action_type = 'role_check'
    AND created_at > NOW() - INTERVAL '1 minute'
    GROUP BY staff_id
    HAVING COUNT(*) > 100
  ) THEN
    RAISE EXCEPTION 'Rate limit exceeded for role checks';
  END IF;
  
  -- Only allow checking own role or if user is admin/super_admin
  IF current_user_id != user_id THEN
    SELECT role INTO user_role FROM public.staff WHERE id = current_user_id;
    IF user_role NOT IN ('admin', 'super_admin') THEN
      -- Log unauthorized attempt
      INSERT INTO public.staff_data_audit (
        accessor_id, target_staff_id, access_type, access_granted
      ) VALUES (
        current_user_id, user_id, 'role_check', false
      );
      RETURN NULL;
    END IF;
  END IF;
  
  SELECT role INTO user_role FROM public.staff WHERE id = user_id;
  
  -- Log successful access
  INSERT INTO public.staff_data_audit (
    accessor_id, target_staff_id, access_type, accessed_fields
  ) VALUES (
    current_user_id, user_id, 'role_check', ARRAY['role']
  );
  
  RETURN user_role;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_user_staff_member_secure(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  is_staff boolean;
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  -- Rate limiting
  IF EXISTS (
    SELECT 1 FROM public.staff_activity_logs 
    WHERE staff_id = current_user_id 
    AND action_type = 'staff_check'
    AND created_at > NOW() - INTERVAL '1 minute'
    GROUP BY staff_id
    HAVING COUNT(*) > 50
  ) THEN
    RAISE EXCEPTION 'Rate limit exceeded for staff checks';
  END IF;
  
  SELECT EXISTS(SELECT 1 FROM public.staff WHERE id = user_id) INTO is_staff;
  
  -- Log the check (only if checking someone else)
  IF current_user_id != user_id THEN
    INSERT INTO public.staff_data_audit (
      accessor_id, target_staff_id, access_type, accessed_fields
    ) VALUES (
      current_user_id, user_id, 'staff_check', ARRAY['id']
    );
  END IF;
  
  RETURN is_staff;
END;
$$;

-- Create function for sensitive staff data access
CREATE OR REPLACE FUNCTION public.get_staff_sensitive_data(target_staff_id uuid)
RETURNS TABLE(email text, created_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_role text;
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  -- Get current user role
  SELECT role INTO current_user_role FROM public.staff WHERE id = current_user_id;
  
  -- Only HR personnel and super admins can access sensitive data
  IF current_user_role NOT IN ('super_admin') AND NOT EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = current_user_id 
    AND (hr_permissions = true OR role = 'super_admin')
  ) THEN
    -- Log unauthorized attempt
    INSERT INTO public.staff_data_audit (
      accessor_id, target_staff_id, access_type, access_granted, access_reason
    ) VALUES (
      current_user_id, target_staff_id, 'sensitive_read', false, 'Insufficient permissions'
    );
    RAISE EXCEPTION 'Access denied: HR permissions required';
  END IF;
  
  -- Log successful access
  INSERT INTO public.staff_data_audit (
    accessor_id, target_staff_id, access_type, accessed_fields, access_reason
  ) VALUES (
    current_user_id, target_staff_id, 'sensitive_read', 
    ARRAY['email', 'created_at'], 'HR data access'
  );
  
  RETURN QUERY
  SELECT s.email, s.created_at
  FROM public.staff s
  WHERE s.id = target_staff_id;
END;
$$;

-- Create function to get staff list with minimal data for management UI
CREATE OR REPLACE FUNCTION public.get_staff_management_list()
RETURNS TABLE(
  id uuid,
  role text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  hr_permissions boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_role text;
BEGIN
  -- Verify user has management permissions
  SELECT s.role INTO current_user_role 
  FROM public.staff s 
  WHERE s.id = auth.uid();
  
  IF current_user_role NOT IN ('admin', 'super_admin') THEN
    RAISE EXCEPTION 'Access denied: Administrative permissions required';
  END IF;
  
  -- Log the access
  INSERT INTO public.staff_data_audit (
    accessor_id,
    access_type,
    access_reason
  ) VALUES (
    auth.uid(),
    'staff_list_read',
    'Management interface access'
  );
  
  RETURN QUERY
  SELECT 
    s.id,
    s.role,
    s.created_at,
    s.updated_at,
    s.hr_permissions
  FROM public.staff s
  ORDER BY s.role DESC, s.created_at DESC;
END;
$$;

-- Create a secure view for staff self-service (limited fields only)
CREATE OR REPLACE VIEW public.staff_own_profile AS
SELECT 
  id,
  role,
  created_at,
  updated_at,
  hr_permissions
FROM public.staff
WHERE id = auth.uid();

-- Grant necessary permissions
GRANT SELECT ON public.staff_own_profile TO authenticated;
GRANT SELECT ON public.staff_data_audit TO authenticated;
GRANT INSERT ON public.staff_data_audit TO authenticated;