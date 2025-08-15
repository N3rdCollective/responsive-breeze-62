-- Find and fix any remaining security definer views

-- First, identify any views with security_barrier or security definer properties
SELECT 
  schemaname, 
  viewname, 
  definition,
  CASE WHEN viewowner != current_user THEN 'SECURITY DEFINER' ELSE 'NORMAL' END as view_type
FROM pg_views 
WHERE schemaname = 'public';

-- Check for any functions with SECURITY DEFINER that might be problematic
SELECT 
  n.nspname as schema,
  p.proname as function_name,
  CASE WHEN p.prosecdef THEN 'SECURITY DEFINER' ELSE 'SECURITY INVOKER' END as security_type
FROM pg_proc p 
JOIN pg_namespace n ON p.pronamespace = n.oid 
WHERE n.nspname = 'public' 
AND p.prosecdef = true;

-- Drop any remaining problematic views if they exist
DROP VIEW IF EXISTS public.public_profiles CASCADE;

-- Remove security_barrier from any views that might have it
DO $$
DECLARE
    view_rec RECORD;
BEGIN
    FOR view_rec IN 
        SELECT schemaname, viewname 
        FROM pg_views 
        WHERE schemaname = 'public'
    LOOP
        BEGIN
            EXECUTE format('ALTER VIEW %I.%I SET (security_barrier = false)', 
                          view_rec.schemaname, view_rec.viewname);
        EXCEPTION WHEN OTHERS THEN
            -- Ignore errors for views that don't have security_barrier
            NULL;
        END;
    END LOOP;
END $$;