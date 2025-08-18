-- Final Comprehensive Security Fix: Ensure RLS is enabled and remove all public access

-- 1. Ensure RLS is enabled on all sensitive tables
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_activity_logs ENABLE ROW LEVEL SECURITY;

-- 2. Drop ALL existing policies and create secure ones

-- Job Applications: Complete lockdown except for HR
DROP POLICY IF EXISTS "Anyone can submit job applications" ON public.job_applications;
DROP POLICY IF EXISTS "HR staff can view applications" ON public.job_applications;
DROP POLICY IF EXISTS "HR staff can update applications" ON public.job_applications;

CREATE POLICY "Public can submit applications" 
ON public.job_applications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "HR staff only can view applications" 
ON public.job_applications 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.staff s
    JOIN public.role_permissions rp ON s.role = rp.role
    JOIN public.staff_permissions sp ON rp.permission_id = sp.id
    WHERE s.id = auth.uid() 
    AND sp.permission_name = 'hr.manage_applications'
  )
);

-- Analytics: Users see only their own data
DROP POLICY IF EXISTS "Staff can view analytics" ON public.analytics;
DROP POLICY IF EXISTS "Users can view own analytics" ON public.analytics;
DROP POLICY IF EXISTS "Only admin/super_admin staff can view analytics" ON public.analytics;

CREATE POLICY "Users view own analytics only" 
ON public.analytics 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Super admins view all analytics" 
ON public.analytics 
FOR SELECT 
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid() AND role = 'super_admin')
);

-- Security Events: Super admin only
DROP POLICY IF EXISTS "Super admins view security events" ON public.security_events;

CREATE POLICY "Super admin only security events" 
ON public.security_events 
FOR ALL 
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid() AND role = 'super_admin')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid() AND role = 'super_admin')
);

-- Auth Attempts: Super admin only
DROP POLICY IF EXISTS "Super admins only can view auth attempts" ON public.auth_attempts;
DROP POLICY IF EXISTS "System service can insert auth attempts" ON public.auth_attempts;

CREATE POLICY "System can insert auth attempts" 
ON public.auth_attempts 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Super admin only auth attempts" 
ON public.auth_attempts 
FOR SELECT 
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid() AND role = 'super_admin')
);

-- Staff Activity Logs: Own logs + super admin
DROP POLICY IF EXISTS "Staff view own activity logs" ON public.staff_activity_logs;

CREATE POLICY "Staff view own logs only" 
ON public.staff_activity_logs 
FOR SELECT 
TO authenticated
USING (
  (staff_id = auth.uid()) OR 
  (EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid() AND role = 'super_admin'))
);

-- 3. Remove any remaining public-accessible policies
DO $$
DECLARE
    pol_record RECORD;
BEGIN
    -- Find and drop policies that might allow public access on sensitive tables
    FOR pol_record IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('job_applications', 'analytics', 'security_events', 'auth_attempts', 'staff_activity_logs')
        AND policyname NOT IN (
            'Public can submit applications',
            'HR staff only can view applications', 
            'Users view own analytics only',
            'Super admins view all analytics',
            'Super admin only security events',
            'System can insert auth attempts',
            'Super admin only auth attempts',
            'Staff view own logs only'
        )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol_record.policyname, pol_record.schemaname, pol_record.tablename);
    END LOOP;
END $$;