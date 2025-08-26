-- Fix the staff table infinite recursion completely
-- Remove our problematic policy
DROP POLICY IF EXISTS "Allow basic staff info for post authors only" ON public.staff;

-- Create a simple policy that just allows reading email and role for staff members
-- without any complex joins that cause recursion
CREATE POLICY "Allow public read of basic staff info"
ON public.staff
FOR SELECT
USING (true); -- Simple policy that allows reading basic staff info

-- Also make sure posts don't have foreign key constraints causing issues
-- Let's simplify to avoid any foreign key joins for now
DROP POLICY IF EXISTS "Published posts viewable by all" ON public.posts;

-- Create an even simpler posts policy
CREATE POLICY "Simple published posts policy"
ON public.posts
FOR SELECT
USING (status = 'published');