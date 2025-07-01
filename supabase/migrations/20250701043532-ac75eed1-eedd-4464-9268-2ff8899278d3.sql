
-- Create chat_rooms table for room configuration
CREATE TABLE public.chat_rooms (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create chat_messages table for public room messages
CREATE TABLE public.chat_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id uuid NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  is_deleted boolean NOT NULL DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_rooms
CREATE POLICY "Anyone can view active chat rooms" 
  ON public.chat_rooms 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Staff can manage chat rooms" 
  ON public.chat_rooms 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin', 'moderator')
  ));

-- RLS Policies for chat_messages
CREATE POLICY "Authenticated users can view messages" 
  ON public.chat_messages 
  FOR SELECT 
  TO authenticated
  USING (is_deleted = false);

CREATE POLICY "Authenticated users can send messages" 
  ON public.chat_messages 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages" 
  ON public.chat_messages 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Staff can delete any message" 
  ON public.chat_messages 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin', 'moderator')
  ));

-- Enable realtime for chat_messages
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.chat_messages;

-- Insert default general chat room
INSERT INTO public.chat_rooms (name, description) 
VALUES ('General Chat', 'Main chat room for all listeners');

-- Create indexes for performance
CREATE INDEX idx_chat_messages_room_created ON public.chat_messages(room_id, created_at DESC);
CREATE INDEX idx_chat_messages_user ON public.chat_messages(user_id);
