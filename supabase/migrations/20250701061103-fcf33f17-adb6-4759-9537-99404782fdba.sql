
-- Drop existing UPDATE policies that are causing the issue
DROP POLICY IF EXISTS "Users can update their own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Staff can delete any message" ON public.chat_messages;

-- Recreate policies with proper WITH CHECK clauses for UPDATE operations
CREATE POLICY "Users can update their own messages" 
  ON public.chat_messages 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can delete any message" 
  ON public.chat_messages 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin', 'moderator')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin', 'moderator')
  ));
