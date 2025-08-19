-- CRITICAL: Secure Staff Table from Unauthorized Access

-- 1. Enable FORCE ROW LEVEL SECURITY for strictest enforcement
ALTER TABLE public.staff FORCE ROW LEVEL SECURITY;

-- 2. Drop existing policies and recreate with stricter controls
DROP POLICY IF EXISTS "staff_can_view_own_record" ON public.staff;
DROP POLICY IF EXISTS "super_admin_can_insert_staff" ON public.staff;
DROP POLICY IF EXISTS "super_admin_can_update_staff" ON public.staff;
DROP POLICY IF EXISTS "super_admin_can_delete_staff" ON public.staff;

-- 3. Create secure SELECT policy - staff can view their own record + super admins can view all
CREATE POLICY "Staff can view own record only" 
ON public.staff 
FOR SELECT 
TO authenticated
USING (
  id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  )
);

-- 4. Create super admin INSERT policy with strict validation
CREATE POLICY "Super admins only can add staff" 
ON public.staff 
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  )
);

-- 5. Create super admin UPDATE policy
CREATE POLICY "Super admins only can update staff" 
ON public.staff 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  )
);

-- 6. Create super admin DELETE policy
CREATE POLICY "Super admins only can delete staff" 
ON public.staff 
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  )
);

-- 7. Explicit denial for all public access
CREATE POLICY "Deny all public access to staff" 
ON public.staff 
FOR ALL 
TO public
USING (false)
WITH CHECK (false);

-- 8. Create audit function for staff data access
CREATE OR REPLACE FUNCTION public.log_staff_data_access()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log when staff data is accessed or modified
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO public.staff_activity_logs (
      staff_id,
      action_type,
      description,
      entity_type,
      entity_id,
      details
    ) VALUES (
      auth.uid(),
      'staff_data_updated',
      'Updated staff record: ' || COALESCE(OLD.email, 'Unknown'),
      'staff',
      OLD.id,
      jsonb_build_object(
        'old_role', OLD.role,
        'new_role', NEW.role,
        'updated_email', OLD.email,
        'timestamp', NOW()
      )
    );
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.staff_activity_logs (
      staff_id,
      action_type,
      description,
      entity_type,
      entity_id,
      details
    ) VALUES (
      auth.uid(),
      'staff_added',
      'Added new staff member: ' || NEW.email,
      'staff',
      NEW.id,
      jsonb_build_object(
        'new_staff_role', NEW.role,
        'new_staff_email', NEW.email,
        'timestamp', NOW()
      )
    );
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.staff_activity_logs (
      staff_id,
      action_type,
      description,
      entity_type,
      entity_id,
      details
    ) VALUES (
      auth.uid(),
      'staff_deleted',
      'Deleted staff member: ' || OLD.email,
      'staff',
      OLD.id,
      jsonb_build_object(
        'deleted_staff_role', OLD.role,
        'deleted_staff_email', OLD.email,
        'timestamp', NOW()
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 9. Create audit trigger for staff data access
DROP TRIGGER IF EXISTS audit_staff_data_access ON public.staff;
CREATE TRIGGER audit_staff_data_access
  AFTER INSERT OR UPDATE OR DELETE ON public.staff
  FOR EACH ROW EXECUTE FUNCTION public.log_staff_data_access();