
-- Add RLS policy to allow staff members to update any user profile
CREATE POLICY "Staff can update all profiles" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 
    FROM public.staff 
    WHERE staff.id = auth.uid()
  )
);
