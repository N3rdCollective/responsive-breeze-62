
import { useState } from "react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CreateTopicInput, ForumTopic, ForumPost } from "@/types/forum";
import { generateSlug } from "@/utils/slugUtils"; // Assuming you have or will create this utility
import { createForumNotification } from "../utils/forumNotificationUtils";
import { extractMentionedUserIds } from "@/utils/mentionUtils";

export const useForumTopicCreator = () => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const createTopic = async (input: CreateTopicInput): Promise<{ topic: ForumTopic; firstPost: ForumPost } | null> => {
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Authentication Error", description: "You must be logged in to create a topic.", variant: "destructive" });
        return null;
      }

      const slug = generateSlug(input.title);

      // Create the topic
      const { data: topicData, error: topicError } = await supabase
        .from('forum_topics')
        .insert({
          category_id: input.category_id,
          user_id: user.id,
          title: input.title,
          slug: slug,
          last_post_at: new Date().toISOString(), // Will be updated by trigger on first post
          last_post_user_id: user.id, // Will be updated by trigger on first post
        })
        .select(`
          *, 
          profile:profiles!forum_topics_user_id_fkey(username, display_name, profile_picture), 
          category:forum_categories(name, slug)
        `)
        .single();

      if (topicError) throw topicError;
      if (!topicData) throw new Error("Failed to create topic.");

      // Create the first post
      const { data: postData, error: postError } = await supabase
        .from('forum_posts')
        .insert({
          topic_id: topicData.id,
          user_id: user.id,
          content: input.content,
        })
        .select(`
          *,
          profile:profiles!forum_posts_user_id_fkey(username, display_name, profile_picture),
          forum_post_reactions (id, user_id, reaction_type)
        `)
        .single();
      
      if (postError) {
        // Rollback topic creation if post creation fails? Or handle differently.
        // For now, just error out. A transaction would be better here.
        console.error("Error creating first post, topic was created but post failed:", postError);
        await supabase.from('forum_topics').delete().eq('id', topicData.id); // Attempt to rollback
        throw new Error(`Failed to create the first post for the topic: ${postError.message}`);
      }
      if (!postData) throw new Error("Failed to create the first post for the topic.");

      toast({ title: "Topic Created!", description: "Your new topic has been successfully created.", variant: "success" });

      // Handle mention notifications for the first post
      const mentionedUserIds = extractMentionedUserIds(input.content);
      if (mentionedUserIds.length > 0) {
        const contentPreview = `${user.user_metadata?.display_name || user.email || 'Someone'} mentioned you in the new topic "${topicData.title}"`;
        for (const mentionedUserId of mentionedUserIds) {
          if (mentionedUserId !== user.id) { // Don't notify self
            await createForumNotification(
              mentionedUserId,
              user.id,
              'mention_post', 
              topicData.id,
              postData.id,
              contentPreview
            );
          }
        }
      }

      return { topic: topicData as ForumTopic, firstPost: postData as ForumPost };

    } catch (error: any) {
      console.error("Error creating topic:", error);
      toast({ title: "Error creating topic", description: error.message || "An unexpected error occurred.", variant: "destructive" });
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  return { createTopic, submitting };
};

// NOTE: You'll need to create `src/utils/slugUtils.ts` if it doesn't exist.
// A simple implementation for `generateSlug` could be:
// export const generateSlug = (title: string): string => {
//   return title
//     .toLowerCase()
//     .trim()
//     .replace(/[^\w\s-]/g, '') // Remove non-word characters except spaces and hyphens
//     .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
//     .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
// };
// Please let me know if you want me to create this slugUtils.ts file.
