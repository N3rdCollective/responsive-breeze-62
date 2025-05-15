
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ForumTopic, CreateTopicInput, CreatePostInput } from '@/types/forum';

export const useForum = () => {
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const createTopic = async (input: CreateTopicInput) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create a topic.",
        variant: "destructive"
      });
      return null;
    }
    
    try {
      setSubmitting(true);
      
      // Generate a slug from the title
      const slug = input.title
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 60);
        
      // Create the topic
      const { data: topicData, error: topicError } = await supabase
        .from('forum_topics')
        .insert({
          category_id: input.category_id,
          user_id: user.id,
          title: input.title,
          slug: slug
        })
        .select()
        .single();
        
      if (topicError) throw topicError;
      
      if (!topicData) throw new Error("Failed to create topic");
      
      // Create the first post in the topic
      const { data: postData, error: postError } = await supabase
        .from('forum_posts')
        .insert({
          topic_id: topicData.id,
          user_id: user.id,
          content: input.content
        });
        
      if (postError) throw postError;
      
      toast({
        title: "Topic created",
        description: "Your topic has been created successfully!"
      });
      
      return topicData as ForumTopic;
    } catch (err: any) {
      console.error('Error creating topic:', err.message);
      toast({
        title: "Error creating topic",
        description: err.message || "Failed to create topic. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  const createPost = async (input: CreatePostInput) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to reply to a topic.",
        variant: "destructive"
      });
      return null;
    }
    
    try {
      setSubmitting(true);
      
      const { data, error } = await supabase
        .from('forum_posts')
        .insert({
          topic_id: input.topic_id,
          user_id: user.id,
          content: input.content
        })
        .select(`
          *,
          profile:profiles(username, display_name, avatar_url)
        `)
        .single();
        
      if (error) throw error;
      
      toast({
        title: "Reply posted",
        description: "Your reply has been posted successfully!"
      });
      
      return data;
    } catch (err: any) {
      console.error('Error posting reply:', err.message);
      toast({
        title: "Error posting reply",
        description: err.message || "Failed to post your reply. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setSubmitting(false);
    }
  };
  
  const incrementViewCount = async (topicId: string) => {
    try {
      await supabase.rpc('increment_topic_views', { topic_id: topicId });
    } catch (error) {
      // Silently fail, this is not critical
      console.error('Error incrementing view count:', error);
    }
  };

  return {
    submitting,
    createTopic,
    createPost,
    incrementViewCount
  };
};
