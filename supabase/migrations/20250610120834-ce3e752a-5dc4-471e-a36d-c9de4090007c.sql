
-- Comprehensive RLS Security Implementation (Safe Version)
-- This addresses the remaining security issues with conflict handling

-- Phase 1: Enable RLS on critical content tables (only if not already enabled)
DO $$
BEGIN
    -- Enable RLS only if not already enabled
    IF NOT (SELECT schemaname IS NOT NULL FROM pg_tables WHERE schemaname = 'public' AND tablename = 'posts' AND rowsecurity = true) THEN
        ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT (SELECT schemaname IS NOT NULL FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles' AND rowsecurity = true) THEN
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT (SELECT schemaname IS NOT NULL FROM pg_tables WHERE schemaname = 'public' AND tablename = 'forum_topics' AND rowsecurity = true) THEN
        ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT (SELECT schemaname IS NOT NULL FROM pg_tables WHERE schemaname = 'public' AND tablename = 'forum_posts' AND rowsecurity = true) THEN
        ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT (SELECT schemaname IS NOT NULL FROM pg_tables WHERE schemaname = 'public' AND tablename = 'staff_activity_logs' AND rowsecurity = true) THEN
        ALTER TABLE public.staff_activity_logs ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT (SELECT schemaname IS NOT NULL FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_actions' AND rowsecurity = true) THEN
        ALTER TABLE public.user_actions ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT (SELECT schemaname IS NOT NULL FROM pg_tables WHERE schemaname = 'public' AND tablename = 'content_reports' AND rowsecurity = true) THEN
        ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT (SELECT schemaname IS NOT NULL FROM pg_tables WHERE schemaname = 'public' AND tablename = 'moderation_actions' AND rowsecurity = true) THEN
        ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Phase 2: Drop existing policies if they exist, then recreate
-- Posts policies
DROP POLICY IF EXISTS "Public can view published posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated can view posts" ON public.posts;
DROP POLICY IF EXISTS "Staff can manage posts" ON public.posts;

-- Create posts policies
CREATE POLICY "Public can view published posts" ON public.posts
FOR SELECT TO public
USING (status = 'published');

CREATE POLICY "Authenticated can view posts" ON public.posts
FOR SELECT TO authenticated
USING (
  status = 'published' OR 
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid())
);

CREATE POLICY "Staff can manage posts" ON public.posts
FOR ALL TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid())
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid())
);

-- Phase 3: Profiles policies
DROP POLICY IF EXISTS "Public can view public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Staff can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can update user status" ON public.profiles;

CREATE POLICY "Public can view public profiles" ON public.profiles
FOR SELECT TO public
USING (is_public = true);

CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Staff can view all profiles" ON public.profiles
FOR SELECT TO authenticated
USING (
  id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid())
);

CREATE POLICY "Super admins can update user status" ON public.profiles
FOR UPDATE TO authenticated
USING (
  public.check_staff_admin_role(auth.uid()) AND
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid() AND role = 'super_admin')
)
WITH CHECK (
  public.check_staff_admin_role(auth.uid()) AND
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid() AND role = 'super_admin')
);

-- Phase 4: Forum topics policies
DROP POLICY IF EXISTS "Public can view forum topics" ON public.forum_topics;
DROP POLICY IF EXISTS "Authenticated can create topics" ON public.forum_topics;
DROP POLICY IF EXISTS "Users can update own topics" ON public.forum_topics;
DROP POLICY IF EXISTS "Staff can manage all topics" ON public.forum_topics;

CREATE POLICY "Public can view forum topics" ON public.forum_topics
FOR SELECT TO public
USING (true);

CREATE POLICY "Authenticated can create topics" ON public.forum_topics
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own topics" ON public.forum_topics
FOR UPDATE TO authenticated
USING (user_id = auth.uid() AND is_locked = false)
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Staff can manage all topics" ON public.forum_topics
FOR ALL TO authenticated
USING (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid())
)
WITH CHECK (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid())
);

-- Phase 5: Forum posts policies
DROP POLICY IF EXISTS "Public can view forum posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Authenticated can create posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Staff can manage all posts" ON public.forum_posts;

CREATE POLICY "Public can view forum posts" ON public.forum_posts
FOR SELECT TO public
USING (true);

CREATE POLICY "Authenticated can create posts" ON public.forum_posts
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own posts" ON public.forum_posts
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Staff can manage all posts" ON public.forum_posts
FOR ALL TO authenticated
USING (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid())
)
WITH CHECK (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid())
);

-- Phase 6: Staff activity logs policies
DROP POLICY IF EXISTS "Staff can view activity logs" ON public.staff_activity_logs;
DROP POLICY IF EXISTS "System can insert activity logs" ON public.staff_activity_logs;

CREATE POLICY "Staff can view activity logs" ON public.staff_activity_logs
FOR SELECT TO authenticated
USING (
  public.check_staff_admin_role(auth.uid())
);

CREATE POLICY "System can insert activity logs" ON public.staff_activity_logs
FOR INSERT TO authenticated
WITH CHECK (true);

-- Phase 7: User actions policies
DROP POLICY IF EXISTS "Staff can view user actions" ON public.user_actions;
DROP POLICY IF EXISTS "Staff can create user actions" ON public.user_actions;

CREATE POLICY "Staff can view user actions" ON public.user_actions
FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid())
);

CREATE POLICY "Staff can create user actions" ON public.user_actions
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid()) AND
  moderator_id = auth.uid()
);

-- Phase 8: Content reports policies
DROP POLICY IF EXISTS "Staff can view content reports" ON public.content_reports;
DROP POLICY IF EXISTS "Users can create content reports" ON public.content_reports;
DROP POLICY IF EXISTS "Staff can update content reports" ON public.content_reports;

CREATE POLICY "Staff can view content reports" ON public.content_reports
FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid())
);

CREATE POLICY "Users can create content reports" ON public.content_reports
FOR INSERT TO authenticated
WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "Staff can update content reports" ON public.content_reports
FOR UPDATE TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid())
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid())
);

-- Phase 9: Moderation actions policies
DROP POLICY IF EXISTS "Staff can view moderation actions" ON public.moderation_actions;
DROP POLICY IF EXISTS "Staff can create moderation actions" ON public.moderation_actions;

CREATE POLICY "Staff can view moderation actions" ON public.moderation_actions
FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid())
);

CREATE POLICY "Staff can create moderation actions" ON public.moderation_actions
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid()) AND
  moderator_id = auth.uid()
);

-- Phase 10: Performance indexes (safe creation)
CREATE INDEX IF NOT EXISTS idx_posts_author ON public.posts(author);
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at);

CREATE INDEX IF NOT EXISTS idx_forum_topics_category_id ON public.forum_topics(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_topics_user_id ON public.forum_topics(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_topics_last_post_at ON public.forum_topics(last_post_at);

CREATE INDEX IF NOT EXISTS idx_forum_posts_topic_id ON public.forum_posts(topic_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_user_id ON public.forum_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created_at ON public.forum_posts(created_at);

CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

CREATE INDEX IF NOT EXISTS idx_staff_activity_logs_staff_id ON public.staff_activity_logs(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_activity_logs_created_at ON public.staff_activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_staff_activity_logs_action_type ON public.staff_activity_logs(action_type);

CREATE INDEX IF NOT EXISTS idx_user_actions_user_id ON public.user_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_actions_moderator_id ON public.user_actions(moderator_id);

CREATE INDEX IF NOT EXISTS idx_content_reports_status ON public.content_reports(status);
CREATE INDEX IF NOT EXISTS idx_content_reports_reporter_id ON public.content_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_content_reports_reported_user_id ON public.content_reports(reported_user_id);
