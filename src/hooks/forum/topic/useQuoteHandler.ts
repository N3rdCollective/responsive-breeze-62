
import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ForumPost, ForumTopic } from '@/types/forum';
import type { User } from '@supabase/supabase-js';

interface UseQuoteHandlerProps {
  user: User | null;
  topic: ForumTopic | null;
  setReplyContent: React.Dispatch<React.SetStateAction<string>>;
  replyFormRef: React.RefObject<HTMLDivElement>;
}

export const useQuoteHandler = ({
  user,
  topic,
  setReplyContent,
  replyFormRef,
}: UseQuoteHandlerProps) => {
  const { toast } = useToast();

  const handleQuotePost = async (postToQuote: ForumPost) => {
    if (!user || !topic) return;

    const authorName = postToQuote.profile?.display_name || postToQuote.profile?.username || 'A user';
    const quotedAuthorDisplayName = postToQuote.profile?.display_name || postToQuote.profile?.username || 'User';
    const currentUserDisplayName = user.user_metadata?.display_name || user.user_metadata?.username || 'Someone';

    setReplyContent(prevContent => 
      `${prevContent}<blockquote><p><strong>${authorName} wrote:</strong></p>${postToQuote.content}</blockquote><p>&nbsp;</p>`
    );
    replyFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    if (postToQuote.user_id !== user.id) {
      const notificationData = {
        recipient_id: postToQuote.user_id,
        actor_id: user.id,
        type: 'generic' as const,
        topic_id: topic.id,
        post_id: postToQuote.id,
        content_summary: `${currentUserDisplayName} quoted your post in "${topic.title}"`,
        details: { 
          true_type: "quote_post",
          quoted_post_id: postToQuote.id,
          topic_slug: topic.slug,
          topic_id: topic.id,
          topic_title: topic.title,
          actor_display_name: currentUserDisplayName,
          actor_username: user.user_metadata?.username,
          actor_id: user.id,
          quoted_author_id: postToQuote.user_id,
          quoted_author_display_name: quotedAuthorDisplayName,
        },
        link_url: `/members/forum/topic/${topic.slug}/${postToQuote.id}` 
      };

      const { error } = await supabase.from('forum_notifications').insert(notificationData);

      if (error) {
        console.error("Error creating quote notification:", error);
        toast({
          title: "Error",
          description: "Could not send quote notification.",
          variant: "destructive",
        });
      }
    }
  };

  return { handleQuotePost };
};
