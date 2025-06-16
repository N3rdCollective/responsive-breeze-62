
-- Create the security_events table that's referenced by the security logging system
CREATE TABLE IF NOT EXISTS public.security_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  ip_address inet,
  user_agent text,
  details jsonb DEFAULT '{}',
  severity text DEFAULT 'medium',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Create policy for staff to view security events
CREATE POLICY "Staff can view security events" 
  ON public.security_events 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.staff 
      WHERE id = auth.uid()
    )
  );

-- Create policy for system to insert security events
CREATE POLICY "System can insert security events" 
  ON public.security_events 
  FOR INSERT 
  WITH CHECK (true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON public.security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON public.security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON public.security_events(created_at);
