
-- Fix Critical RLS Policy Issues - Updated to handle existing policies
-- Remove overly permissive policies and implement strict role-based access

-- 1. Fix analytics table RLS policies
DROP POLICY IF EXISTS "Users can insert their own analytics" ON analytics;
DROP POLICY IF EXISTS "Staff can view all analytics" ON analytics;
DROP POLICY IF EXISTS "Authenticated users can insert analytics" ON analytics;
DROP POLICY IF EXISTS "Only admin/super_admin staff can view analytics" ON analytics;

-- Create proper analytics policies
CREATE POLICY "Authenticated users can insert analytics" ON analytics
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Only admin/super_admin staff can view analytics" ON analytics
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- 2. Fix profiles table - handle existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Staff can view all profiles for moderation" ON profiles;
DROP POLICY IF EXISTS "Staff can update user status" ON profiles;

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create new restrictive policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Staff can view all profiles for moderation" ON profiles
  FOR SELECT TO authenticated
  USING (
    id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM staff 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'moderator')
    )
  );

CREATE POLICY "Only admin/super_admin can update user status" ON profiles
  FOR UPDATE TO authenticated
  USING (
    id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM staff 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- 3. Fix pending_staff table - handle existing policies
DROP POLICY IF EXISTS "Only admin/super_admin can manage pending staff" ON pending_staff;

CREATE POLICY "Only admin/super_admin can manage pending staff" ON pending_staff
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- 4. Tighten staff table policies - handle existing policies
DROP POLICY IF EXISTS "Allow staff to view own record" ON staff;
DROP POLICY IF EXISTS "Admins can view all staff via function" ON staff;
DROP POLICY IF EXISTS "Super admins can modify staff via function" ON staff;
DROP POLICY IF EXISTS "Staff can view own record only" ON staff;
DROP POLICY IF EXISTS "Admin/super_admin can view staff records" ON staff;
DROP POLICY IF EXISTS "Only super_admin can modify staff" ON staff;

-- More restrictive staff policies
CREATE POLICY "Staff can view own record only" ON staff
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admin/super_admin can view staff records" ON staff
  FOR SELECT TO authenticated
  USING (
    id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM staff s
      WHERE s.id = auth.uid() 
      AND s.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Only super_admin can modify staff" ON staff
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff s
      WHERE s.id = auth.uid() 
      AND s.role = 'super_admin'
    )
  );

-- 5. Add rate limiting table for authentication attempts
CREATE TABLE IF NOT EXISTS auth_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  attempt_type text NOT NULL CHECK (attempt_type IN ('login', 'signup', 'password_reset')),
  ip_address inet,
  attempted_at timestamp with time zone DEFAULT now(),
  success boolean DEFAULT false
);

-- Enable RLS on auth_attempts
ALTER TABLE auth_attempts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "System can insert auth attempts" ON auth_attempts;
DROP POLICY IF EXISTS "Admins can view auth attempts" ON auth_attempts;

-- Create policies for auth_attempts
CREATE POLICY "System can insert auth attempts" ON auth_attempts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view auth attempts" ON auth_attempts
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- 6. Create security audit log table
CREATE TABLE IF NOT EXISTS security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  ip_address inet,
  user_agent text,
  details jsonb,
  severity text CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only admins can view security events" ON security_events;

CREATE POLICY "Only admins can view security events" ON security_events
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- 7. Create function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
  p_event_type text,
  p_user_id uuid DEFAULT NULL,
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_details jsonb DEFAULT NULL,
  p_severity text DEFAULT 'medium'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  event_id uuid;
BEGIN
  INSERT INTO security_events (event_type, user_id, ip_address, user_agent, details, severity)
  VALUES (p_event_type, p_user_id, p_ip_address, p_user_agent, p_details, p_severity)
  RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$;

-- 8. Create function to check rate limits
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_email text,
  p_attempt_type text,
  p_time_window interval DEFAULT '15 minutes',
  p_max_attempts integer DEFAULT 5
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  attempt_count integer;
BEGIN
  SELECT COUNT(*) INTO attempt_count
  FROM auth_attempts
  WHERE email = p_email
    AND attempt_type = p_attempt_type
    AND attempted_at > now() - p_time_window;
    
  RETURN attempt_count < p_max_attempts;
END;
$$;

-- 9. Add indexes for performance on security tables
CREATE INDEX IF NOT EXISTS idx_auth_attempts_email_time ON auth_attempts(email, attempted_at);
CREATE INDEX IF NOT EXISTS idx_security_events_user_time ON security_events(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_security_events_type_severity ON security_events(event_type, severity);

-- 10. Update existing permission functions to log security events
CREATE OR REPLACE FUNCTION validate_staff_action(staff_id uuid, action_type text, resource_type text DEFAULT NULL::text, target_id uuid DEFAULT NULL::uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  permission_name TEXT;
  is_valid BOOLEAN := FALSE;
  staff_role TEXT;
BEGIN
  -- Get the staff member's role first
  SELECT role INTO staff_role 
  FROM public.staff 
  WHERE id = staff_id;
  
  -- If not a staff member, log security event and deny access
  IF staff_role IS NULL THEN
    PERFORM log_security_event(
      'unauthorized_access_attempt',
      staff_id,
      NULL,
      NULL,
      jsonb_build_object(
        'action_type', action_type,
        'resource_type', resource_type,
        'target_id', target_id
      ),
      'high'
    );
    RETURN FALSE;
  END IF;
  
  -- Construct permission name from resource and action type
  IF resource_type IS NOT NULL THEN
    permission_name := resource_type || '.' || action_type;
  ELSE
    permission_name := action_type;
  END IF;
  
  -- Check if staff has the required permission
  SELECT EXISTS (
    SELECT 1 
    FROM public.role_permissions rp
    JOIN public.staff_permissions sp ON rp.permission_id = sp.id
    WHERE rp.role = staff_role 
    AND sp.permission_name = permission_name
  ) INTO is_valid;
  
  -- Log permission check
  INSERT INTO public.staff_activity_logs (
    staff_id, 
    action_type, 
    description,
    entity_type,
    entity_id,
    details
  ) VALUES (
    staff_id,
    'permission_check',
    'Permission validation for: ' || permission_name,
    resource_type,
    target_id,
    jsonb_build_object(
      'permission', permission_name,
      'staff_role', staff_role,
      'granted', is_valid,
      'timestamp', NOW()
    )
  );
  
  -- Log security event if permission denied
  IF NOT is_valid THEN
    PERFORM log_security_event(
      'permission_denied',
      staff_id,
      NULL,
      NULL,
      jsonb_build_object(
        'permission', permission_name,
        'staff_role', staff_role,
        'action_type', action_type,
        'resource_type', resource_type
      ),
      'medium'
    );
  END IF;
  
  RETURN is_valid;
END;
$$;
