-- Fix critical staff table security vulnerability
-- Remove the dangerous policy that allows unrestricted access
DROP POLICY IF EXISTS "Simple staff access policy" ON public.staff;

-- Create secure RLS policies for staff table
-- 1. Staff can view their own record (basic info only)
CREATE POLICY "staff_view_own_record" ON public.staff
FOR SELECT 
USING (id = auth.uid());

-- 2. Staff can update their own basic info (not role or permissions)
CREATE POLICY "staff_update_own_basic_info" ON public.staff
FOR UPDATE 
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid() AND
  -- Prevent self-modification of critical fields
  role = (SELECT role FROM public.staff WHERE id = auth.uid()) AND
  hr_permissions = (SELECT hr_permissions FROM public.staff WHERE id = auth.uid())
);

-- 3. Super Admins can manage all staff records
CREATE POLICY "super_admin_manage_all_staff" ON public.staff
FOR ALL
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

-- 4. Admins can manage staff (except super admins and other admins)
CREATE POLICY "admin_manage_staff_limited" ON public.staff
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.staff s1
    WHERE s1.id = auth.uid() 
    AND s1.role = 'admin'
  ) AND
  -- Admins cannot modify super admins or other admins
  role NOT IN ('super_admin', 'admin')
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.staff s1
    WHERE s1.id = auth.uid() 
    AND s1.role = 'admin'
  ) AND
  -- Prevent privilege escalation
  role NOT IN ('super_admin', 'admin')
);

-- 5. HR personnel can view staff data (read-only for HR purposes)
CREATE POLICY "hr_view_staff_data" ON public.staff
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid() 
    AND (hr_permissions = true OR role IN ('admin', 'super_admin'))
  )
);

-- Create audit trigger for staff table modifications
CREATE OR REPLACE FUNCTION public.audit_staff_table_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log all staff table modifications
  INSERT INTO public.staff_activity_logs (
    staff_id,
    action_type,
    description,
    entity_type,
    entity_id,
    details
  ) VALUES (
    auth.uid(),
    TG_OP,
    CASE 
      WHEN TG_OP = 'INSERT' THEN 'Created staff record: ' || NEW.email
      WHEN TG_OP = 'UPDATE' THEN 'Updated staff record: ' || COALESCE(OLD.email, NEW.email)
      WHEN TG_OP = 'DELETE' THEN 'Deleted staff record: ' || OLD.email
    END,
    'staff',
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object(
      'operation', TG_OP,
      'old_values', CASE WHEN TG_OP != 'INSERT' THEN row_to_json(OLD) ELSE NULL END,
      'new_values', CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END,
      'timestamp', NOW()
    )
  );
  
  -- Alert on role changes
  IF TG_OP = 'UPDATE' AND OLD.role != NEW.role THEN
    PERFORM public.log_security_event(
      'staff_role_changed',
      auth.uid(),
      NULL,
      NULL,
      jsonb_build_object(
        'target_staff_id', NEW.id,
        'old_role', OLD.role,
        'new_role', NEW.role,
        'target_email', NEW.email
      ),
      'high'
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach audit trigger to staff table
DROP TRIGGER IF EXISTS audit_staff_changes ON public.staff;
CREATE TRIGGER audit_staff_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.staff
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_staff_table_changes();