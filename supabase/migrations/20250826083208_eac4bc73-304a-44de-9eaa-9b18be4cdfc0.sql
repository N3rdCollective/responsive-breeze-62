-- Fix infinite recursion in posts table RLS policy
-- Drop the existing policy that's causing recursion
DROP POLICY IF EXISTS "Anyone can view published posts" ON public.posts;

-- Create a security definer function to check post status without recursion
CREATE OR REPLACE FUNCTION public.is_post_published(post_status text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT post_status = 'published';
$$;

-- Create a simple RLS policy using the security definer function
CREATE POLICY "Published posts viewable by all"
ON public.posts
FOR SELECT
USING (public.is_post_published(status));