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

      // Step 1: Create the topic with minimal data to avoid RLS issues
      console.log('📝 [TOPIC_CREATOR] Creating topic in database');
      const { data: topicInsertData, error: topicError } = await supabase
        .from('forum_topics')
        .insert({
          category_id: input.category_id,
          user_id: user.id,
          title: input.title,
          slug: slug,
          last_post_at: new Date().toISOString(),
          last_post_user_id: user.id,
        })
        .select('id, title, slug, category_id, user_id, created_at, updated_at, last_post_at, last_post_user_id, is_locked, is_pinned, view_count, post_count')
        .single();

      if (topicError) {
        console.error('❌ [TOPIC_CREATOR] Topic creation error:', topicError);
        throw topicError;
      }
      if (!topicInsertData) {
        console.error('❌ [TOPIC_CREATOR] Topic data is null');
        throw new Error("Failed to create topic.");
      }
      
      console.log('✅ [TOPIC_CREATOR] Topic created successfully:', topicInsertData.id);

      // Step 2: Create the first post with minimal data to avoid RLS issues
      console.log('📝 [TOPIC_CREATOR] Creating first post');
      const { data: postInsertData, error: postError } = await supabase
        .from('forum_posts')
        .insert({
          topic_id: topicInsertData.id,
          user_id: user.id,
          content: input.content,
        })
        .select('id, topic_id, user_id, content, created_at, updated_at')
        .single();
      
      if (postError) {
        console.error("❌ [TOPIC_CREATOR] Post creation error:", postError);
        // Attempt to rollback topic
        console.log('🔄 [TOPIC_CREATOR] Attempting to rollback topic creation');
        await supabase.from('forum_topics').delete().eq('id', topicInsertData.id);
        throw new Error(`Failed to create the first post for the topic: ${postError.message}`);
      }
      if (!postInsertData) {
        console.error('❌ [TOPIC_CREATOR] Post data is null');
        throw new Error("Failed to create the first post for the topic.");
      }
      
      console.log('✅ [TOPIC_CREATOR] First post created successfully:', postInsertData.id);

      // Step 3: Fetch complete topic data with relationships
      let completeTopicData;
      try {
        console.log('📝 [TOPIC_CREATOR] Fetching complete topic data with relationships');
        const { data: fetchedTopicData, error: topicFetchError } = await supabase
          .from('forum_topics')
          .select(`
            *,
            profile:profiles!forum_topics_user_id_fkey(username, display_name, profile_picture), 
            category:forum_categories!forum_topics_category_id_fkey(name, slug)
          `)
          .eq('id', topicInsertData.id)
          .single();

        if (topicFetchError) {
          console.warn('⚠️ [TOPIC_CREATOR] Warning: Could not fetch complete topic data:', topicFetchError);
          completeTopicData = topicInsertData;
        } else {
          completeTopicData = fetchedTopicData;
        }
      } catch (fetchError) {
        console.warn('⚠️ [TOPIC_CREATOR] Warning: Exception fetching complete topic data:', fetchError);
        completeTopicData = topicInsertData;
      }

      // Step 4: Fetch complete post data with relationships
      let completePostData;
      try {
        console.log('📝 [TOPIC_CREATOR] Fetching complete post data with relationships');
        const { data: fetchedPostData, error: postFetchError } = await supabase
          .from('forum_posts')
          .select(`
            *,
            profile:profiles!forum_posts_user_id_fkey(username, display_name, profile_picture),
            forum_post_reactions (id, user_id, reaction_type)
          `)
          .eq('id', postInsertData.id)
          .single();

        if (postFetchError) {
          console.warn('⚠️ [TOPIC_CREATOR] Warning: Could not fetch complete post data:', postFetchError);
          completePostData = postInsertData;
        } else {
          completePostData = fetchedPostData;
        }
      } catch (fetchError) {
        console.warn('⚠️ [TOPIC_CREATOR] Warning: Exception fetching complete post data:', fetchError);
        completePostData = postInsertData;
      }

      let createdPoll: ForumPoll | null = null;
      
      // Step 5: Create Poll if data is provided
      if (input.poll && input.poll.question && input.poll.options.length >= 2) {
        console.log('🗳️ [TOPIC_CREATOR] Creating poll');
        
        try {
          const { data: pollData, error: pollError } = await supabase
            .from('forum_polls')
            .insert({
              topic_id: topicInsertData.id,
              user_id: user.id,
              question: input.poll.question,
              ends_at: input.poll.ends_at || null,
              allow_multiple_choices: false,
            })
            .select('*')
            .single();

          if (pollError) {
            console.error("❌ [TOPIC_CREATOR] Poll creation error:", pollError);
            toast({ title: "Poll Creation Failed", description: "Topic was created, but the poll could not be added: " + pollError.message, variant: "default" });
          } else if (pollData) {
            console.log('✅ [TOPIC_CREATOR] Poll created successfully:', pollData.id);
            
            const pollOptionsToInsert = input.poll.options.map(optText => ({
              poll_id: pollData.id,
              option_text: optText,
            }));

            console.log('📋 [TOPIC_CREATOR] Creating poll options');
            const { data: pollOptionsData, error: pollOptionsError } = await supabase
              .from('forum_poll_options')
              .insert(pollOptionsToInsert)
              .select('*');

            if (pollOptionsError) {
              console.error("❌ [TOPIC_CREATOR] Poll options creation error:", pollOptionsError);
              await supabase.from('forum_polls').delete().eq('id', pollData.id);
              toast({ title: "Poll Options Failed", description: "Poll was not added: " + pollOptionsError.message, variant: "default" });
            } else if (pollOptionsData) {
              console.log('✅ [TOPIC_CREATOR] Poll options created successfully');
              const optionsWithCounts = pollOptionsData.map(opt => ({ ...opt, vote_count: 0 })) as ForumPollOption[];
              createdPoll = { ...pollData, options: optionsWithCounts, totalVotes: 0, allow_multiple_choices: pollData.allow_multiple_choices };
            }
          }
        } catch (pollError) {
          console.error("❌ [TOPIC_CREATOR] Exception during poll creation:", pollError);
          toast({ title: "Poll Creation Failed", description: "Topic was created, but the poll could not be added.", variant: "default" });
        }
      }
      
      const finalTopicData = { ...completeTopicData, poll: createdPoll } as ForumTopic;

      console.log('🎉 [TOPIC_CREATOR] Topic creation process completed successfully');
      toast({ title: "Topic Created!", description: `Your new topic "${input.title}" has been successfully created. ${createdPoll ? 'Poll also added.' : ''}`, variant: "default" });

      // Step 6: Handle mention notifications for the first post
      try {
        const mentionedUserIds = extractMentionedUserIds(input.content);
        if (mentionedUserIds.length > 0) {
          console.log('📧 [TOPIC_CREATOR] Creating mention notifications for users:', mentionedUserIds);
          const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'Someone';
          const contentPreview = `${displayName} mentioned you in the new topic "${topicInsertData.title}"`;
          
          for (const mentionedUserId of mentionedUserIds) {
            if (mentionedUserId !== user.id) {
              await createForumNotification(
                mentionedUserId,
                user.id,
                'mention_post', 
                topicInsertData.id,
                postInsertData.id,
                contentPreview
              );
            }
          }
        }
      } catch (notificationError) {
        console.error('⚠️ [TOPIC_CREATOR] Notification creation failed (non-critical):', notificationError);
      }

      return { topic: finalTopicData, firstPost: completePostData as ForumPost };

    } catch (error: any) {
      console.error("❌ [TOPIC_CREATOR] Topic creation process failed:", error);
      toast({ title: "Error creating topic", description: error.message || "An unexpected error occurred.", variant: "destructive" });
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  return { createTopic, submitting };
};