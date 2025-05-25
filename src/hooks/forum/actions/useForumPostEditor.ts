import { useState } from "react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ForumPost } from "@/types/forum";
import { createForumNotification } from "../utils/forumNotificationUtils";
import { extractMentionedUserIds } from "@/utils/mentionUtils";

export const useForumPostEditor = () => {
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const editPost = async (postId: string, newContent: string): Promise<ForumPost | null> => {
    setEditing(true);
    let originalContent = "";
    let originalTopicId = "";
    let originalAuthorId = ""; // To store the author of the post being edited

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Authentication Error", description: "You must be logged in to edit a post.", variant: "destructive" });
        return null;
      }

      // Fetch original content and author ID to compare for mentions and save history
      const { data: originalPostData, error: fetchError } = await supabase
        .from('forum_posts')
        .select('content, topic_id, user_id') // Added user_id here
        .eq('id', postId)
        .single();

      if (fetchError || !originalPostData) {
        throw fetchError || new Error("Original post not found.");
      }
      originalContent = originalPostData.content;
      originalTopicId = originalPostData.topic_id;
      originalAuthorId = originalPostData.user_id; // Store the original author's ID

      if (originalPostData.user_id !== user.id) {
          // Add role check here if moderators/admins should be able to edit
          toast({ title: "Permission Denied", description: "You can only edit your own posts.", variant: "destructive" });
          return null;
      }

      // Save edit history BEFORE updating the post
      const { error: historyError } = await supabase
        .from('forum_post_edit_history')
        .insert({
          post_id: postId,
          user_id: user.id, // The user performing the edit
          old_content: originalContent,
          edited_at: new Date().toISOString(),
        });

      if (historyError) {
        console.error("Error saving post edit history:", historyError);
        // Decide if this should be a critical failure or just a warning
        toast({ title: "Warning", description: "Could not save edit history, but post update will proceed.", variant: "default" });
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
        // Ensure the profile within updatedPostData refers to the original post author, not the editor.
        // This might require re-fetching the profile if the select statement above doesn't already do this correctly.
        // For now, we assume the `profile` on `updatedPostData` is correct for the original post author.
        return { ...updatedPostData, profile: originalPostData.user_id === user.id ? updatedPostData.profile : (await supabase.from('profiles').select('*').eq('id', originalAuthorId).single()).data } as ForumPost;
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
      
      // Delete related edit history entries first
      const { error: historyDeleteError } = await supabase
        .from('forum_post_edit_history')
        .delete()
        .eq('post_id', postId);

      if (historyDeleteError) {
        console.error("Error deleting post edit history:", historyDeleteError);
        // Log and potentially inform user, but might proceed with post deletion
      }
      
      const { error: reactionDeleteError } = await supabase
        .from('forum_post_reactions')
        .delete()
        .eq('post_id', postId);

      if (reactionDeleteError) {
        console.error("Error deleting post reactions:", reactionDeleteError);
        toast({ title: "Error deleting post", description: "Could not clean up post reactions.", variant: "destructive" });
      }
      
       const { error: notificationDeleteError } = await supabase
        .from('forum_notifications')
        .delete()
        .eq('post_id', postId);

      if (notificationDeleteError) {
        console.error("Error deleting post notifications:", notificationDeleteError);
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
