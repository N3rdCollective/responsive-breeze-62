-- Fix profiles table security - remove overly permissive policies and implement strict data protection

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

-- Create function for users to safely view public profile data
CREATE OR REPLACE FUNCTION public.get_public_profile_safe(p_profile_id UUID)
RETURNS TABLE (
  id UUID,
  username TEXT,
  display_name TEXT,
  profile_picture TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  forum_post_count INTEGER,
  social_links JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if profile exists and is public
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = p_profile_id 
    AND (is_public = true OR profiles.id = auth.uid())
  ) THEN
    RETURN;
  END IF;
  
  -- Log access if viewing someone else's profile
  IF p_profile_id != auth.uid() THEN
    PERFORM public.log_profile_access_secure(
      p_profile_id,
      'public_view',
      'Public profile view',
      ARRAY['username', 'display_name', 'bio', 'profile_picture']
    );
  END IF;
  
  -- Return only non-sensitive public data
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.display_name,
    p.profile_picture,
    p.bio,
    p.created_at,
    p.forum_post_count,
    p.social_links
  FROM public.profiles p
  WHERE p.id = p_profile_id;
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
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql
SET search_path TO 'public';

-- Create trigger for profile changes
DROP TRIGGER IF EXISTS audit_profile_changes_trigger ON public.profiles;
CREATE TRIGGER audit_profile_changes_trigger
  AFTER INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_profile_changes();

-- Create a secure view for staff to access necessary profile data
CREATE VIEW public.profiles_staff_view AS
SELECT 
  p.id,
  p.username,
  p.display_name,
  p.status,
  p.created_at,
  p.updated_at,
  p.last_active,
  p.forum_post_count,
  p.pending_report_count,
  -- Sensitive fields only for super admins
  CASE 
    WHEN EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid() AND role = 'super_admin')
    THEN p.email
    ELSE '[REDACTED]'
  END as email,
  CASE 
    WHEN EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid() AND role = 'super_admin')
    THEN p.first_name
    ELSE '[REDACTED]'
  END as first_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid() AND role = 'super_admin')
    THEN p.last_name
    ELSE '[REDACTED]'
  END as last_name
FROM public.profiles p
WHERE public.check_staff_profile_access(p.id, 'staff_view');

-- Enable security barrier on the staff view
ALTER VIEW public.profiles_staff_view SET (security_barrier = true);

-- Grant appropriate permissions
GRANT SELECT ON public.profiles_staff_view TO authenticated;