-- Critical Security Fix: Remove public read access from sensitive tables

-- 1. Remove public read access from profiles (keep authenticated access)
DROP POLICY IF EXISTS "Staff can view all profiles for moderation" ON public.profiles;
DROP POLICY IF EXISTS "Staff can view public profiles only" ON public.profiles;

-- Replace with authenticated-only policies
CREATE POLICY "Staff can view public profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid() AND role IN ('admin', 'moderator')) 
  AND is_public = true
);

-- 2. Remove public read access from analytics
DROP POLICY IF EXISTS "Staff can view aggregate analytics only" ON public.analytics;
DROP POLICY IF EXISTS "Users can view their own analytics" ON public.analytics;

-- Replace with authenticated-only policies
CREATE POLICY "Staff can view analytics" 
ON public.analytics 
FOR SELECT 
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'moderator'))
);

CREATE POLICY "Users can view own analytics" 
ON public.analytics 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- 3. Fix job applications - ensure only HR can read
DROP POLICY IF EXISTS "HR staff can view job applications" ON public.job_applications;
DROP POLICY IF EXISTS "HR staff can update job applications" ON public.job_applications;

-- Replace with authenticated-only HR policies
CREATE POLICY "HR staff can view applications" 
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

CREATE POLICY "HR staff can update applications" 
ON public.job_applications 
FOR UPDATE 
TO authenticated
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

-- 4. Remove public access from messages - ensure authenticated only
DROP POLICY IF EXISTS "Users can insert messages they send" ON public.messages;
DROP POLICY IF EXISTS "Users can see messages they've sent or received" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can update message status if they're the recipient" ON public.messages;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can mark their messages as deleted (soft delete)" ON public.messages;

-- Replace with authenticated-only message policies
CREATE POLICY "Authenticated users can send messages" 
ON public.messages 
FOR INSERT 
TO authenticated
WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Authenticated users can view their messages" 
ON public.messages 
FOR SELECT 
TO authenticated
USING ((sender_id = auth.uid()) OR (recipient_id = auth.uid()));

CREATE POLICY "Authenticated users can update their messages" 
ON public.messages 
FOR UPDATE 
TO authenticated
USING ((sender_id = auth.uid()) OR (recipient_id = auth.uid()))
WITH CHECK ((sender_id = auth.uid()) OR (recipient_id = auth.uid()));

-- 5. Create super admin security events access
CREATE POLICY "Super admins view security events" 
ON public.security_events 
FOR SELECT 
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid() AND role = 'super_admin')
);

-- 6. Create staff activity logs access
CREATE POLICY "Staff view own activity logs" 
ON public.staff_activity_logs 
FOR SELECT 
TO authenticated
USING (
  (staff_id = auth.uid()) OR 
  (EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid() AND role = 'super_admin'))
);