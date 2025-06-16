
-- Step 1: Revert News Posts to allow public access
DROP POLICY IF EXISTS "Authenticated users can view published posts" ON posts;

-- Add back public access for news posts
CREATE POLICY "Public can view published posts" ON posts
  FOR SELECT TO public, authenticated
  USING (status = 'published');

-- Step 2: Revert Featured Videos to allow public access  
DROP POLICY IF EXISTS "Authenticated users can view active featured videos" ON featured_videos;

-- Add back public access for featured videos
CREATE POLICY "Public can view active featured videos" ON featured_videos
  FOR SELECT TO public, authenticated
  USING (is_active = true);

-- Note: Forum content policies remain unchanged - they will stay restricted to authenticated users only
-- This maintains the community aspect while allowing news/videos to be public
