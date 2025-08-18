-- Phase 1: Critical Security Fixes - Restrict Job Application and Analytics Access

-- 1. Create HR admin role for job applications with proper required fields
INSERT INTO public.staff_permissions (permission_name, description, resource_type, action_type) 
VALUES ('hr.manage_applications', 'Manage job applications and hiring process', 'job_applications', 'manage')
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

-- 6. Create more granular profile access policies
CREATE POLICY "Users can view own profiles" 
ON public.profiles 
FOR SELECT 
USING (id = auth.uid());

CREATE POLICY "Staff can view public profiles only" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin', 'moderator')
  ) 
  AND is_public = true
);

CREATE POLICY "Super admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);