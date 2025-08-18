-- CRITICAL: Fix Private Message Security Vulnerabilities

-- 1. Drop ALL public access policies from user_messages table
DROP POLICY IF EXISTS "Staff can send messages to users" ON public.user_messages;
DROP POLICY IF EXISTS "Staff can view messages they sent" ON public.user_messages; 
DROP POLICY IF EXISTS "Users can view their own messages" ON public.user_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.user_messages;

-- 2. Create secure authenticated-only policies for user_messages
CREATE POLICY "Authenticated users can view their messages" 
ON public.user_messages 
FOR SELECT 
TO authenticated
USING (
  (auth.uid() = recipient_id) OR (auth.uid() = sender_id)
);

CREATE POLICY "Staff can send messages to users" 
ON public.user_messages 
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid())
);

CREATE POLICY "Users can mark messages as read" 
ON public.user_messages 
FOR UPDATE 
TO authenticated
USING (auth.uid() = recipient_id)
WITH CHECK (
  auth.uid() = recipient_id AND 
  -- Only allow updating is_read field
  OLD.sender_id = NEW.sender_id AND
  OLD.recipient_id = NEW.recipient_id AND
  OLD.subject = NEW.subject AND
  OLD.message = NEW.message AND
  OLD.message_type = NEW.message_type
);

-- 3. Clean up duplicate policies on messages table
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can view own messages" ON public.messages;

-- Keep only the most restrictive policies:
-- "Authenticated users can send messages" (INSERT)
-- "Authenticated users can view their messages" (SELECT) 
-- "Authenticated users can update their messages" (UPDATE)

-- 4. Add staff moderation policy for messages (view-only for moderation)
CREATE POLICY "Staff can view messages for moderation" 
ON public.messages 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin', 'moderator')
  )
);

CREATE POLICY "Staff can view user messages for moderation" 
ON public.user_messages 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin', 'moderator')
  )
);

-- 5. Add message audit logging function
CREATE OR REPLACE FUNCTION public.log_message_access()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log when staff access user messages for moderation
  IF auth.uid() != COALESCE(NEW.sender_id, OLD.sender_id) 
     AND auth.uid() != COALESCE(NEW.recipient_id, OLD.recipient_id) THEN
    
    INSERT INTO public.staff_activity_logs (
      staff_id,
      action_type,
      description,
      entity_type,
      entity_id,
      details
    ) VALUES (
      auth.uid(),
      'message_moderation_access',
      'Staff accessed private message for moderation',
      TG_TABLE_NAME,
      COALESCE(NEW.id, OLD.id),
      jsonb_build_object(
        'sender_id', COALESCE(NEW.sender_id, OLD.sender_id),
        'recipient_id', COALESCE(NEW.recipient_id, OLD.recipient_id),
        'timestamp', NOW()
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 6. Create audit triggers for message access
CREATE TRIGGER audit_message_access
  AFTER SELECT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.log_message_access();

CREATE TRIGGER audit_user_message_access  
  AFTER SELECT ON public.user_messages
  FOR EACH ROW EXECUTE FUNCTION public.log_message_access();