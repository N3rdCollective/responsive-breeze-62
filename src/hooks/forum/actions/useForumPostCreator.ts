
import { useState } from "react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CreatePostInput, ForumPost } from "@/types/forum";
import { createForumNotification } from "../utils/forumNotificationUtils";
import { extractMentionedUserIds } from "@/utils/mentionUtils"; // Import the new utility

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
        toast({ title: "Post Created!", description: "Your post has been successfully created.", variant: "success" });

        // Handle mention notifications
        const mentionedUserIds = extractMentionedUserIds(input.content);
        if (mentionedUserIds.length > 0) {
          const { data: topicData, error: topicError } = await supabase
            .from('forum_topics')
            .select('title')
            .eq('id', input.topic_id)
            .single();

          const topicTitle = topicError || !topicData ? 'a topic' : topicData.title;
          const contentPreview = `${user.user_metadata?.display_name || user.email || 'Someone'} mentioned you in a reply on "${topicTitle}"`;

          for (const mentionedUserId of mentionedUserIds) {
            if (mentionedUserId !== user.id) { // Don't notify self
              await createForumNotification(
                mentionedUserId,
                user.id,
                'mention_reply', // Or 'mention_post' if this creator is also for first posts
                input.topic_id,
                postData.id,
                contentPreview
              );
            }
          }
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
