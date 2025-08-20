-- CRITICAL SECURITY FIX: Lock down all vulnerable tables with FORCE RLS

-- ===========================================
-- 1. SECURE PROFILES TABLE (CRITICAL)
-- ===========================================

-- Enable and force RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- Drop all existing permissive policies on profiles
DROP POLICY IF EXISTS "Allow public read access to user profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public to view user profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;

-- Create secure policies for profiles table
-- ABSOLUTE DENIAL for public role
CREATE POLICY "ABSOLUTE_DENY_PUBLIC_PROFILES_ACCESS" 
ON public.profiles 
FOR ALL 
TO public
USING (false)
WITH CHECK (false);

-- ABSOLUTE DENIAL for anon role  
CREATE POLICY "ABSOLUTE_DENY_ANON_PROFILES_ACCESS" 
ON public.profiles 
FOR ALL 
TO anon
USING (false)
WITH CHECK (false);

-- Users can only view and manage their own profile
CREATE POLICY "USERS_OWN_PROFILE_ONLY" 
ON public.profiles 
FOR ALL 
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Staff can view all profiles for moderation
CREATE POLICY "STAFF_VIEW_ALL_PROFILES" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.staff s 
    WHERE s.id = auth.uid()
  )
);

-- ===========================================
-- 2. SECURE SYSTEM_SETTINGS TABLE (CRITICAL)
-- ===========================================

-- Check if system_settings table exists and secure it
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'system_settings') THEN
    -- Enable and force RLS
    ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.system_settings FORCE ROW LEVEL SECURITY;
    
    -- Drop any existing permissive policies
    DROP POLICY IF EXISTS "Public can view system settings" ON public.system_settings;
    DROP POLICY IF EXISTS "Allow public read access to system settings" ON public.system_settings;
    
    -- ABSOLUTE DENIAL for public/anon for sensitive settings
    EXECUTE 'CREATE POLICY "DENY_PUBLIC_SYSTEM_SETTINGS" ON public.system_settings FOR ALL TO public USING (false) WITH CHECK (false)';
    EXECUTE 'CREATE POLICY "DENY_ANON_SYSTEM_SETTINGS" ON public.system_settings FOR ALL TO anon USING (false) WITH CHECK (false)';
    
    -- Only staff can manage system settings
    EXECUTE 'CREATE POLICY "STAFF_MANAGE_SYSTEM_SETTINGS" ON public.system_settings FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid()))';
  END IF;
END $$;

-- ===========================================
-- 3. SECURE HOMEPAGE_CONTENT TABLE 
-- ===========================================

-- Enable RLS on homepage_content (already has some policies but need to secure)  
ALTER TABLE public.homepage_content ENABLE ROW LEVEL SECURITY;

-- Drop any overly permissive policies
DROP POLICY IF EXISTS "Public can view homepage content" ON public.homepage_content;
DROP POLICY IF EXISTS "Allow public read access to homepage content" ON public.homepage_content;

-- Allow public to READ homepage content (this is needed for the website to work)
CREATE POLICY "PUBLIC_READ_HOMEPAGE_CONTENT" 
ON public.homepage_content 
FOR SELECT 
TO public
USING (true);

-- Only staff can modify homepage content  
CREATE POLICY "STAFF_MANAGE_HOMEPAGE_CONTENT" 
ON public.homepage_content 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.staff s 
    WHERE s.id = auth.uid() 
    AND s.role IN ('admin', 'super_admin', 'content_manager')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.staff s 
    WHERE s.id = auth.uid() 
    AND s.role IN ('admin', 'super_admin', 'content_manager')
  )
);

-- ===========================================
-- 4. REVOKE DANGEROUS PERMISSIONS
-- ===========================================

-- Revoke any dangerous default permissions
REVOKE ALL ON public.profiles FROM public;
REVOKE ALL ON public.profiles FROM anon;

-- Revoke permissions on system_settings if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'system_settings') THEN
    EXECUTE 'REVOKE ALL ON public.system_settings FROM public';
    EXECUTE 'REVOKE ALL ON public.system_settings FROM anon';
  END IF;
END $$;

-- ===========================================
-- 5. ADD AUDIT LOGGING FOR SENSITIVE ACCESS
-- ===========================================

-- Create audit log for profile access by staff
CREATE OR REPLACE FUNCTION public.audit_profile_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log when staff access other users' profiles
  IF auth.uid() != COALESCE(NEW.id, OLD.id) AND EXISTS(SELECT 1 FROM public.staff WHERE id = auth.uid()) THEN
    INSERT INTO public.staff_activity_logs (
      staff_id,
      action_type,
      description,
      entity_type,
      entity_id,
      details
    ) VALUES (
      auth.uid(),
      TG_OP,
      'Staff accessed user profile: ' || COALESCE(NEW.username, OLD.username, 'Unknown'),
      'profiles',
      COALESCE(NEW.id, OLD.id),
      jsonb_build_object(
        'profile_id', COALESCE(NEW.id, OLD.id),
        'action', TG_OP,
        'timestamp', NOW()
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for profile access auditing
DROP TRIGGER IF EXISTS audit_profile_access_trigger ON public.profiles;
CREATE TRIGGER audit_profile_access_trigger
  AFTER SELECT OR INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_profile_access();