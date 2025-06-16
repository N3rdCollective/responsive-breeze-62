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

      // Use RPC function instead of direct insert to bypass RLS issues
      console.log('📝 [TOPIC_CREATOR] Creating topic via RPC function');
      const { data: rpcResult, error: rpcError } = await supabase.rpc('create_forum_topic_with_post', {
        p_category_id: input.category_id,
        p_title: input.title,
        p_slug: slug,
        p_content: input.content
      });

      if (rpcError) {
        console.error('❌ [TOPIC_CREATOR] RPC creation error:', rpcError);
        // Fallback to manual creation if RPC doesn't exist
        return await createTopicManually(input, user, slug);
      }

      if (!rpcResult || !rpcResult.topic_id || !rpcResult.post_id) {
        console.error('❌ [TOPIC_CREATOR] Invalid RPC result:', rpcResult);
        return await createTopicManually(input, user, slug);
      }

      console.log('✅ [TOPIC_CREATOR] Topic and post created via RPC:', rpcResult);

      // Fetch the created topic and post
      const [topicResult, postResult] = await Promise.all([
        supabase.from('forum_topics').select('*').eq('id', rpcResult.topic_id).single(),
        supabase.from('forum_posts').select('*').eq('id', rpcResult.post_id).single()
      ]);

      if (topicResult.error || postResult.error) {
        console.error('❌ [TOPIC_CREATOR] Error fetching created data:', { topicResult, postResult });
        throw new Error('Failed to fetch created topic and post data');
      }

      const topicData = topicResult.data;
      const postData = postResult.data;

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

  // Fallback manual creation method
  const createTopicManually = async (input: CreateTopicInput, user: any, slug: string) => {
    console.log('📝 [TOPIC_CREATOR] Falling back to manual creation');
    
    // Create topic with absolute minimal data
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
      .select('id, title, slug, category_id, user_id, created_at')
      .single();

    if (topicError) {
      console.error('❌ [TOPIC_CREATOR] Topic creation error:', topicError);
      throw topicError;
    }

    console.log('✅ [TOPIC_CREATOR] Topic created:', topicData.id);

    // Create post with absolute minimal data
    const { data: postData, error: postError } = await supabase
      .from('forum_posts')
      .insert({
        topic_id: topicData.id,
        user_id: user.id,
        content: input.content,
      })
      .select('id, topic_id, user_id, content, created_at')
      .single();
    
    if (postError) {
      console.error("❌ [TOPIC_CREATOR] Post creation error:", postError);
      // Rollback topic
      await supabase.from('forum_topics').delete().eq('id', topicData.id);
      throw new Error(`Failed to create post: ${postError.message}`);
    }

    console.log('✅ [TOPIC_CREATOR] Post created:', postData.id);

    // Handle poll creation if needed
    let createdPoll: ForumPoll | null = null;
    if (input.poll && input.poll.question && input.poll.options.length >= 2) {
      createdPoll = await createPoll(topicData.id, user.id, input.poll);
    }

    // Handle mentions
    await handleMentions(input.content, user, topicData, postData);

    const finalTopicData = { ...topicData, poll: createdPoll } as ForumTopic;

    return { topic: finalTopicData, firstPost: postData as ForumPost };
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