-- Fix posts table RLS policies to use security definer functions to avoid recursion

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Staff can view all posts" ON public.posts;
DROP POLICY IF EXISTS "Staff can update posts" ON public.posts;
DROP POLICY IF EXISTS "Staff can delete posts" ON public.posts;

-- Create new policies using security definer functions
CREATE POLICY "Staff can view all posts using security definer" 
ON public.posts 
FOR SELECT 
USING (
  (status = 'published') OR 
  (author = auth.uid()) OR 
  public.is_user_staff_member_secure(auth.uid())
);

CREATE POLICY "Staff can update posts using security definer" 
ON public.posts 
FOR UPDATE 
USING (
  (author = auth.uid()) OR 
  public.is_user_staff_member_secure(auth.uid())
)
WITH CHECK (
  (author = auth.uid()) OR 
  public.is_user_staff_member_secure(auth.uid())
);

CREATE POLICY "Staff can delete posts using security definer" 
ON public.posts 
FOR DELETE 
USING (
  (author = auth.uid()) OR 
  public.is_user_staff_member_secure(auth.uid())
);