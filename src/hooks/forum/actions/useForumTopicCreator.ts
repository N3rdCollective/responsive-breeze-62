import { useState } from "react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CreateTopicInput, ForumTopic, ForumPost, ForumPoll, ForumPollOption } from "@/types/forum";
import { generateSlug } from "@/utils/slugUtils";
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
          last_post_at: new Date().toISOString(),
          last_post_user_id: user.id,
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
        console.error("Error creating first post, topic was created but post failed:", postError);
        await supabase.from('forum_topics').delete().eq('id', topicData.id); // Attempt to rollback topic
        throw new Error(`Failed to create the first post for the topic: ${postError.message}`);
      }
      if (!postData) throw new Error("Failed to create the first post for the topic.");

      let createdPoll: ForumPoll | null = null;
      // Create Poll if data is provided
      if (input.poll && input.poll.question && input.poll.options.length >= 2) {
        const { data: pollData, error: pollError } = await supabase
          .from('forum_polls')
          .insert({
            topic_id: topicData.id,
            user_id: user.id,
            question: input.poll.question,
            ends_at: input.poll.ends_at || null,
            // allow_multiple_choices will default to false as per table definition
          })
          .select('*')
          .single();

        if (pollError) {
          console.error("Error creating poll, topic and post were created but poll failed:", pollError);
          // Not rolling back topic/post for poll failure at this stage, but logging error.
          // Could consider more complex rollback or user notification.
          toast({ title: "Poll Creation Failed", description: "Topic was created, but the poll could not be added: " + pollError.message, variant: "warning" });
        } else if (pollData) {
          const pollOptionsToInsert = input.poll.options.map(optText => ({
            poll_id: pollData.id,
            option_text: optText,
          }));

          const { data: pollOptionsData, error: pollOptionsError } = await supabase
            .from('forum_poll_options')
            .insert(pollOptionsToInsert)
            .select('*');

          if (pollOptionsError) {
            console.error("Error creating poll options:", pollOptionsError);
            // Rollback poll?
            await supabase.from('forum_polls').delete().eq('id', pollData.id);
            toast({ title: "Poll Options Failed", description: "Poll was not added: " + pollOptionsError.message, variant: "warning" });
          } else if (pollOptionsData) {
            createdPoll = { ...pollData, options: pollOptionsData as ForumPollOption[], totalVotes: 0 };
          }
        }
      }
      
      const finalTopicData = { ...topicData, poll: createdPoll } as ForumTopic;

      toast({ title: "Topic Created!", description: `Your new topic "${input.title}" has been successfully created. ${createdPoll ? 'Poll also added.' : ''}`, variant: "default" });

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

      return { topic: finalTopicData, firstPost: postData as ForumPost };

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
