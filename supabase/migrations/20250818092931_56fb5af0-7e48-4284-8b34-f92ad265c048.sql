-- Comprehensive Security Fix: Remove all public access and implement proper RLS

-- 1. Fix profiles table - remove public access
DROP POLICY IF EXISTS "Public can view user profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public to view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public can read user profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view public profiles" ON public.profiles;

-- Replace with secure policies
CREATE POLICY "Users can view own profiles" 
ON public.profiles 
FOR SELECT 
USING (id = auth.uid());

CREATE POLICY "Staff can view public profiles only" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid() AND role IN ('admin', 'moderator')) 
  AND is_public = true
);

CREATE POLICY "Super admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid() AND role = 'super_admin')
);

-- 2. Fix job_applications - remove public access
DROP POLICY IF EXISTS "Anyone can submit job applications" ON public.job_applications;

CREATE POLICY "Public can submit applications only" 
ON public.job_applications 
FOR INSERT 
WITH CHECK (true);

-- 3. Fix analytics - remove public read access  
DROP POLICY IF EXISTS "Authenticated users can insert analytics" ON public.analytics;
DROP POLICY IF EXISTS "Users can insert their own analytics" ON public.analytics;

CREATE POLICY "Users can insert own analytics" 
ON public.analytics 
FOR INSERT 
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- 4. Fix security_events - restrict access
DROP POLICY IF EXISTS "Public can view security events" ON public.security_events;

CREATE POLICY "Super admins can view security events" 
ON public.security_events 
FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid() AND role = 'super_admin')
);

-- 5. Fix staff_activity_logs - restrict access
DROP POLICY IF EXISTS "Public can view staff logs" ON public.staff_activity_logs;

CREATE POLICY "Staff can view own activity logs" 
ON public.staff_activity_logs 
FOR SELECT 
USING (staff_id = auth.uid());

CREATE POLICY "Super admins can view all staff logs" 
ON public.staff_activity_logs 
FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid() AND role = 'super_admin')
);

-- 6. Fix messages tables - ensure proper user isolation
DROP POLICY IF EXISTS "Public can read messages" ON public.messages;
DROP POLICY IF EXISTS "Anyone can view messages" ON public.messages;

-- Messages policies already exist and are secure, but let's ensure user_messages is also secure
CREATE POLICY "Users can view own messages only" 
ON public.user_messages 
FOR SELECT 
USING (
  (sender_id = auth.uid()) OR (recipient_id = auth.uid())
);

-- 7. Remove any remaining public access policies
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Find and drop any policies that allow public access
    FOR r IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND (
            qual LIKE '%true%' OR 
            qual LIKE '%anon%' OR
            with_check LIKE '%true%'
        )
        AND policyname NOT LIKE '%insert%'
        AND policyname NOT LIKE '%submit%'
        AND tablename IN ('profiles', 'analytics', 'security_events', 'staff_activity_logs')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;