
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ForumPostReaction } from '@/types/forum';
import { createForumNotification } from '@/hooks/forum/utils/forumNotificationUtils';

export const useForumReactions = () => {
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const addReaction = async (postId: string, reactionType: 'like'): Promise<ForumPostReaction | null> => {
    if (!user) {
      toast({ title: "Authentication required", variant: "destructive" });
      return null;
    }
    let addedReactionData: ForumPostReaction | null = null;
    try {
      setSubmitting(true);
      const { data, error } = await supabase
        .from('forum_post_reactions')
        .insert({ post_id: postId, user_id: user.id, reaction_type: reactionType })
        .select()
        .single();
      
      if (error) {
        if (error.code === '23505') { 
          console.warn("User has already reacted to this post or tried to add duplicate.");
          // Optionally toast, but might be noisy.
          return null;
        }
        throw error;
      }
      if (!data) throw new Error("Failed to add reaction, no data returned.");
      addedReactionData = data as ForumPostReaction;

      if (addedReactionData && user) {
        const { data: postData, error: postFetchError } = await supabase
          .from('forum_posts')
          .select('user_id, topic_id')
          .eq('id', postId)
          .single();

        if (postFetchError) {
          console.error("Error fetching post author for like notification:", postFetchError);
        } else if (postData && postData.user_id !== user.id) {
          await createForumNotification(
            postData.user_id,
            user.id,
            'like',
            postData.topic_id,
            postId
          );
        }
      }
      return addedReactionData;

    } catch (err: any) {
      console.error('Error adding reaction:', err.message);
      toast({ title: "Error adding reaction", description: err.message, variant: "destructive" });
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  const removeReaction = async (postId: string, reactionType: 'like'): Promise<boolean> => {
    if (!user) {
      toast({ title: "Authentication required", variant: "destructive" });
      return false;
    }
    try {
      setSubmitting(true);
      const { error } = await supabase
        .from('forum_post_reactions')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .eq('reaction_type', reactionType); // Be specific if removing specific reaction type
      
      if (error) throw error;
      return true;
    } catch (err: any) {
      console.error('Error removing reaction:', err.message);
      toast({ title: "Error removing reaction", description: err.message, variant: "destructive" });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return { addReaction, removeReaction, submitting };
};
