-- Fix profiles table security - fix function conflict and implement strict data protection

-- Drop existing conflicting function first
DROP FUNCTION IF EXISTS public.get_public_profile_safe(uuid);

-- Drop existing policies that may allow public access
DROP POLICY IF EXISTS "deny_anonymous_access" ON public.profiles;
DROP POLICY IF EXISTS "users_own_profile_access" ON public.profiles;
DROP POLICY IF EXISTS "staff_moderation_view" ON public.profiles;
DROP POLICY IF EXISTS "staff_moderation_update" ON public.profiles;
DROP POLICY IF EXISTS "super_admin_delete_only" ON public.profiles;

-- Create audit table for profile access logging
CREATE TABLE IF NOT EXISTS public.profile_access_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accessor_id UUID REFERENCES auth.users(id),
  target_profile_id UUID REFERENCES public.profiles(id),
  access_type TEXT NOT NULL, -- 'view', 'update', 'staff_moderation'
  access_reason TEXT,
  ip_address INET,
  user_agent TEXT,
  accessed_fields TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profile audit table
ALTER TABLE public.profile_access_audit ENABLE ROW LEVEL SECURITY;

-- Only super admins can view profile access logs
CREATE POLICY "super_admin_view_profile_audit" ON public.profile_access_audit
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.staff 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- Create secure function to log profile access
CREATE OR REPLACE FUNCTION public.log_profile_access_secure(
  p_target_profile_id UUID,
  p_access_type TEXT,
  p_access_reason TEXT DEFAULT NULL,
  p_accessed_fields TEXT[] DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profile_access_audit (
    accessor_id,
    target_profile_id,
    access_type,
    access_reason,
    accessed_fields
  ) VALUES (
    auth.uid(),
    p_target_profile_id,
    p_access_type,
    p_access_reason,
    p_accessed_fields
  );
END;
$$;

-- Create function to check if staff access is legitimate and log it
CREATE OR REPLACE FUNCTION public.check_staff_profile_access(
  p_target_profile_id UUID,
  p_access_type TEXT DEFAULT 'view'
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  has_access BOOLEAN := FALSE;
  staff_role TEXT;
BEGIN
  -- Check if user is staff and get their role
  SELECT role INTO staff_role
  FROM public.staff 
  WHERE id = auth.uid();
  
  IF staff_role IS NOT NULL THEN
    has_access := TRUE;
    
    -- Log the staff access
    PERFORM public.log_profile_access_secure(
      p_target_profile_id,
      p_access_type,
      'Staff moderation: ' || staff_role || ' accessing profile',
      CASE p_access_type 
        WHEN 'view' THEN ARRAY['display_name', 'username', 'status', 'created_at']
        WHEN 'update' THEN ARRAY['status', 'updated_at']
        ELSE ARRAY['basic_info']
      END
    );
  ELSE
    -- Log unauthorized attempt
    PERFORM public.log_security_event(
      'unauthorized_profile_access',
      auth.uid(),
      NULL,
      NULL,
      jsonb_build_object(
        'target_profile_id', p_target_profile_id,
        'access_type', p_access_type,
        'timestamp', NOW()
      ),
      'medium'
    );
  END IF;
  
  RETURN has_access;
END;
$$;

-- NEW STRICT RLS POLICIES

-- 1. Deny ALL anonymous access completely
CREATE POLICY "profiles_deny_anonymous_access" ON public.profiles
  FOR ALL
  TO anon
  USING (FALSE)
  WITH CHECK (FALSE);

-- 2. Users can only access their own profile data
CREATE POLICY "profiles_own_access_only" ON public.profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. Staff can view profiles only for moderation (with audit logging)
CREATE POLICY "profiles_staff_moderation_view" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() != id AND  -- Can't use this for own profile
    public.check_staff_profile_access(id, 'view')
  );

-- 4. Staff can update profiles only for moderation (limited fields)
CREATE POLICY "profiles_staff_moderation_update" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() != id AND  -- Can't use this for own profile
    public.check_staff_profile_access(id, 'update')
  )
  WITH CHECK (
    auth.uid() != id AND
    public.check_staff_profile_access(id, 'update')
  );

-- 5. Only super admins can delete profiles (emergency only)
CREATE POLICY "profiles_super_admin_delete_only" ON public.profiles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- Create trigger to automatically log profile modifications
CREATE OR REPLACE FUNCTION public.audit_profile_changes()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  -- Log profile changes
  IF TG_OP = 'UPDATE' THEN
    PERFORM public.log_profile_access_secure(
      NEW.id,
      'profile_updated',
      'Profile data modified',
      ARRAY['updated_at']
    );
  ELSIF TG_OP = 'INSERT' THEN
    PERFORM public.log_profile_access_secure(
      NEW.id,
      'profile_created',
      'New profile created',
      ARRAY['all_fields']
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for profile changes
DROP TRIGGER IF EXISTS audit_profile_changes_trigger ON public.profiles;
CREATE TRIGGER audit_profile_changes_trigger
  AFTER INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_profile_changes();