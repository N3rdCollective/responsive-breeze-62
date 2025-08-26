-- Fix staff-related RLS policies on posts table to avoid querying staff table for anonymous users

-- Drop the problematic staff policies that query staff table for all users
DROP POLICY IF EXISTS "Staff can view all posts" ON public.posts;
DROP POLICY IF EXISTS "Staff can update posts" ON public.posts;
DROP POLICY IF EXISTS "Staff can delete posts" ON public.posts;

-- Create new staff policies with null checks to prevent staff table queries for anonymous users
CREATE POLICY "Staff can view all posts" ON public.posts
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid())
);

CREATE POLICY "Staff can update posts" ON public.posts
FOR UPDATE
USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid())
)
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid())
);

CREATE POLICY "Staff can delete posts" ON public.posts
FOR DELETE
USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid())
);