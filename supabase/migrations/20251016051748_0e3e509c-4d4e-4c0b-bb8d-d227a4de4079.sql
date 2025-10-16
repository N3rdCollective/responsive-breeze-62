-- HIGH PRIORITY FIX 3: Add Length Validation for All Message Types
-- This prevents database bloat, DoS attacks, and performance issues

-- Fix 3.1: Chat Messages Length Validation
ALTER TABLE public.chat_messages
ADD CONSTRAINT chat_content_length_check
CHECK (length(content) > 0 AND length(content) <= 5000);

-- Update chat messages INSERT policy with validation
DROP POLICY IF EXISTS "Authenticated users can send messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can send valid chat messages" ON public.chat_messages;

CREATE POLICY "Users can send valid chat messages" ON public.chat_messages
FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid() AND
  length(trim(content)) >= 1 AND
  length(content) <= 5000
);

-- Fix 3.2: Direct Messages Length Validation
ALTER TABLE public.messages
ADD CONSTRAINT message_content_length_check
CHECK (length(content) > 0 AND length(content) <= 5000);

ALTER TABLE public.messages
ADD CONSTRAINT message_media_url_length_check
CHECK (media_url IS NULL OR length(media_url) <= 500);

-- Update direct messages INSERT policy with validation
DROP POLICY IF EXISTS "Authenticated users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send valid direct messages" ON public.messages;

CREATE POLICY "Users can send valid direct messages" ON public.messages
FOR INSERT TO authenticated
WITH CHECK (
  sender_id = auth.uid() AND
  length(trim(content)) >= 1 AND
  length(content) <= 5000 AND
  (media_url IS NULL OR length(media_url) <= 500)
);

-- Fix 3.3: Forum Posts Length Validation
ALTER TABLE public.forum_posts
ADD CONSTRAINT post_content_length_check
CHECK (length(content) > 0 AND length(content) <= 50000);

-- Also limit forum post edit history
ALTER TABLE public.forum_post_edit_history
ADD CONSTRAINT edit_history_content_length_check
CHECK (length(old_content) > 0 AND length(old_content) <= 50000);

-- Fix 3.4: Forum Topic Title Length Validation
ALTER TABLE public.forum_topics
ADD CONSTRAINT topic_title_length_check
CHECK (length(title) >= 3 AND length(title) <= 200);

COMMENT ON CONSTRAINT chat_content_length_check ON public.chat_messages IS 'Prevents DoS attacks via extremely large messages. Max 5,000 characters.';
COMMENT ON CONSTRAINT message_content_length_check ON public.messages IS 'Prevents DoS attacks via extremely large direct messages. Max 5,000 characters.';
COMMENT ON CONSTRAINT post_content_length_check ON public.forum_posts IS 'Prevents performance issues from extremely large posts. Max 50,000 characters (allows long-form content).';
COMMENT ON CONSTRAINT topic_title_length_check ON public.forum_topics IS 'Ensures topic titles are readable and prevent UI issues. Min 3, max 200 characters.';