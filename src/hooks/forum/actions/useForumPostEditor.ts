
import { useState } from "react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ForumPost } from "@/types/forum";
import { createForumNotification } from "../utils/forumNotificationUtils";
import { extractMentionedUserIds } from "@/utils/mentionUtils";

export const useForumPostEditor = () => {
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false); // New state for delete operation

  const editPost = async (postId: string, newContent: string): Promise<ForumPost | null> => {
    setEditing(true);
    let originalContent = "";
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Authentication Error", description: "You must be logged in to edit a post.", variant: "destructive" });
        return null;
      }

      // Fetch original content to compare for mentions
      const { data: originalPostData, error: fetchError } = await supabase
        .from('forum_posts')
        .select('content, topic_id, user_id')
        .eq('id', postId)
        .single();

      if (fetchError || !originalPostData) {
        throw fetchError || new Error("Original post not found.");
      }
      originalContent = originalPostData.content;

      if (originalPostData.user_id !== user.id) {
          // Add role check here if moderators/admins should be able to edit
          toast({ title: "Permission Denied", description: "You can only edit your own posts.", variant: "destructive" });
          return null;
      }


      const { data: updatedPostData, error: updateError } = await supabase
        .from('forum_posts')
        .update({ content: newContent, is_edited: true, updated_at: new Date().toISOString() })
        .eq('id', postId)
        .select(`
          *,
          profile:profiles!forum_posts_user_id_fkey(username, display_name, profile_picture),
          forum_post_reactions (id, user_id, reaction_type)
        `)
        .single();

      if (updateError) throw updateError;

      if (updatedPostData) {
        toast({ title: "Post Updated!", description: "Your post has been successfully updated.", variant: "default" });

        // Handle mention notifications: compare old and new mentions
        const oldMentionedUserIds = extractMentionedUserIds(originalContent);
        const newMentionedUserIds = extractMentionedUserIds(newContent);
        
        const newlyMentionedUserIds = newMentionedUserIds.filter(id => !oldMentionedUserIds.includes(id));

        if (newlyMentionedUserIds.length > 0) {
          const { data: topicData, error: topicError } = await supabase
            .from('forum_topics')
            .select('title')
            .eq('id', updatedPostData.topic_id)
            .single();

          const topicTitle = topicError || !topicData ? 'a topic' : topicData.title;
          // Corrected user display name source
          const actorDisplayName = (await supabase.auth.getUser()).data.user?.user_metadata?.display_name || (await supabase.auth.getUser()).data.user?.email || 'Someone';
          const contentPreview = `${actorDisplayName} mentioned you in an updated reply on "${topicTitle}"`;

          for (const mentionedUserId of newlyMentionedUserIds) {
            if (mentionedUserId !== user.id) { 
              await createForumNotification(
                mentionedUserId,
                user.id,
                'mention_reply', 
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
      setEditing(false);
    }
  };

  const deletePost = async (postId: string): Promise<boolean> => {
    setDeleting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Authentication Error", description: "You must be logged in to delete a post.", variant: "destructive" });
        return false;
      }

      // Optional: Fetch post to check ownership before deleting, similar to editPost
      const { data: postToDeleteData, error: fetchError } = await supabase
        .from('forum_posts')
        .select('user_id, topic_id') // topic_id might be useful for notifications or cleanup
        .eq('id', postId)
        .single();

      if (fetchError || !postToDeleteData) {
        toast({ title: "Error", description: "Post not found or could not verify ownership.", variant: "destructive" });
        throw fetchError || new Error("Post not found for deletion.");
      }

      if (postToDeleteData.user_id !== user.id) {
          // Add role check here if moderators/admins should be able to delete
          toast({ title: "Permission Denied", description: "You can only delete your own posts.", variant: "destructive" });
          return false;
      }
      
      // Before deleting the post, delete related reactions to avoid foreign key constraint issues if they exist.
      // This depends on your DB schema (ON DELETE CASCADE for reactions would simplify this).
      // Assuming no ON DELETE CASCADE or a need for more complex cleanup:
      const { error: reactionDeleteError } = await supabase
        .from('forum_post_reactions')
        .delete()
        .eq('post_id', postId);

      if (reactionDeleteError) {
        console.error("Error deleting post reactions:", reactionDeleteError);
        toast({ title: "Error deleting post", description: "Could not clean up post reactions.", variant: "destructive" });
        // Decide if you want to stop the post deletion here or proceed.
        // For now, we'll proceed but log the error.
      }
      
      // Also delete related notifications
       const { error: notificationDeleteError } = await supabase
        .from('forum_notifications')
        .delete()
        .eq('post_id', postId);

      if (notificationDeleteError) {
        console.error("Error deleting post notifications:", notificationDeleteError);
        // Log and potentially inform user, but might proceed with post deletion
      }


      const { error: deleteError } = await supabase
        .from('forum_posts')
        .delete()
        .eq('id', postId);

      if (deleteError) throw deleteError;

      toast({ title: "Post Deleted!", description: "The post has been successfully deleted.", variant: "default" });
      return true;

    } catch (error: any) {
      console.error("Error deleting post:", error);
      toast({ title: "Error deleting post", description: error.message || "An unexpected error occurred.", variant: "destructive" });
      return false;
    } finally {
      setDeleting(false);
    }
  };

  return { editPost, editing, deletePost, deleting };
};
