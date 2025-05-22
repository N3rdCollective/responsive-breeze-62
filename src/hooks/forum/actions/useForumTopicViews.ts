
import { supabase } from '@/integrations/supabase/client';

export const useForumTopicViews = () => {
  const incrementViewCount = async (topicId: string) => {
    try {
      const { error } = await supabase.rpc('increment_topic_view_count', {
        topic_id_param: topicId
      });
      if (error) throw error;
    } catch (error: any) {
      console.error('Error incrementing view count:', error.message);
      // Silently fail is current behavior, can add toast if needed.
    }
  };

  return { incrementViewCount };
};
