
-- Phase 1: Database Security Foundation

-- First, let's create a centralized staff permissions system
CREATE TABLE IF NOT EXISTS public.staff_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  permission_name TEXT NOT NULL UNIQUE,
  description TEXT,
  resource_type TEXT NOT NULL, -- 'user', 'content', 'forum', 'system', etc.
  action_type TEXT NOT NULL, -- 'create', 'read', 'update', 'delete', 'moderate', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create role permissions mapping table
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  permission_id UUID NOT NULL REFERENCES public.staff_permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role, permission_id)
);

-- Insert core staff permissions
INSERT INTO public.staff_permissions (permission_name, description, resource_type, action_type) VALUES
-- User management permissions
('user.view', 'View user profiles and data', 'user', 'read'),
('user.suspend', 'Suspend user accounts', 'user', 'moderate'),
('user.ban', 'Ban user accounts', 'user', 'moderate'),
('user.unban', 'Restore banned user accounts', 'user', 'moderate'),
('user.message', 'Send administrative messages to users', 'user', 'create'),
('user.edit_profile', 'Edit user profile information', 'user', 'update'),

-- Content management permissions
('content.view', 'View all content', 'content', 'read'),
('content.moderate', 'Moderate reported content', 'content', 'moderate'),
('content.delete', 'Delete content', 'content', 'delete'),
('content.edit', 'Edit content', 'content', 'update'),

-- Forum management permissions
('forum.moderate', 'Moderate forum posts and topics', 'forum', 'moderate'),
('forum.manage_categories', 'Manage forum categories', 'forum', 'update'),
('forum.pin_topics', 'Pin and unpin forum topics', 'forum', 'update'),
('forum.lock_topics', 'Lock and unlock forum topics', 'forum', 'update'),

-- System management permissions
('system.view_logs', 'View system activity logs', 'system', 'read'),
('system.manage_staff', 'Manage staff members', 'system', 'update'),
('system.manage_settings', 'Manage system settings', 'system', 'update'),
('system.view_analytics', 'View system analytics', 'system', 'read')

ON CONFLICT (permission_name) DO NOTHING;

-- Assign permissions to roles
INSERT INTO public.role_permissions (role, permission_id) 
SELECT 'moderator', id FROM public.staff_permissions 
WHERE permission_name IN (
  'user.view', 'user.suspend', 'user.message',
  'content.view', 'content.moderate', 'content.delete',
  'forum.moderate', 'forum.pin_topics', 'forum.lock_topics'
)
ON CONFLICT (role, permission_id) DO NOTHING;

INSERT INTO public.role_permissions (role, permission_id) 
SELECT 'admin', id FROM public.staff_permissions 
WHERE permission_name IN (
  'user.view', 'user.suspend', 'user.ban', 'user.unban', 'user.message', 'user.edit_profile',
  'content.view', 'content.moderate', 'content.delete', 'content.edit',
  'forum.moderate', 'forum.manage_categories', 'forum.pin_topics', 'forum.lock_topics',
  'system.view_logs', 'system.view_analytics'
)
ON CONFLICT (role, permission_id) DO NOTHING;

INSERT INTO public.role_permissions (role, permission_id) 
SELECT 'super_admin', id FROM public.staff_permissions
ON CONFLICT (role, permission_id) DO NOTHING;

-- Create enhanced staff permission checking function
CREATE OR REPLACE FUNCTION public.staff_has_permission(user_id UUID, permission_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get the staff member's role
  SELECT role INTO user_role 
  FROM public.staff 
  WHERE id = user_id;
  
  IF user_role IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if the role has the specific permission
  RETURN EXISTS (
    SELECT 1 
    FROM public.role_permissions rp
    JOIN public.staff_permissions sp ON rp.permission_id = sp.id
    WHERE rp.role = user_role 
    AND sp.permission_name = permission_name
  );
END;
$$;

-- Create server-side staff action validation function
CREATE OR REPLACE FUNCTION public.validate_staff_action(
  staff_id UUID, 
  action_type TEXT, 
  resource_type TEXT DEFAULT NULL,
  target_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  permission_name TEXT;
  is_valid BOOLEAN := FALSE;
BEGIN
  -- Construct permission name from action and resource type
  IF resource_type IS NOT NULL THEN
    permission_name := resource_type || '.' || action_type;
  ELSE
    permission_name := action_type;
  END IF;
  
  -- Check if staff has the required permission
  SELECT public.staff_has_permission(staff_id, permission_name) INTO is_valid;
  
  -- Log the validation attempt
  INSERT INTO public.staff_activity_logs (
    staff_id, 
    action_type, 
    description,
    entity_type,
    entity_id,
    details
  ) VALUES (
    staff_id,
    'permission_check',
    'Permission validation for: ' || permission_name,
    resource_type,
    target_id,
    jsonb_build_object(
      'permission', permission_name,
      'granted', is_valid,
      'timestamp', NOW()
    )
  );
  
  RETURN is_valid;
END;
$$;

-- Add RLS policies for critical tables that were missing them

-- Enable RLS on posts table
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Staff can view all posts
CREATE POLICY "Staff can view all posts" ON public.posts
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid() 
    AND public.staff_has_permission(auth.uid(), 'content.view')
  )
);

-- Staff can update posts if they have edit permission
CREATE POLICY "Staff can edit posts" ON public.posts
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid() 
    AND public.staff_has_permission(auth.uid(), 'content.edit')
  )
);

-- Staff can delete posts if they have delete permission
CREATE POLICY "Staff can delete posts" ON public.posts
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid() 
    AND public.staff_has_permission(auth.uid(), 'content.delete')
  )
);

-- Add RLS to forum topics
ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can moderate forum topics" ON public.forum_topics
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid() 
    AND public.staff_has_permission(auth.uid(), 'forum.moderate')
  )
);

-- Add RLS to forum posts
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can moderate forum posts" ON public.forum_posts
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid() 
    AND public.staff_has_permission(auth.uid(), 'forum.moderate')
  )
);

-- Enhanced RLS for staff table to prevent unauthorized access
CREATE POLICY "Staff can view other staff with permission" ON public.staff
FOR SELECT TO authenticated
USING (
  id = auth.uid() OR -- Staff can always view their own record
  EXISTS (
    SELECT 1 FROM public.staff s
    WHERE s.id = auth.uid() 
    AND public.staff_has_permission(auth.uid(), 'system.manage_staff')
  )
);

-- Only super admins can modify staff records
CREATE POLICY "Super admins can manage staff" ON public.staff
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  )
);

-- Enhanced RLS for user actions table
CREATE POLICY "Staff can view user actions with permission" ON public.user_actions
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid() 
    AND public.staff_has_permission(auth.uid(), 'user.view')
  )
);

-- Enhanced RLS for staff activity logs
CREATE POLICY "Staff can view activity logs with permission" ON public.staff_activity_logs
FOR SELECT TO authenticated
USING (
  staff_id = auth.uid() OR -- Staff can view their own logs
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid() 
    AND public.staff_has_permission(auth.uid(), 'system.view_logs')
  )
);

-- Create immutable audit trigger for sensitive operations
CREATE OR REPLACE FUNCTION public.audit_sensitive_operation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log all sensitive operations to an immutable audit trail
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
    'Sensitive operation on ' || TG_TABLE_NAME,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object(
      'table', TG_TABLE_NAME,
      'operation', TG_OP,
      'old_values', CASE WHEN TG_OP != 'INSERT' THEN row_to_json(OLD) ELSE NULL END,
      'new_values', CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END,
      'timestamp', NOW()
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add audit triggers to sensitive tables
CREATE TRIGGER audit_staff_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.staff
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_operation();

CREATE TRIGGER audit_user_action_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.user_actions
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_operation();

CREATE TRIGGER audit_content_report_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.content_reports
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_operation();

-- Add RLS to new permission tables
ALTER TABLE public.staff_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Only super admins can manage permissions
CREATE POLICY "Super admins can manage permissions" ON public.staff_permissions
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  )
);

CREATE POLICY "Super admins can manage role permissions" ON public.role_permissions
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  )
);

-- Staff can view permissions to understand their access level
CREATE POLICY "Staff can view their permissions" ON public.staff_permissions
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.staff s
    JOIN public.role_permissions rp ON s.role = rp.role
    WHERE s.id = auth.uid() 
    AND rp.permission_id = public.staff_permissions.id
  )
);

CREATE POLICY "Staff can view role permissions" ON public.role_permissions
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid()
  )
);
