
-- PHASE 1: COMPLETE RLS AND AUTH CLEANUP (Fixed version)
-- This will fix all the infinite recursion errors and simplify the auth system

-- Step 1: Drop ALL existing RLS policies on ALL tables to start clean
-- Posts table
DROP POLICY IF EXISTS "Public can view published posts" ON posts;
DROP POLICY IF EXISTS "Authenticated users can view published posts" ON posts;
DROP POLICY IF EXISTS "Anyone can view published posts" ON posts;
DROP POLICY IF EXISTS "Users can view published posts" ON posts;
DROP POLICY IF EXISTS "Enable read access for all users" ON posts;
DROP POLICY IF EXISTS "Allow public read access to published posts" ON posts;
DROP POLICY IF EXISTS "Allow authenticated users to view published posts" ON posts;
DROP POLICY IF EXISTS "Public and authenticated can view published posts" ON posts;
DROP POLICY IF EXISTS "Allow all users to view published posts" ON posts;
DROP POLICY IF EXISTS "Public can read published posts" ON posts;

-- Featured videos table
DROP POLICY IF EXISTS "Public can view active featured videos" ON featured_videos;
DROP POLICY IF EXISTS "Authenticated users can view active featured videos" ON featured_videos;
DROP POLICY IF EXISTS "Anyone can view active featured videos" ON featured_videos;
DROP POLICY IF EXISTS "Users can view active featured videos" ON featured_videos;
DROP POLICY IF EXISTS "Enable read access for all users" ON featured_videos;
DROP POLICY IF EXISTS "Public and authenticated can view active featured videos" ON featured_videos;
DROP POLICY IF EXISTS "Allow all users to view active featured videos" ON featured_videos;
DROP POLICY IF EXISTS "Public can read active videos" ON featured_videos;

-- Staff table (source of infinite recursion)
DROP POLICY IF EXISTS "Allow staff to view own record" ON staff;
DROP POLICY IF EXISTS "Admins can view all staff via function" ON staff;
DROP POLICY IF EXISTS "Super admins can modify staff via function" ON staff;
DROP POLICY IF EXISTS "Staff can view own record" ON staff;
DROP POLICY IF EXISTS "Admins can view all staff" ON staff;
DROP POLICY IF EXISTS "Super admins can modify staff" ON staff;

-- Profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Staff can view all profiles for moderation" ON profiles;
DROP POLICY IF EXISTS "Only admin/super_admin can update user status" ON profiles;
DROP POLICY IF EXISTS "Super admins can update user status" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Personalities table
DROP POLICY IF EXISTS "Public can read personalities" ON personalities;

-- Forum tables
DROP POLICY IF EXISTS "Authenticated users can view categories" ON forum_categories;
DROP POLICY IF EXISTS "Authenticated users can view topics" ON forum_topics;
DROP POLICY IF EXISTS "Authenticated users can create topics" ON forum_topics;
DROP POLICY IF EXISTS "Authenticated users can view posts" ON forum_posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON forum_posts;
DROP POLICY IF EXISTS "Users can edit their own posts" ON forum_posts;
DROP POLICY IF EXISTS "Users can view their own notifications" ON forum_notifications;
DROP POLICY IF EXISTS "Authenticated can read categories" ON forum_categories;
DROP POLICY IF EXISTS "Authenticated can read topics" ON forum_topics;
DROP POLICY IF EXISTS "Authenticated can create topics" ON forum_topics;
DROP POLICY IF EXISTS "Authenticated can read posts" ON forum_posts;
DROP POLICY IF EXISTS "Authenticated can create posts" ON forum_posts;
DROP POLICY IF EXISTS "Users can edit own posts" ON forum_posts;
DROP POLICY IF EXISTS "Users can view own notifications" ON forum_notifications;

-- Messages and conversations
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view their own messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view own messages" ON messages;

-- Staff activity logs
DROP POLICY IF EXISTS "Staff can view activity logs" ON staff_activity_logs;

-- Step 2: Remove problematic recursive functions that cause infinite loops
DROP FUNCTION IF EXISTS public.is_staff_admin(uuid);
DROP FUNCTION IF EXISTS public.get_current_user_role();

-- Step 3: Create new simple, non-recursive helper functions
CREATE OR REPLACE FUNCTION public.get_user_role_simple(user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = user_id LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_user_staff_simple(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (SELECT 1 FROM public.staff WHERE id = user_id);
$$;

-- Step 4: Create new simplified RLS policies

-- PUBLIC CONTENT (No authentication required)
-- Posts - completely public for published content
CREATE POLICY "Public can read published posts" ON posts
  FOR SELECT TO public
  USING (status = 'published');

-- Featured videos - completely public for active videos
CREATE POLICY "Public can read active videos" ON featured_videos
  FOR SELECT TO public
  USING (is_active = true);

-- Personalities - completely public
CREATE POLICY "Public can read personalities" ON personalities
  FOR SELECT TO public
  USING (true);

-- USER CONTENT (Simple user ownership checks)
-- Profiles - users can view their own, staff can view all
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_user_staff_simple(auth.uid()));

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Messages - users can only see their own
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT TO authenticated
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid());

-- Conversations - users can only see their own
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT TO authenticated
  USING (participant1_id = auth.uid() OR participant2_id = auth.uid());

-- STAFF CONTENT (Simple staff-only access)
-- Staff table - staff can view their own record, no complex hierarchy
CREATE POLICY "Staff can view own record" ON staff
  FOR SELECT TO authenticated
  USING (id = auth.uid());

-- Staff activity logs - only viewable by staff
CREATE POLICY "Staff can view activity logs" ON staff_activity_logs
  FOR SELECT TO authenticated
  USING (public.is_user_staff_simple(auth.uid()));

-- FORUM CONTENT (Simple authenticated access)
-- Forum categories - authenticated users can read
CREATE POLICY "Authenticated can read categories" ON forum_categories
  FOR SELECT TO authenticated
  USING (true);

-- Forum topics - authenticated users can read and create
CREATE POLICY "Authenticated can read topics" ON forum_topics
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated can create topics" ON forum_topics
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Forum posts - authenticated users can read and create
CREATE POLICY "Authenticated can read posts" ON forum_posts
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated can create posts" ON forum_posts
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can edit own posts" ON forum_posts
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Forum notifications - users can see their own
CREATE POLICY "Users can view own notifications" ON forum_notifications
  FOR SELECT TO authenticated
  USING (recipient_id = auth.uid());

-- Ensure RLS is enabled on all tables
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE personalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_notifications ENABLE ROW LEVEL SECURITY;
