-- Fix infinite recursion in staff table RLS policies
-- Drop the conflicting permissive policy that's causing infinite recursion
DROP POLICY IF EXISTS "ABSOLUTE_DENY_PUBLIC_STAFF_ACCESS" ON public.staff;

-- Drop the existing policy to recreate it properly
DROP POLICY IF EXISTS "Public can view basic staff info for published posts" ON public.staff;

-- Create a single, clear restrictive policy for staff table
-- This allows reading only basic staff info when the staff member is an author of published posts
CREATE POLICY "Allow basic staff info for post authors only"
ON public.staff
FOR SELECT
USING (
  -- Only allow reading staff info if this staff member is an author of at least one published post
  EXISTS (
    SELECT 1 
    FROM public.posts 
    WHERE posts.author = staff.id 
    AND posts.status = 'published'
  )
);