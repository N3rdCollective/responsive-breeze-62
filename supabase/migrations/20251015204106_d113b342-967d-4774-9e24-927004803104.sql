-- Fix analytics RLS policies to allow inserts and proper staff viewing

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Super admins view all analytics" ON public.analytics;
DROP POLICY IF EXISTS "Users view own analytics only" ON public.analytics;
DROP POLICY IF EXISTS "Staff can view all analytics" ON public.analytics;
DROP POLICY IF EXISTS "Users can insert their own analytics" ON public.analytics;

-- Allow anyone (authenticated + anonymous) to INSERT analytics for tracking
CREATE POLICY "Anyone can insert analytics" ON public.analytics
  FOR INSERT 
  TO anon, authenticated
  WITH CHECK (true);

-- Only staff can SELECT analytics data
CREATE POLICY "Staff can view all analytics" ON public.analytics
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff 
      WHERE staff.id = auth.uid() 
      AND staff.role IN ('admin', 'super_admin', 'moderator')
    )
  );

-- Fix get_analytics_summary function to properly bypass RLS
CREATE OR REPLACE FUNCTION public.get_analytics_summary(
  start_date timestamp with time zone,
  end_date timestamp with time zone
)
RETURNS TABLE (
  total_visits bigint,
  unique_visitors bigint,
  page_path text,
  visit_count bigint,
  device_breakdown jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  summary_visits bigint;
  summary_unique bigint;
  devices_breakdown jsonb;
BEGIN
  -- Disable RLS for this function execution
  SET LOCAL row_security = off;
  
  -- Get summary stats first
  SELECT 
    COUNT(*),
    COUNT(DISTINCT COALESCE(a.user_id::text, a.session_id))
  INTO summary_visits, summary_unique
  FROM public.analytics a
  WHERE a.created_at >= start_date 
    AND a.created_at <= end_date;

  -- Get device breakdown separately
  SELECT 
    jsonb_object_agg(
      device_type,
      device_count
    )
  INTO devices_breakdown
  FROM (
    SELECT 
      COALESCE(a.device_info->>'type', 'unknown') as device_type,
      COUNT(*) as device_count
    FROM public.analytics a
    WHERE a.created_at >= start_date 
      AND a.created_at <= end_date
    GROUP BY COALESCE(a.device_info->>'type', 'unknown')
  ) device_stats;

  -- Return page stats with summary data
  RETURN QUERY
  SELECT 
    summary_visits as total_visits,
    summary_unique as unique_visitors,
    a.page_path,
    COUNT(*) as visit_count,
    COALESCE(devices_breakdown, '{}'::jsonb) as device_breakdown
  FROM public.analytics a
  WHERE a.created_at >= start_date 
    AND a.created_at <= end_date
  GROUP BY a.page_path
  ORDER BY COUNT(*) DESC;
END;
$$;