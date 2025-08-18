-- CRITICAL: Fix Private Message Security (Simplified Policies)

-- 1. Drop ALL public access policies from user_messages table
DROP POLICY IF EXISTS "Staff can send messages to users" ON public.user_messages;
DROP POLICY IF EXISTS "Staff can view messages they sent" ON public.user_messages; 
DROP POLICY IF EXISTS "Users can view their own messages" ON public.user_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.user_messages;

-- 2. Create secure authenticated-only policies for user_messages
CREATE POLICY "Authenticated users can view their own messages" 
ON public.user_messages 
FOR SELECT 
TO authenticated
USING (
  (auth.uid() = recipient_id) OR (auth.uid() = sender_id)
);

CREATE POLICY "Staff can send admin messages to users" 
ON public.user_messages 
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (SELECT 1 FROM public.staff WHERE id = auth.uid())
);

CREATE POLICY "Recipients can mark messages as read" 
ON public.user_messages 
FOR UPDATE 
TO authenticated
USING (auth.uid() = recipient_id)
WITH CHECK (auth.uid() = recipient_id);

-- 3. Clean up duplicate policies on messages table
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can view own messages" ON public.messages;

-- 4. Add staff moderation policies (separate from user access)
CREATE POLICY "Staff moderation access to messages" 
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

CREATE POLICY "Staff moderation access to user messages" 
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