
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { CreatePostInput, ForumPost } from '@/types/forum';
import { createForumNotification } from '@/hooks/forum/utils/forumNotificationUtils';

export const useForumPostCreator = () => {
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const createPost = async (input: CreatePostInput): Promise<ForumPost | null> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to reply to a topic.",
        variant: "destructive"
      });
      return null;
    }
    
    let createdPostData: ForumPost | null = null;

    try {
      setSubmitting(true);
      
      const { data, error } = await supabase
        .from('forum_posts')
        .insert({
          topic_id: input.topic_id,
          user_id: user.id,
          content: input.content
        })
        .select(`
          *,
          profile:profiles!forum_posts_user_id_fkey(username, display_name, profile_picture),
          forum_post_reactions (id, user_id, reaction_type)
        `)
        .single();
        
      if (error) throw error;
      if (!data) throw new Error("Failed to create post, no data returned.");
      createdPostData = data as ForumPost;
      
      toast({
        title: "Reply posted",
        description: "Your reply has been posted successfully!"
      });

      if (createdPostData && user) {
        const { data: topicData, error: topicFetchError } = await supabase
          .from('forum_topics')
          .select('user_id, title')
          .eq('id', createdPostData.topic_id)
          .single();

        if (topicFetchError) {
          console.error("Error fetching topic creator for notification:", topicFetchError);
        } else if (topicData && topicData.user_id !== user.id) {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = createdPostData.content;
          const textContent = tempDiv.textContent || tempDiv.innerText || "";
          const contentPreview = textContent.substring(0, 100) + (textContent.length > 100 ? "..." : "");

          await createForumNotification(
            topicData.user_id,
            user.id,
            'reply',
            createdPostData.topic_id,
            createdPostData.id,
            contentPreview
          );
        }
      }
      
      return createdPostData;
    } catch (err: any) {
      console.error('Error posting reply:', err.message);
      toast({
        title: "Error posting reply",
        description: err.message || "Failed to post your reply. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  return { createPost, submitting };
};
