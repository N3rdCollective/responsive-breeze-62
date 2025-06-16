
import { useState } from "react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CreateTopicInput, ForumTopic, ForumPost, ForumPoll, ForumPollOption } from "@/types/forum";
import { generateSlug } from "@/utils/slugUtils";
import { createForumNotification } from "../utils/forumNotificationUtils";
import { extractMentionedUserIds } from "@/utils/mentionUtils";

interface TopicCreationResult {
  topic_id: string;
  post_id: string;
}

export const useForumTopicCreator = () => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const createTopic = async (input: CreateTopicInput): Promise<{ topic: ForumTopic; firstPost: ForumPost } | null> => {
    console.log('🔧 [TOPIC_CREATOR] Starting topic creation process', input);
    setSubmitting(true);
    
    try {
      console.log('🔐 [TOPIC_CREATOR] Getting user authentication');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('❌ [TOPIC_CREATOR] User not authenticated');
        toast({ title: "Authentication Error", description: "You must be logged in to create a topic.", variant: "destructive" });
        return null;
      }
      
      console.log('✅ [TOPIC_CREATOR] User authenticated:', user.id);

      const slug = generateSlug(input.title);
      console.log('🏷️ [TOPIC_CREATOR] Generated slug:', slug);

      // Use the new RPC function for atomic topic and post creation
      console.log('📝 [TOPIC_CREATOR] Creating topic and post via RPC function');
      const { data: rpcResult, error: rpcError } = await supabase.rpc('create_forum_topic_with_post', {
        p_category_id: input.category_id,
        p_title: input.title,
        p_slug: slug,
        p_content: input.content
      });

      if (rpcError) {
        console.error('❌ [TOPIC_CREATOR] RPC creation error:', rpcError);
        throw new Error(`Failed to create topic: ${rpcError.message}`);
      }

      if (!rpcResult) {
        console.error('❌ [TOPIC_CREATOR] No result from RPC function');
        throw new Error('Failed to create topic: No result returned');
      }

      // Parse the JSON result
      const result = rpcResult as TopicCreationResult;
      console.log('✅ [TOPIC_CREATOR] Topic and post created via RPC:', result);

      // Fetch the created topic and post with all necessary joins
      const [topicResult, postResult] = await Promise.all([
        supabase
          .from('forum_topics')
          .select(`
            *,
            profile:profiles!forum_topics_user_id_fkey(
              username,
              display_name,
              profile_picture,
              created_at,
              forum_post_count,
              forum_signature
            ),
            category:forum_categories!forum_topics_category_id_fkey(
              name,
              slug
            ),
            _count:forum_posts(count)
          `)
          .eq('id', result.topic_id)
          .single(),
        supabase
          .from('forum_posts')
          .select(`
            *,
            profile:profiles!forum_posts_user_id_fkey(
              username,
              display_name,
              profile_picture,
              created_at,
              forum_post_count,
              forum_signature
            ),
            forum_post_reactions(*)
          `)
          .eq('id', result.post_id)
          .single()
      ]);

      if (topicResult.error) {
        console.error('❌ [TOPIC_CREATOR] Error fetching created topic:', topicResult.error);
        // Topic was created but we can't fetch it - try basic fetch
        const basicTopic = await supabase.from('forum_topics').select('*').eq('id', result.topic_id).single();
        if (basicTopic.error) {
          throw new Error('Failed to fetch created topic data');
        }
        // Use basic topic data
        var topicData = basicTopic.data;
      } else {
        var topicData = topicResult.data;
      }

      if (postResult.error) {
        console.error('❌ [TOPIC_CREATOR] Error fetching created post:', postResult.error);
        // Post was created but we can't fetch it - try basic fetch
        const basicPost = await supabase.from('forum_posts').select('*').eq('id', result.post_id).single();
        if (basicPost.error) {
          throw new Error('Failed to fetch created post data');
        }
        // Use basic post data
        var postData = basicPost.data;
      } else {
        var postData = postResult.data;
      }

      // Handle poll creation if needed
      let createdPoll: ForumPoll | null = null;
      if (input.poll && input.poll.question && input.poll.options.length >= 2) {
        createdPoll = await createPoll(topicData.id, user.id, input.poll);
      }

      // Handle mentions
      await handleMentions(input.content, user, topicData, postData);

      const finalTopicData = { ...topicData, poll: createdPoll } as ForumTopic;

      console.log('🎉 [TOPIC_CREATOR] Topic creation completed successfully');
      toast({ title: "Topic Created!", description: `Your new topic "${input.title}" has been successfully created.`, variant: "default" });

      return { topic: finalTopicData, firstPost: postData as ForumPost };

    } catch (error: any) {
      console.error("❌ [TOPIC_CREATOR] Topic creation process failed:", error);
      toast({ title: "Error creating topic", description: error.message || "An unexpected error occurred.", variant: "destructive" });
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  // Helper function to create poll
  const createPoll = async (topicId: string, userId: string, pollInput: any): Promise<ForumPoll | null> => {
    try {
      console.log('🗳️ [TOPIC_CREATOR] Creating poll');
      
      const { data: pollData, error: pollError } = await supabase
        .from('forum_polls')
        .insert({
          topic_id: topicId,
          user_id: userId,
          question: pollInput.question,
          ends_at: pollInput.ends_at || null,
          allow_multiple_choices: false,
        })
        .select('*')
        .single();

      if (pollError) {
        console.error("❌ [TOPIC_CREATOR] Poll creation error:", pollError);
        toast({ title: "Poll Creation Failed", description: pollError.message, variant: "default" });
        return null;
      }

      console.log('✅ [TOPIC_CREATOR] Poll created:', pollData.id);
      
      const pollOptionsToInsert = pollInput.options.map((optText: string) => ({
        poll_id: pollData.id,
        option_text: optText,
      }));

      const { data: pollOptionsData, error: pollOptionsError } = await supabase
        .from('forum_poll_options')
        .insert(pollOptionsToInsert)
        .select('*');

      if (pollOptionsError) {
        console.error("❌ [TOPIC_CREATOR] Poll options creation error:", pollOptionsError);
        await supabase.from('forum_polls').delete().eq('id', pollData.id);
        return null;
      }

      const optionsWithCounts = pollOptionsData.map(opt => ({ ...opt, vote_count: 0 })) as ForumPollOption[];
      return { ...pollData, options: optionsWithCounts, totalVotes: 0, allow_multiple_choices: pollData.allow_multiple_choices };
    } catch (error) {
      console.error("❌ [TOPIC_CREATOR] Poll creation exception:", error);
      return null;
    }
  };

  // Helper function to handle mentions
  const handleMentions = async (content: string, user: any, topicData: any, postData: any) => {
    try {
      const mentionedUserIds = extractMentionedUserIds(content);
      if (mentionedUserIds.length > 0) {
        console.log('📧 [TOPIC_CREATOR] Creating mention notifications');
        const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'Someone';
        const contentPreview = `${displayName} mentioned you in the new topic "${topicData.title}"`;
        
        for (const mentionedUserId of mentionedUserIds) {
          if (mentionedUserId !== user.id) {
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
    } catch (error) {
      console.error('⚠️ [TOPIC_CREATOR] Mention handling failed:', error);
    }
  };

  return { createTopic, submitting };
};
