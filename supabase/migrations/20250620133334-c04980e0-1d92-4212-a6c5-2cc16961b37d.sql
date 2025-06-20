
-- Fix the get_analytics_summary function to avoid nested aggregates
DROP FUNCTION IF EXISTS get_analytics_summary(timestamp with time zone, timestamp with time zone);

CREATE OR REPLACE FUNCTION get_analytics_summary(
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

-- Enable realtime for analytics table
ALTER TABLE public.analytics REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.analytics;

-- Add RLS policies for analytics
CREATE POLICY "Users can insert their own analytics" ON public.analytics
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Staff can view all analytics" ON public.analytics
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff 
      WHERE staff.id = auth.uid() 
      AND staff.role IN ('admin', 'super_admin', 'moderator')
    )
  );
