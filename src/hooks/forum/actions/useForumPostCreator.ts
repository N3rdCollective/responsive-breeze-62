
import { useState } from "react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CreatePostInput, ForumPost } from "@/types/forum";
import { createForumNotification } from "../utils/forumNotificationUtils";
import { extractMentionedUserIds } from "@/utils/mentionUtils";

export const useForumPostCreator = () => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const createPost = async (input: CreatePostInput): Promise<ForumPost | null> => {
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Authentication Error", description: "You must be logged in to create a post.", variant: "destructive" });
        return null;
      }

      const { data: postData, error } = await supabase
        .from('forum_posts')
        .insert({
          topic_id: input.topic_id,
          user_id: user.id,
          content: input.content,
        })
        .select(`
          *,
          profile:profiles!forum_posts_user_id_fkey(username, display_name, profile_picture),
          forum_post_reactions (id, user_id, reaction_type)
        `)
        .single();

      if (error) throw error;

      if (postData) {
        toast({ title: "Post Created!", description: "Your post has been successfully created.", variant: "default" });

        // Fetch topic details for mention and reply notifications
        const { data: topicData, error: topicError } = await supabase
          .from('forum_topics')
          .select('title, user_id, slug, category:forum_categories(slug)') // Fetch user_id of topic creator, slug, and category slug
          .eq('id', input.topic_id)
          .single();

        const topicTitle = topicError || !topicData ? 'a topic' : topicData.title;
        const topicAuthorId = topicData?.user_id;
        const topicSlug = topicData?.slug;
        const categorySlug = (topicData?.category as any)?.slug; // Type assertion for category slug

        const actorDisplayName = user.user_metadata?.display_name || user.user_metadata?.username || 'Someone';
        const actorUsername = user.user_metadata?.username;

        const baseDetails = {
          topic_id: input.topic_id,
          topic_title: topicTitle,
          topic_slug: topicSlug,
          category_slug: categorySlug,
          actor_id: user.id,
          actor_display_name: actorDisplayName,
          actor_username: actorUsername,
        };

        // Handle mention notifications
        const mentionedUserIds = extractMentionedUserIds(input.content);
        if (mentionedUserIds.length > 0) {
          const mentionContentPreview = `${actorDisplayName} mentioned you in a reply on "${topicTitle}"`;
          for (const mentionedUserId of mentionedUserIds) {
            await createForumNotification(
              mentionedUserId,
              user.id,
              'mention_reply', 
              input.topic_id,
              postData.id,
              mentionContentPreview,
              { ...baseDetails, true_type: 'mention_reply' } // Pass details
            );
          }
        }

        // Handle reply notification to topic author
        if (topicAuthorId && topicAuthorId !== user.id) {
          console.log(`[useForumPostCreator] Attempting to send 'reply' notification to topic author ${topicAuthorId}`);
          const replyContentPreview = `${actorDisplayName} replied to your topic "${topicTitle}"`;
          await createForumNotification(
            topicAuthorId,
            user.id,
            'reply', 
            input.topic_id,
            postData.id,
            replyContentPreview,
            { ...baseDetails, true_type: 'reply' } // Pass details
          );
        } else if (topicAuthorId && topicAuthorId === user.id) {
          console.log('[useForumPostCreator] User is replying to their own topic, no "reply" notification needed for topic author.');
        } else if (!topicAuthorId) {
          console.warn('[useForumPostCreator] Could not fetch topic author ID, cannot send reply notification.');
        }

        return postData as ForumPost;
      }
      return null;
    } catch (error: any) {
      console.error("Error creating post:", error);
      toast({ title: "Error creating post", description: error.message || "An unexpected error occurred.", variant: "destructive" });
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  return { createPost, submitting };
};
