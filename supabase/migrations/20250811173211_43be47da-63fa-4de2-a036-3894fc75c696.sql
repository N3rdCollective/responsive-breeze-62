-- Secure RLS for posts table: restrict drafts, author-only modifications, staff visibility

-- Ensure RLS is enabled
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies on posts to avoid permissive overlaps
DO $$
DECLARE p RECORD;
BEGIN
  FOR p IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'posts'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.posts', p.policyname);
  END LOOP;
END$$;

-- Public can view only published posts
CREATE POLICY "Public can view published posts"
ON public.posts
FOR SELECT
USING (status = 'published');

-- Authors can view their own posts (including drafts)
CREATE POLICY "Authors can view own posts"
ON public.posts
FOR SELECT
USING (author = auth.uid());

-- Staff can view all posts
CREATE POLICY "Staff can view all posts"
ON public.posts
FOR SELECT
USING (EXISTS (SELECT 1 FROM public.staff s WHERE s.id = auth.uid()));

-- Users can create posts for themselves
CREATE POLICY "Users can create their own posts"
ON public.posts
FOR INSERT
WITH CHECK (author = auth.uid());

-- Authors can update their own posts
CREATE POLICY "Authors can update own posts"
ON public.posts
FOR UPDATE
USING (author = auth.uid())
WITH CHECK (author = auth.uid());

-- Staff can update any post
CREATE POLICY "Staff can update posts"
ON public.posts
FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.staff s WHERE s.id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.staff s WHERE s.id = auth.uid()));

-- Authors can delete their own posts
CREATE POLICY "Authors can delete own posts"
ON public.posts
FOR DELETE
USING (author = auth.uid());

-- Staff can delete any post
CREATE POLICY "Staff can delete posts"
ON public.posts
FOR DELETE
USING (EXISTS (SELECT 1 FROM public.staff s WHERE s.id = auth.uid()));
