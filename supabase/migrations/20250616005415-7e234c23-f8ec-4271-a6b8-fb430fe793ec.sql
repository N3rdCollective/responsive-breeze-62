
-- Clean up Posts table RLS policies
-- First, drop all existing SELECT policies on posts table
DROP POLICY IF EXISTS "Public can view published posts" ON posts;
DROP POLICY IF EXISTS "Authenticated users can view published posts" ON posts;
DROP POLICY IF EXISTS "Anyone can view published posts" ON posts;
DROP POLICY IF EXISTS "Users can view published posts" ON posts;
DROP POLICY IF EXISTS "Enable read access for all users" ON posts;
DROP POLICY IF EXISTS "Allow public read access to published posts" ON posts;
DROP POLICY IF EXISTS "Allow authenticated users to view published posts" ON posts;

-- Create a single, clear policy for posts that allows both public and authenticated access
CREATE POLICY "Public and authenticated can view published posts" ON posts
  FOR SELECT 
  USING (status = 'published');

-- Clean up Featured Videos table RLS policies
-- Drop all existing SELECT policies on featured_videos table
DROP POLICY IF EXISTS "Public can view active featured videos" ON featured_videos;
DROP POLICY IF EXISTS "Authenticated users can view active featured videos" ON featured_videos;
DROP POLICY IF EXISTS "Anyone can view active featured videos" ON featured_videos;
DROP POLICY IF EXISTS "Users can view active featured videos" ON featured_videos;
DROP POLICY IF EXISTS "Enable read access for all users" ON featured_videos;

-- Create a single, clear policy for featured videos that allows both public and authenticated access
CREATE POLICY "Public and authenticated can view active featured videos" ON featured_videos
  FOR SELECT 
  USING (is_active = true);

-- Ensure both tables have RLS enabled
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_videos ENABLE ROW LEVEL SECURITY;
