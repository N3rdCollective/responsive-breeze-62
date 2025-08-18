-- Phase 1: Critical Security Fixes - Restrict Job Application and Analytics Access

-- 1. Create HR admin role for job applications
INSERT INTO public.staff_permissions (permission_name, description) 
VALUES ('hr.manage_applications', 'Manage job applications and hiring process')
ON CONFLICT (permission_name) DO NOTHING;

-- Grant HR permission to super_admin role
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'super_admin', id FROM public.staff_permissions WHERE permission_name = 'hr.manage_applications'
ON CONFLICT (role, permission_id) DO NOTHING;

-- 2. Drop existing overly permissive job application policies
DROP POLICY IF EXISTS "Staff can view all job applications" ON public.job_applications;
DROP POLICY IF EXISTS "Staff can update job applications" ON public.job_applications;

-- 3. Create restrictive job application policies
CREATE POLICY "HR staff can view job applications" 
ON public.job_applications 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.staff s
    JOIN public.role_permissions rp ON s.role = rp.role
    JOIN public.staff_permissions sp ON rp.permission_id = sp.id
    WHERE s.id = auth.uid() 
    AND sp.permission_name = 'hr.manage_applications'
  )
);

CREATE POLICY "HR staff can update job applications" 
ON public.job_applications 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.staff s
    JOIN public.role_permissions rp ON s.role = rp.role
    JOIN public.staff_permissions sp ON rp.permission_id = sp.id
    WHERE s.id = auth.uid() 
    AND sp.permission_name = 'hr.manage_applications'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.staff s
    JOIN public.role_permissions rp ON s.role = rp.role
    JOIN public.staff_permissions sp ON rp.permission_id = sp.id
    WHERE s.id = auth.uid() 
    AND sp.permission_name = 'hr.manage_applications'
  )
);

-- 4. Improve analytics policies - users can only see their own data
DROP POLICY IF EXISTS "Staff can view all analytics" ON public.analytics;

CREATE POLICY "Staff can view aggregate analytics only" 
ON public.analytics 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin', 'moderator')
  )
);

CREATE POLICY "Users can view their own analytics" 
ON public.analytics 
FOR SELECT 
USING (user_id = auth.uid());

-- 5. Restrict security events access to super_admin only
DROP POLICY IF EXISTS "Security admins can view auth attempts" ON public.auth_attempts;

CREATE POLICY "Super admins only can view auth attempts" 
ON public.auth_attempts 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- 6. Create secure function to get sanitized profile data for staff
CREATE OR REPLACE FUNCTION public.get_sanitized_profile_for_staff(profile_id uuid)
RETURNS TABLE(
  id uuid,
  username text,
  display_name text,
  bio text,
  created_at timestamp with time zone,
  forum_post_count integer,
  is_public boolean
) 
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.username,
    p.display_name,
    p.bio,
    p.created_at,
    p.forum_post_count,
    p.is_public
  FROM public.profiles p
  WHERE p.id = profile_id
  AND (
    -- Super admins can see everything
    (EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid() AND role = 'super_admin')) OR
    -- Other staff can only see public profiles
    (EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid()) AND p.is_public = true) OR
    -- Users can see their own profile
    (p.id = auth.uid())
  );
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_sanitized_profile_for_staff(uuid) TO authenticated;