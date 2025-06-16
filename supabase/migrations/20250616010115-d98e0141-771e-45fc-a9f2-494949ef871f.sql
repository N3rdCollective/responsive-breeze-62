
-- Complete cleanup of ALL RLS policies on posts table
DROP POLICY IF EXISTS "Public can view published posts" ON posts;
DROP POLICY IF EXISTS "Authenticated users can view published posts" ON posts;
DROP POLICY IF EXISTS "Anyone can view published posts" ON posts;
DROP POLICY IF EXISTS "Users can view published posts" ON posts;
DROP POLICY IF EXISTS "Enable read access for all users" ON posts;
DROP POLICY IF EXISTS "Allow public read access to published posts" ON posts;
DROP POLICY IF EXISTS "Allow authenticated users to view published posts" ON posts;
DROP POLICY IF EXISTS "Public and authenticated can view published posts" ON posts;

-- Complete cleanup of ALL RLS policies on featured_videos table
DROP POLICY IF EXISTS "Public can view active featured videos" ON featured_videos;
DROP POLICY IF EXISTS "Authenticated users can view active featured videos" ON featured_videos;
DROP POLICY IF EXISTS "Anyone can view active featured videos" ON featured_videos;
DROP POLICY IF EXISTS "Users can view active featured videos" ON featured_videos;
DROP POLICY IF EXISTS "Enable read access for all users" ON featured_videos;
DROP POLICY IF EXISTS "Public and authenticated can view active featured videos" ON featured_videos;

-- Create single, simple policies that work for BOTH public and authenticated users
CREATE POLICY "Allow all users to view published posts" ON posts
  FOR SELECT 
  TO public, authenticated
  USING (status = 'published');

CREATE POLICY "Allow all users to view active featured videos" ON featured_videos
  FOR SELECT 
  TO public, authenticated
  USING (is_active = true);

-- Ensure RLS is enabled
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_videos ENABLE ROW LEVEL SECURITY;
