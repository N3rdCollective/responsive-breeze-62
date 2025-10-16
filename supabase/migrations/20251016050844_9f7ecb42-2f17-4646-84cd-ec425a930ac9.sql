-- CRITICAL FIX 1: Secure Profile PII Access with Mandatory Audit Logging
-- Create function to get sensitive profile fields with mandatory justification

CREATE OR REPLACE FUNCTION public.get_profile_sensitive_fields(
  p_target_profile_id uuid,
  p_access_reason text,
  p_access_purpose text DEFAULT 'user_support'
)
RETURNS TABLE(
  email text,
  first_name text,
  last_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_accessor_role text;
BEGIN
  -- Verify caller is staff
  SELECT role INTO v_accessor_role
  FROM public.staff
  WHERE id = auth.uid();
  
  IF v_accessor_role IS NULL THEN
    RAISE EXCEPTION 'Access denied: Staff role required';
  END IF;
  
  -- Validate access reason is provided
  IF p_access_reason IS NULL OR length(trim(p_access_reason)) < 10 THEN
    RAISE EXCEPTION 'Access reason required (minimum 10 characters explaining why you need to view this PII)';
  END IF;
  
  -- Log the sensitive access
  PERFORM public.log_profile_access_enhanced(
    p_target_profile_id,
    'sensitive_field_access',
    p_access_reason,
    ARRAY['email', 'first_name', 'last_name'],
    p_access_purpose,
    NULL
  );
  
  -- Return sensitive fields
  RETURN QUERY
  SELECT p.email, p.first_name, p.last_name
  FROM public.profiles p
  WHERE p.id = p_target_profile_id;
END;
$$;

COMMENT ON FUNCTION public.get_profile_sensitive_fields IS 'Securely access user PII with mandatory audit logging. All email/name access must go through this function.';

-- Create helper function to get multiple profiles' contact info (for bulk operations)
CREATE OR REPLACE FUNCTION public.get_profiles_contact_info_bulk(
  p_profile_ids uuid[],
  p_access_reason text,
  p_access_purpose text DEFAULT 'bulk_operation'
)
RETURNS TABLE(
  id uuid,
  email text,
  first_name text,
  last_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_accessor_role text;
  profile_id uuid;
BEGIN
  -- Verify caller is staff
  SELECT role INTO v_accessor_role
  FROM public.staff
  WHERE id = auth.uid();
  
  IF v_accessor_role IS NULL THEN
    RAISE EXCEPTION 'Access denied: Staff role required';
  END IF;
  
  -- Validate access reason
  IF p_access_reason IS NULL OR length(trim(p_access_reason)) < 10 THEN
    RAISE EXCEPTION 'Access reason required (minimum 10 characters)';
  END IF;
  
  -- Log access for each profile
  FOREACH profile_id IN ARRAY p_profile_ids
  LOOP
    PERFORM public.log_profile_access_enhanced(
      profile_id,
      'bulk_sensitive_access',
      p_access_reason,
      ARRAY['email', 'first_name', 'last_name'],
      p_access_purpose,
      NULL
    );
  END LOOP;
  
  -- Return data
  RETURN QUERY
  SELECT p.id, p.email, p.first_name, p.last_name
  FROM public.profiles p
  WHERE p.id = ANY(p_profile_ids);
END;
$$;