
import { useState } from "react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ForumPost } from "@/types/forum";
import { createForumNotification } from "../utils/forumNotificationUtils";
import { extractMentionedUserIds } from "@/utils/mentionUtils"; // Import the new utility

export const useForumPostEditor = () => {
  const { toast } = useToast();
  const [submittingUpdate, setSubmittingUpdate] = useState(false);
  const [submittingDelete, setSubmittingDelete] = useState(false);

  const updatePost = async (postId: string, content: string): Promise<ForumPost | null> => {
    setSubmittingUpdate(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Authentication Error", description: "You must be logged in to edit a post.", variant: "destructive" });
        return null;
      }

      const { data: updatedPostData, error } = await supabase
        .from('forum_posts')
        .update({ content: content, is_edited: true, updated_at: new Date().toISOString() })
        .eq('id', postId)
        .eq('user_id', user.id) // Ensure user can only edit their own posts
        .select(`
          *,
          profile:profiles!forum_posts_user_id_fkey(username, display_name, profile_picture),
          forum_post_reactions (id, user_id, reaction_type)
        `)
        .single();

      if (error) {
        // Check if the error is due to RLS (no rows returned by the .update().select())
        if (error.code === 'PGRST116' && !updatedPostData) { // PGRST116: "Searched for a single row, but found no rows"
             toast({ title: "Update Failed", description: "You may not have permission to edit this post, or the post was not found.", variant: "destructive" });
        } else {
            throw error;
        }
        return null;
      }
      
      if (updatedPostData) {
        toast({ title: "Post Updated!", description: "Your post has been successfully updated.", variant: "success" });

        // Handle mention notifications
        const mentionedUserIds = extractMentionedUserIds(content);
        if (mentionedUserIds.length > 0 && updatedPostData.topic_id) {
          const { data: topicData, error: topicError } = await supabase
            .from('forum_topics')
            .select('title')
            .eq('id', updatedPostData.topic_id)
            .single();
          
          const topicTitle = topicError || !topicData ? 'a topic' : topicData.title;
          const contentPreview = `${user.user_metadata?.display_name || user.email || 'Someone'} mentioned you in an edited post on "${topicTitle}"`;

          for (const mentionedUserId of mentionedUserIds) {
            if (mentionedUserId !== user.id) { // Don't notify self
              await createForumNotification(
                mentionedUserId,
                user.id,
                'mention_post', 
                updatedPostData.topic_id,
                updatedPostData.id,
                contentPreview
              );
            }
          }
        }
        return updatedPostData as ForumPost;
      }
      return null;
    } catch (error: any) {
      console.error("Error updating post:", error);
      toast({ title: "Error updating post", description: error.message || "An unexpected error occurred.", variant: "destructive" });
      return null;
    } finally {
      setSubmittingUpdate(false);
    }
  };

  const deletePost = async (postId: string): Promise<boolean> => {
    setSubmittingDelete(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Authentication Error", description: "You must be logged in to delete a post.", variant: "destructive" });
        return false;
      }
      
      // Optional: Check if it's the first post of a topic. This logic is more complex and
      // might be better handled in useForumPostManagement or via a server-side function/policy.
      // For now, allowing deletion if user is owner.

      const { error } = await supabase
        .from('forum_posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id); // Ensure user can only delete their own posts

      if (error) {
        // Check if RLS prevented deletion (e.g. error.message might indicate 0 rows deleted)
        if (error.message.includes("constraint") || error.code === '23503') { // Foreign key violation
             toast({ title: "Deletion Failed", description: "This post cannot be deleted, it might be referenced elsewhere.", variant: "destructive" });
        } else {
            throw error;
        }
        return false;
      }

      toast({ title: "Post Deleted!", description: "Your post has been successfully deleted.", variant: "success" });
      return true;
    } catch (error: any) {
      console.error("Error deleting post:", error);
      toast({ title: "Error deleting post", description: error.message || "An unexpected error occurred.", variant: "destructive" });
      return false;
    } finally {
      setSubmittingDelete(false);
    }
  };

  return { updatePost, submittingUpdate, deletePost, submittingDelete };
};
