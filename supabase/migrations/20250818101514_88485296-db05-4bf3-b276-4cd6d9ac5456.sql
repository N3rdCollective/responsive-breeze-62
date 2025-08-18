-- Force RLS enforcement and remove any remaining public access

-- 1. Ensure RLS is strictly enforced
ALTER TABLE public.messages FORCE ROW LEVEL SECURITY;
ALTER TABLE public.user_messages FORCE ROW LEVEL SECURITY;

-- 2. Drop any remaining policies that might allow public access
DO $$
DECLARE
    pol_record RECORD;
BEGIN
    -- Find and drop any policies that allow public role access to message tables
    FOR pol_record IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('messages', 'user_messages')
        AND 'public' = ANY(roles)
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol_record.policyname, pol_record.schemaname, pol_record.tablename);
        RAISE NOTICE 'Dropped public policy: % on %.%', pol_record.policyname, pol_record.schemaname, pol_record.tablename;
    END LOOP;
END $$;

-- 3. Verify no public access by explicitly denying it
CREATE POLICY "Deny all public access to messages" 
ON public.messages 
TO public
FOR ALL 
USING (false)
WITH CHECK (false);

CREATE POLICY "Deny all public access to user_messages" 
ON public.user_messages 
TO public
FOR ALL 
USING (false)
WITH CHECK (false);