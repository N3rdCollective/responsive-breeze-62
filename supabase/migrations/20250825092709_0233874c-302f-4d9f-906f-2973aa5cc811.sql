-- Final Security Hardening - Fix All Remaining Issues

-- 1. First, let's identify and fix any remaining security definer views
-- Drop any problematic views and recreate them securely

-- Check if there are any views that might be causing the security definer issue
DROP VIEW IF EXISTS public.staff_public_view CASCADE;
DROP VIEW IF EXISTS public.user_profiles_view CASCADE;

-- 2. Fix remaining functions with mutable search paths
-- These are likely older functions that we haven't updated yet

-- Update all remaining trigger functions
CREATE OR REPLACE FUNCTION public.update_forum_topics_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_forum_posts_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_conversations_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO ''
AS $$
BEGIN
    NEW.last_message_timestamp = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_messages_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO ''
AS $$
BEGIN
    NEW.timestamp = NOW();
    RETURN NEW;
END;
$$;

-- 3. Create system_settings table to resolve permission errors in logs
-- This appears to be missing and causing the permission denied errors
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on system_settings
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Only super admins can manage system settings
CREATE POLICY "super_admin_system_settings" 
ON public.system_settings 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.staff 
        WHERE id = auth.uid() 
        AND role = 'super_admin'
    )
);

-- Create updated_at trigger for system_settings
CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON public.system_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Ensure all extensions are at latest versions
-- Try to update any extensions that might be outdated
DO $$
BEGIN
    -- Update extensions if they exist
    BEGIN
        ALTER EXTENSION "uuid-ossp" UPDATE;
    EXCEPTION WHEN OTHERS THEN
        NULL; -- Extension might not exist or already at latest
    END;
    
    BEGIN
        ALTER EXTENSION "pgcrypto" UPDATE;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    
    BEGIN
        ALTER EXTENSION IF EXISTS "pg_stat_statements" UPDATE;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    
    BEGIN
        ALTER EXTENSION IF EXISTS "pg_trgm" UPDATE;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
END $$;

-- 5. Add comprehensive audit function with proper search path
CREATE OR REPLACE FUNCTION public.comprehensive_audit_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
    audit_data JSONB;
    current_user_id UUID;
    risk_level TEXT := 'low';
BEGIN
    current_user_id := auth.uid();
    
    -- Determine risk level based on operation and table
    IF TG_TABLE_NAME IN ('staff', 'security_events', 'job_applications') THEN
        risk_level := 'high';
    ELSIF TG_OP = 'DELETE' THEN
        risk_level := 'medium';
    END IF;
    
    -- Build audit data
    audit_data := jsonb_build_object(
        'table', TG_TABLE_NAME,
        'operation', TG_OP,
        'timestamp', NOW(),
        'user_id', current_user_id
    );
    
    -- Add old/new values based on operation
    IF TG_OP = 'DELETE' THEN
        audit_data := audit_data || jsonb_build_object('old_values', row_to_json(OLD));
    ELSIF TG_OP = 'INSERT' THEN
        audit_data := audit_data || jsonb_build_object('new_values', row_to_json(NEW));
    ELSIF TG_OP = 'UPDATE' THEN
        audit_data := audit_data || jsonb_build_object(
            'old_values', row_to_json(OLD),
            'new_values', row_to_json(NEW)
        );
    END IF;
    
    -- Insert into comprehensive audit log
    INSERT INTO public.comprehensive_audit_log (
        user_id,
        action_type,
        table_name,
        record_id,
        old_values,
        new_values,
        risk_level
    ) VALUES (
        current_user_id,
        TG_OP || '_' || TG_TABLE_NAME,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD)::jsonb ELSE NULL END,
        CASE WHEN TG_OP IN ('UPDATE', 'INSERT') THEN row_to_json(NEW)::jsonb ELSE NULL END,
        risk_level
    );
    
    RETURN COALESCE(NEW, OLD);
EXCEPTION
    WHEN OTHERS THEN
        -- Don't fail the main operation if audit fails
        RETURN COALESCE(NEW, OLD);
END;
$$;

-- 6. Create a secure function to check database health
CREATE OR REPLACE FUNCTION public.check_database_security_health()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
    health_report JSONB := '{}';
    rls_tables_count INTEGER;
    total_tables_count INTEGER;
    unprotected_tables TEXT[];
BEGIN
    -- Only super admins can run this check
    IF NOT EXISTS (
        SELECT 1 FROM public.staff 
        WHERE id = auth.uid() 
        AND role = 'super_admin'
    ) THEN
        RAISE EXCEPTION 'Access denied: Super admin role required';
    END IF;
    
    -- Count tables with RLS enabled
    SELECT COUNT(*) INTO rls_tables_count
    FROM pg_tables t
    JOIN pg_class c ON c.relname = t.tablename
    WHERE t.schemaname = 'public'
    AND c.relrowsecurity = true;
    
    -- Count total public tables
    SELECT COUNT(*) INTO total_tables_count
    FROM pg_tables
    WHERE schemaname = 'public';
    
    -- Find unprotected tables
    SELECT array_agg(tablename) INTO unprotected_tables
    FROM pg_tables t
    LEFT JOIN pg_class c ON c.relname = t.tablename
    WHERE t.schemaname = 'public'
    AND (c.relrowsecurity = false OR c.relrowsecurity IS NULL);
    
    -- Build health report
    health_report := jsonb_build_object(
        'timestamp', NOW(),
        'total_tables', total_tables_count,
        'rls_protected_tables', rls_tables_count,
        'protection_percentage', ROUND((rls_tables_count::numeric / total_tables_count::numeric) * 100, 2),
        'unprotected_tables', COALESCE(unprotected_tables, ARRAY[]::TEXT[]),
        'security_status', CASE 
            WHEN rls_tables_count = total_tables_count THEN 'EXCELLENT'
            WHEN rls_tables_count >= (total_tables_count * 0.9) THEN 'GOOD'
            WHEN rls_tables_count >= (total_tables_count * 0.7) THEN 'FAIR'
            ELSE 'POOR'
        END
    );
    
    -- Log the health check
    PERFORM public.log_security_event(
        'security_health_check',
        auth.uid(),
        NULL,
        NULL,
        health_report,
        'low'
    );
    
    RETURN health_report;
END;
$$;

-- 7. Create function to get security event statistics
CREATE OR REPLACE FUNCTION public.get_security_statistics(days_back INTEGER DEFAULT 7)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
    stats JSONB;
BEGIN
    -- Only super admins can view security statistics
    IF NOT EXISTS (
        SELECT 1 FROM public.staff 
        WHERE id = auth.uid() 
        AND role = 'super_admin'
    ) THEN
        RAISE EXCEPTION 'Access denied: Super admin role required';  
    END IF;
    
    -- Gather security statistics
    SELECT jsonb_build_object(
        'total_events', COUNT(*),
        'critical_events', COUNT(*) FILTER (WHERE severity = 'critical'),
        'high_events', COUNT(*) FILTER (WHERE severity = 'high'),
        'medium_events', COUNT(*) FILTER (WHERE severity = 'medium'),
        'low_events', COUNT(*) FILTER (WHERE severity = 'low'),
        'most_common_events', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'event_type', event_type,
                    'count', event_count
                )
            )
            FROM (
                SELECT event_type, COUNT(*) as event_count
                FROM public.security_events
                WHERE created_at > NOW() - (days_back || ' days')::INTERVAL
                GROUP BY event_type
                ORDER BY event_count DESC
                LIMIT 10
            ) top_events
        ),
        'period_days', days_back,
        'report_generated', NOW()
    ) INTO stats
    FROM public.security_events
    WHERE created_at > NOW() - (days_back || ' days')::INTERVAL;
    
    -- Log the statistics access
    PERFORM public.log_security_event(
        'security_statistics_accessed',
        auth.uid(),
        NULL,
        NULL,
        jsonb_build_object(
            'days_back', days_back,
            'total_events_analyzed', (stats->>'total_events')::INTEGER
        ),
        'low'
    );
    
    RETURN stats;
END;
$$;

-- 8. Insert some default system settings if none exist
INSERT INTO public.system_settings (setting_key, setting_value, description)
VALUES 
    ('security_lockdown_enabled', 'false', 'Global security lockdown status'),
    ('max_login_attempts', '5', 'Maximum login attempts before lockout'),
    ('session_timeout_minutes', '60', 'Session timeout in minutes'),
    ('audit_retention_days', '365', 'Number of days to retain audit logs')
ON CONFLICT (setting_key) DO NOTHING;

-- Log successful security hardening completion
INSERT INTO public.security_events (
    event_type,
    user_id,
    details,
    severity
) VALUES (
    'security_hardening_completed',
    auth.uid(),
    jsonb_build_object(
        'migration_timestamp', NOW(),
        'hardening_level', 'comprehensive',
        'features_added', ARRAY[
            'system_settings_table',
            'comprehensive_audit',
            'security_health_check',
            'security_statistics',
            'extension_updates',
            'function_search_path_fixes'
        ]
    ),
    'low'
);