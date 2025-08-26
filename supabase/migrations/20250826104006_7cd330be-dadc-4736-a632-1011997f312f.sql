-- Enhanced Profile Security Implementation (Fixed)

-- 1. Create access justification table
CREATE TABLE IF NOT EXISTS public.profile_access_justifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accessor_id UUID NOT NULL,
  target_profile_id UUID NOT NULL,
  access_reason TEXT NOT NULL,
  access_purpose TEXT NOT NULL CHECK (access_purpose IN ('moderation', 'support', 'emergency', 'investigation')),
  approved_by UUID,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Enable RLS on justifications table
ALTER TABLE public.profile_access_justifications ENABLE ROW LEVEL SECURITY;

-- 2. Enhanced access audit table
CREATE TABLE IF NOT EXISTS public.enhanced_profile_access_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accessor_id UUID NOT NULL,
  target_profile_id UUID NOT NULL,
  access_type TEXT NOT NULL,
  access_reason TEXT,
  accessed_fields TEXT[],
  access_purpose TEXT,
  justification_id UUID REFERENCES public.profile_access_justifications(id),
  ip_address INET,
  user_agent TEXT,
  session_info JSONB,
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on enhanced audit table
ALTER TABLE public.enhanced_profile_access_audit ENABLE ROW LEVEL SECURITY;

-- 3. Create enhanced logging function
CREATE OR REPLACE FUNCTION public.log_profile_access_enhanced(
  p_target_profile_id UUID,
  p_access_type TEXT,
  p_access_reason TEXT DEFAULT NULL,
  p_accessed_fields TEXT[] DEFAULT NULL,
  p_access_purpose TEXT DEFAULT NULL,
  p_justification_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_risk_level TEXT := 'low';
  v_accessor_role TEXT;
BEGIN
  -- Get accessor role
  SELECT role INTO v_accessor_role FROM public.staff WHERE id = auth.uid();
  
  -- Determine risk level
  IF p_accessed_fields && ARRAY['email', 'first_name', 'last_name'] THEN
    v_risk_level := 'high';
  ELSIF v_accessor_role = 'super_admin' THEN
    v_risk_level := 'medium';
  END IF;
  
  -- Insert enhanced audit record
  INSERT INTO public.enhanced_profile_access_audit (
    accessor_id,
    target_profile_id,
    access_type,
    access_reason,
    accessed_fields,
    access_purpose,
    justification_id,
    risk_level
  ) VALUES (
    auth.uid(),
    p_target_profile_id,
    p_access_type,
    p_access_reason,
    p_accessed_fields,
    p_access_purpose,
    p_justification_id,
    v_risk_level
  );
  
  -- Alert on high-risk access
  IF v_risk_level IN ('high', 'critical') THEN
    PERFORM public.log_security_event(
      'high_risk_profile_access',
      auth.uid(),
      NULL,
      NULL,
      jsonb_build_object(
        'target_profile_id', p_target_profile_id,
        'access_type', p_access_type,
        'accessed_fields', p_accessed_fields,
        'risk_level', v_risk_level
      ),
      v_risk_level
    );
  END IF;
END;
$$;

-- 4. Create field-level access control function
CREATE OR REPLACE FUNCTION public.check_profile_field_access(
  p_profile_id UUID,
  p_field_name TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_staff_role TEXT;
  v_is_own_profile BOOLEAN;
BEGIN
  -- Check if accessing own profile
  v_is_own_profile := (auth.uid() = p_profile_id);
  
  -- Always allow access to own profile
  IF v_is_own_profile THEN
    RETURN TRUE;
  END IF;
  
  -- Get staff role
  SELECT role INTO v_staff_role FROM public.staff WHERE id = auth.uid();
  
  -- Non-staff cannot access other profiles
  IF v_staff_role IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Field-level restrictions
  CASE p_field_name
    WHEN 'email', 'first_name', 'last_name' THEN
      -- Only super admins can access sensitive fields
      RETURN v_staff_role = 'super_admin';
    WHEN 'username', 'display_name', 'bio', 'profile_picture', 'social_links' THEN
      -- Moderators and above can access public fields
      RETURN v_staff_role IN ('moderator', 'admin', 'super_admin');
    ELSE
      -- Default deny for unknown fields
      RETURN FALSE;
  END CASE;
END;
$$;

-- 5. Replace existing problematic profile RLS policies with secure ones
DROP POLICY IF EXISTS "STAFF_MODERATION_LIMITED_ACCESS" ON public.profiles;
DROP POLICY IF EXISTS "SUPER_ADMIN_EMERGENCY_ACCESS" ON public.profiles;

-- Create new secure field-level access policy for staff
CREATE POLICY "SECURE_STAFF_FIELD_ACCESS" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  -- Own profile access
  auth.uid() = id OR
  -- Staff moderation access with field-level controls
  (auth.uid() != id AND public.check_profile_field_access(id, 'username'))
);

-- Update existing profile access function to use enhanced logging
CREATE OR REPLACE FUNCTION public.check_staff_profile_access_secure(
  p_profile_id UUID, 
  p_access_type TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_role TEXT;
  is_rate_limited BOOLEAN;
BEGIN
  -- Get current user role safely
  SELECT role INTO current_user_role
  FROM public.staff
  WHERE id = auth.uid();
  
  -- Only staff can access other profiles
  IF current_user_role IS NULL THEN
    -- Log unauthorized attempt
    PERFORM public.log_security_event(
      'unauthorized_profile_access_attempt',
      auth.uid(),
      NULL,
      NULL,
      jsonb_build_object(
        'target_profile_id', p_profile_id,
        'access_type', p_access_type,
        'user_role', 'non_staff'
      ),
      'high'
    );
    RETURN FALSE;
  END IF;
  
  -- Rate limiting check
  SELECT NOT public.enhanced_rate_limit_check(
    auth.uid(), 
    'profile_access', 
    10, 
    '5 minutes'::INTERVAL
  ) INTO is_rate_limited;
  
  IF is_rate_limited THEN
    RETURN FALSE;
  END IF;
  
  -- Log with enhanced function
  PERFORM public.log_profile_access_enhanced(
    p_profile_id,
    p_access_type,
    'Staff moderation access',
    ARRAY['username', 'display_name', 'bio'],
    'moderation'
  );
  
  -- Only moderators, admins, and super_admins can access
  RETURN current_user_role IN ('moderator', 'admin', 'super_admin');
END;
$$;

-- 6. RLS Policies for new tables

-- Profile access justifications policies
CREATE POLICY "Staff can view justifications they created or are targets of"
ON public.profile_access_justifications
FOR SELECT TO authenticated
USING (
  accessor_id = auth.uid() OR 
  target_profile_id = auth.uid() OR
  approved_by = auth.uid() OR
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

CREATE POLICY "Staff can create access justifications"
ON public.profile_access_justifications
FOR INSERT TO authenticated
WITH CHECK (
  accessor_id = auth.uid() AND
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid())
);

CREATE POLICY "Admins can approve justifications"
ON public.profile_access_justifications
FOR UPDATE TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Enhanced audit policies
CREATE POLICY "Super admins can view all audit logs"
ON public.enhanced_profile_access_audit
FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid() AND role = 'super_admin')
);

CREATE POLICY "Staff can view their own audit logs"
ON public.enhanced_profile_access_audit
FOR SELECT TO authenticated
USING (
  accessor_id = auth.uid()
);

-- 7. Create compliance report function
CREATE OR REPLACE FUNCTION public.generate_profile_access_report(
  p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE(
  accessor_email TEXT,
  staff_role TEXT,
  access_count BIGINT,
  high_risk_access_count BIGINT,
  last_access TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only super admins can generate compliance reports
  IF NOT EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid() AND role = 'super_admin') THEN
    RAISE EXCEPTION 'Access denied: Super admin role required';
  END IF;
  
  RETURN QUERY
  SELECT 
    s.email,
    s.role,
    COUNT(*) as access_count,
    COUNT(*) FILTER (WHERE epa.risk_level IN ('high', 'critical')) as high_risk_access_count,
    MAX(epa.created_at) as last_access
  FROM public.enhanced_profile_access_audit epa
  JOIN public.staff s ON epa.accessor_id = s.id
  WHERE epa.created_at BETWEEN p_start_date AND p_end_date
  GROUP BY s.email, s.role
  ORDER BY access_count DESC;
END;
$$;