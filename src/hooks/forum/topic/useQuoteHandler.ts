
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
    console.log('[useQuoteHandler] handleQuotePost called with postToQuote:', postToQuote);
    console.log('[useQuoteHandler] Current user:', user);
    console.log('[useQuoteHandler] Current topic:', topic);

    if (!user || !topic) {
      console.error('[useQuoteHandler] User or topic is null. User:', user, 'Topic:', topic);
      return;
    }

    const authorName = postToQuote.profile?.display_name || postToQuote.profile?.username || 'A user';
    const quotedAuthorDisplayName = postToQuote.profile?.display_name || postToQuote.profile?.username || 'User';
    const currentUserDisplayName = user.user_metadata?.display_name || user.user_metadata?.username || 'Someone';

    setReplyContent(prevContent => 
      `${prevContent}<blockquote><p><strong>${authorName} wrote:</strong></p>${postToQuote.content}</blockquote><p>&nbsp;</p>`
    );
    replyFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    if (postToQuote.user_id === user.id) {
      console.log('[useQuoteHandler] Quoted post author is the current user. No notification will be sent.');
      return;
    }
    
    console.log('[useQuoteHandler] Attempting to create notification. Quoted post user ID:', postToQuote.user_id, 'Current user ID:', user.id);

    const notificationData = {
      recipient_id: postToQuote.user_id,
      actor_id: user.id,
      type: 'quote' as const,
      topic_id: topic.id,
      post_id: postToQuote.id, 
      details: { 
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
    };

    console.log('[useQuoteHandler] Notification data to be inserted:', JSON.stringify(notificationData, null, 2));

    const { error } = await supabase.from('forum_notifications').insert(notificationData);

    if (error) {
      console.error("[useQuoteHandler] Error creating quote notification:", error.message, 'Details:', error);
      toast({
        title: "Error",
        description: "Could not send quote notification.",
        variant: "destructive",
      });
    } else {
      console.log('[useQuoteHandler] Quote notification created successfully.');
    }
  };

  return { handleQuotePost };
};

