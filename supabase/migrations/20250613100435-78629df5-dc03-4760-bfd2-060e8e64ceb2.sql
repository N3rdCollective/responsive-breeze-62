
-- Drop the existing function first
DROP FUNCTION IF EXISTS get_analytics_summary(timestamp with time zone, timestamp with time zone);

-- Drop the existing analytics table if it exists
DROP TABLE IF EXISTS analytics;

-- Create the analytics table with correct structure
CREATE TABLE analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path text NOT NULL,
  referrer text,
  user_id uuid REFERENCES auth.users(id),
  session_id text,
  device_info jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on analytics table
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for analytics (allow authenticated users to insert their own data)
CREATE POLICY "Users can insert their own analytics" ON analytics
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Create RLS policy for staff to view all analytics
CREATE POLICY "Staff can view all analytics" ON analytics
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff 
      WHERE staff.id = auth.uid() 
      AND staff.role IN ('admin', 'super_admin', 'moderator')
    )
  );

-- Create the analytics summary RPC function
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
AS $$
BEGIN
  RETURN QUERY
  WITH page_stats AS (
    SELECT 
      a.page_path,
      COUNT(*) as visit_count
    FROM analytics a
    WHERE a.created_at >= start_date 
      AND a.created_at <= end_date
    GROUP BY a.page_path
  ),
  device_stats AS (
    SELECT 
      jsonb_object_agg(
        COALESCE(a.device_info->>'type', 'unknown'),
        COUNT(*)
      ) as device_breakdown
    FROM analytics a
    WHERE a.created_at >= start_date 
      AND a.created_at <= end_date
  ),
  summary_stats AS (
    SELECT 
      COUNT(*) as total_visits,
      COUNT(DISTINCT COALESCE(a.user_id::text, a.session_id)) as unique_visitors
    FROM analytics a
    WHERE a.created_at >= start_date 
      AND a.created_at <= end_date
  )
  SELECT 
    s.total_visits,
    s.unique_visitors,
    p.page_path,
    p.visit_count,
    d.device_breakdown
  FROM summary_stats s
  CROSS JOIN device_stats d
  CROSS JOIN page_stats p
  ORDER BY p.visit_count DESC;
END;
$$;

-- Create index for better performance
CREATE INDEX idx_analytics_created_at ON analytics(created_at);
CREATE INDEX idx_analytics_page_path ON analytics(page_path);
CREATE INDEX idx_analytics_user_session ON analytics(user_id, session_id);
