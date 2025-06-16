
-- Step 1: Clean up News Posts (posts table) - Remove public access policies
DROP POLICY IF EXISTS "Anyone can view published posts" ON posts;
DROP POLICY IF EXISTS "Public can view published posts" ON posts;

-- Keep only authenticated access for posts
CREATE POLICY "Authenticated users can view published posts" ON posts
  FOR SELECT TO authenticated
  USING (status = 'published');

-- Step 2: Clean up Featured Videos (featured_videos table) - Remove public access
DROP POLICY IF EXISTS "Public can view active featured videos" ON featured_videos;
DROP POLICY IF EXISTS "Anyone can view active featured videos" ON featured_videos;

-- Add authenticated-only access for featured videos
CREATE POLICY "Authenticated users can view active featured videos" ON featured_videos
  FOR SELECT TO authenticated
  USING (is_active = true);

-- Step 3: Clean up Forum Content - Remove all public/anon access policies

-- Forum Categories
DROP POLICY IF EXISTS "Public can view categories" ON forum_categories;
DROP POLICY IF EXISTS "Anyone can view categories" ON forum_categories;
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON forum_categories;

CREATE POLICY "Authenticated users can view forum categories" ON forum_categories
  FOR SELECT TO authenticated
  USING (true);

-- Forum Topics  
DROP POLICY IF EXISTS "Public can view topics" ON forum_topics;
DROP POLICY IF EXISTS "Anyone can view topics" ON forum_topics;
DROP POLICY IF EXISTS "Topics are viewable by everyone" ON forum_topics;

CREATE POLICY "Authenticated users can view forum topics" ON forum_topics
  FOR SELECT TO authenticated
  USING (true);

-- Forum Posts
DROP POLICY IF EXISTS "Public can view posts" ON forum_posts;
DROP POLICY IF EXISTS "Anyone can view posts" ON forum_posts;
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON forum_posts;

CREATE POLICY "Authenticated users can view forum posts" ON forum_posts
  FOR SELECT TO authenticated
  USING (true);

-- Forum Poll Options
DROP POLICY IF EXISTS "Public can view poll options" ON forum_poll_options;
DROP POLICY IF EXISTS "Anyone can view poll options" ON forum_poll_options;

CREATE POLICY "Authenticated users can view poll options" ON forum_poll_options
  FOR SELECT TO authenticated
  USING (true);

-- Forum Polls
DROP POLICY IF EXISTS "Public can view polls" ON forum_polls;
DROP POLICY IF EXISTS "Anyone can view polls" ON forum_polls;

CREATE POLICY "Authenticated users can view polls" ON forum_polls
  FOR SELECT TO authenticated
  USING (true);
