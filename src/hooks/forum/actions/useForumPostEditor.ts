
import { useState } from "react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ForumPost } from "@/types/forum";
import { createForumNotification } from "../utils/forumNotificationUtils";
import { extractMentionedUserIds } from "@/utils/mentionUtils";

export const useForumPostEditor = () => {
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);

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
        toast({ title: "Post Updated!", description: "Your post has been successfully updated.", variant: "default" }); // Changed variant to "default"

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
          const contentPreview = `${user.user_metadata?.display_name || user.email || 'Someone'} mentioned you in an updated reply on "${topicTitle}"`;

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

  return { editPost, editing };
};
