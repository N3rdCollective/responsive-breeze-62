
-- First, let's ensure the profiles table has a status column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned'));

-- Add missing columns that the user management system expects
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS timeline_post_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS pending_report_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT;

-- Create user_actions table for audit trail
CREATE TABLE IF NOT EXISTS public.user_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('suspend', 'ban', 'unban', 'warn', 'note')),
  reason TEXT NOT NULL,
  moderator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on user_actions
ALTER TABLE public.user_actions ENABLE ROW LEVEL SECURITY;

-- Create policies for user_actions table
CREATE POLICY "Staff can view user actions" ON public.user_actions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'moderator')
  )
);

CREATE POLICY "Staff can create user actions" ON public.user_actions
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'moderator')
  )
);

-- Create policy to allow staff to update user status
CREATE POLICY "Staff can update user status" ON public.profiles
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);
