-- Create a limited RLS policy for staff table to allow anonymous users 
-- to read only basic staff information needed for displaying published posts
CREATE POLICY "Public can view basic staff info for published posts"
ON public.staff
FOR SELECT
USING (
  -- Allow reading basic staff info when user is referenced as author in published posts
  EXISTS (
    SELECT 1 
    FROM public.posts 
    WHERE posts.author = staff.id 
    AND posts.status = 'published'
  )
);

-- Update posts RLS policy to ensure it works for anonymous users
-- First drop existing policy if it conflicts
DROP POLICY IF EXISTS "Published posts are viewable by everyone" ON public.posts;

-- Create a comprehensive policy for viewing published posts
CREATE POLICY "Anyone can view published posts"
ON public.posts
FOR SELECT
USING (status = 'published');