
-- Phase 1: Enable RLS on all three vulnerable tables
ALTER TABLE public.featured_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.home_settings ENABLE ROW LEVEL SECURITY;

-- Phase 2: Create public read policies for website functionality

-- Featured Artists: Allow public to view non-archived artists
CREATE POLICY "Public can view active featured artists" ON public.featured_artists
FOR SELECT TO public
USING (is_archived = false OR is_archived IS NULL);

-- Featured Videos: Allow public to view active videos  
CREATE POLICY "Public can view active featured videos" ON public.featured_videos
FOR SELECT TO public
USING (is_active = true);

-- Home Settings: Allow public to read home page configuration
CREATE POLICY "Public can view home settings" ON public.home_settings
FOR SELECT TO public
USING (true);

-- Phase 3: Create staff management policies

-- Featured Artists: Staff can manage all artists
CREATE POLICY "Staff can manage featured artists" ON public.featured_artists
FOR ALL TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid())
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid())
);

-- Featured Videos: Staff can manage all videos
CREATE POLICY "Staff can manage featured videos" ON public.featured_videos
FOR ALL TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid())
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid())
);

-- Home Settings: Staff can update home settings
CREATE POLICY "Staff can update home settings" ON public.home_settings
FOR UPDATE TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid())
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid())
);

-- Phase 4: Create admin-only policies for sensitive operations

-- Only super admins can delete featured artists (permanent deletion)
CREATE POLICY "Super admins can delete featured artists" ON public.featured_artists
FOR DELETE TO authenticated
USING (
  public.check_staff_admin_role(auth.uid()) AND
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- Only super admins can delete featured videos (permanent deletion)
CREATE POLICY "Super admins can delete featured videos" ON public.featured_videos
FOR DELETE TO authenticated
USING (
  public.check_staff_admin_role(auth.uid()) AND
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- Only admins can insert home settings (should typically only be one record)
CREATE POLICY "Admins can insert home settings" ON public.home_settings
FOR INSERT TO authenticated
WITH CHECK (
  public.check_staff_admin_role(auth.uid())
);

-- Only super admins can delete home settings  
CREATE POLICY "Super admins can delete home settings" ON public.home_settings
FOR DELETE TO authenticated
USING (
  public.check_staff_admin_role(auth.uid()) AND
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);
