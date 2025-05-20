
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ForumTopic, CreateTopicInput } from '@/types/forum';

export const useForumTopicCreator = () => {
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const createTopic = async (input: CreateTopicInput): Promise<ForumTopic | null> => {
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
      
      const slug = input.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Allow hyphens
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .substring(0, 75); // Increased slug length
        
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
      if (!topicData) throw new Error("Failed to create topic, no data returned.");
      
      const { error: postError } = await supabase
        .from('forum_posts')
        .insert({
          topic_id: topicData.id,
          user_id: user.id,
          content: input.content
        });
        
      if (postError) {
        // Rollback topic creation or mark as incomplete? For now, log and error.
        console.error('Error creating initial post for topic:', postError.message);
        // Attempt to delete the orphaned topic
        await supabase.from('forum_topics').delete().eq('id', topicData.id);
        toast({
            title: "Error creating topic",
            description: "Failed to create the initial post. The topic was not created.",
            variant: "destructive"
        });
        throw postError;
      }
      
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

  return { createTopic, submitting };
};
