
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
    let originalAuthorId = "";

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Authentication Error", description: "You must be logged in to edit a post.", variant: "destructive" });
        return null;
      }

      // Fetch original content and author ID to compare for mentions and save history
      const { data: originalPostData, error: fetchError } = await supabase
        .from('forum_posts')
        .select('content, topic_id, user_id')
        .eq('id', postId)
        .single();

      if (fetchError || !originalPostData) {
        console.error('[useForumPostEditor] Error fetching original post:', fetchError);
        throw fetchError || new Error("Original post not found.");
      }
      originalContent = originalPostData.content;
      originalTopicId = originalPostData.topic_id;
      originalAuthorId = originalPostData.user_id;

      // Check if user has permission to edit (owner or staff)
      const { data: staffData } = await supabase
        .from('staff')
        .select('role')
        .eq('id', user.id)
        .single();

      const isStaff = staffData && ['admin', 'super_admin', 'moderator'].includes(staffData.role);
      const isOwner = originalPostData.user_id === user.id;

      if (!isOwner && !isStaff) {
        toast({ title: "Permission Denied", description: "You can only edit your own posts unless you're a moderator.", variant: "destructive" });
        return null;
      }

      // Save edit history BEFORE updating the post
      const { error: historyError } = await supabase
        .from('forum_post_edit_history')
        .insert({
          post_id: postId,
          user_id: user.id,
          old_content: originalContent,
          edited_at: new Date().toISOString(),
        });

      if (historyError) {
        console.error("Error saving post edit history:", historyError);
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

      if (updateError) {
        console.error('[useForumPostEditor] Error updating post:', updateError);
        throw updateError;
      }

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
        
        return { ...updatedPostData, profile: originalPostData.user_id === user.id ? updatedPostData.profile : (await supabase.from('profiles').select('*').eq('id', originalAuthorId).single()).data } as ForumPost;
      }
      return null;
    } catch (error: any) {
      console.error("Error updating post:", error);
      if (error.code === 'PGRST301') {
        toast({ title: "Permission Denied", description: "You don't have permission to edit this post.", variant: "destructive" });
      } else {
        toast({ title: "Error updating post", description: error.message || "An unexpected error occurred.", variant: "destructive" });
      }
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

      // Fetch post to check ownership before deleting
      const { data: postToDeleteData, error: fetchError } = await supabase
        .from('forum_posts')
        .select('user_id, topic_id')
        .eq('id', postId)
        .single();

      if (fetchError || !postToDeleteData) {
        console.error('[useForumPostEditor] Error fetching post to delete:', fetchError);
        toast({ title: "Error", description: "Post not found or could not verify ownership.", variant: "destructive" });
        return false;
      }

      // Check if user has permission to delete (owner or staff)
      const { data: staffData } = await supabase
        .from('staff')
        .select('role')
        .eq('id', user.id)
        .single();

      const isStaff = staffData && ['admin', 'super_admin', 'moderator'].includes(staffData.role);
      const isOwner = postToDeleteData.user_id === user.id;

      if (!isOwner && !isStaff) {
        toast({ title: "Permission Denied", description: "You can only delete your own posts unless you're a moderator.", variant: "destructive" });
        return false;
      }

      console.log(`[useForumPostEditor] Deleting post ${postId} - User: ${user.id}, IsOwner: ${isOwner}, IsStaff: ${isStaff}`);
      
      // Delete related edit history entries first
      const { error: historyDeleteError } = await supabase
        .from('forum_post_edit_history')
        .delete()
        .eq('post_id', postId);

      if (historyDeleteError) {
        console.error("Error deleting post edit history:", historyDeleteError);
      }
      
      const { error: reactionDeleteError } = await supabase
        .from('forum_post_reactions')
        .delete()
        .eq('post_id', postId);

      if (reactionDeleteError) {
        console.error("Error deleting post reactions:", reactionDeleteError);
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

      if (deleteError) {
        console.error('[useForumPostEditor] Error deleting post:', deleteError);
        if (deleteError.code === 'PGRST301') {
          toast({ title: "Permission Denied", description: "You don't have permission to delete this post.", variant: "destructive" });
        } else {
          toast({ title: "Error deleting post", description: deleteError.message || "An unexpected error occurred.", variant: "destructive" });
        }
        return false;
      }

      console.log(`[useForumPostEditor] Post ${postId} deleted successfully`);
      toast({ title: "Post Deleted!", description: "The post has been successfully deleted.", variant: "default" });
      return true;

    } catch (error: any) {
      console.error("Error deleting post:", error);
      if (error.code === 'PGRST301') {
        toast({ title: "Permission Denied", description: "You don't have permission to delete this post.", variant: "destructive" });
      } else {
        toast({ title: "Error deleting post", description: error.message || "An unexpected error occurred.", variant: "destructive" });
      }
      return false;
    } finally {
      setDeleting(false);
    }
  };

  return { editPost, editing, deletePost, deleting };
};
