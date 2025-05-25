
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UseManageTopicViewCountReturn {
  attemptViewCountUpdate: (topicId: string) => Promise<void>;
  resetViewCountUpdateStatus: () => void;
  wasViewCountUpdatedForTopic: (topicId: string) => boolean;
}

export const useManageTopicViewCount = (): UseManageTopicViewCountReturn => {
  const [viewCountUpdatedForTopicId, setViewCountUpdatedForTopicId] = useState<string | null>(null);

  const attemptViewCountUpdate = useCallback(async (topicId: string) => {
    if (viewCountUpdatedForTopicId === topicId) {
      console.log(`[useManageTopicViewCount] View count already updated for topic ${topicId}. Skipping.`);
      return;
    }

    try {
      console.log(`[useManageTopicViewCount] Updating view count for topic ${topicId}`);
      await supabase.rpc('increment_topic_view_count', { topic_id_param: topicId });
      setViewCountUpdatedForTopicId(topicId); 
      console.log(`[useManageTopicViewCount] View count updated successfully for topic ${topicId}`);
    } catch (err) {
      console.error('[useManageTopicViewCount] Error updating view count:', err);
      // Optionally, add a toast for view count update failure if desired,
      // but typically this is a silent operation.
    }
  }, [viewCountUpdatedForTopicId]);

  const resetViewCountUpdateStatus = useCallback(() => {
    console.log('[useManageTopicViewCount] Resetting view count update status.');
    setViewCountUpdatedForTopicId(null);
  }, []);
  
  const wasViewCountUpdatedForTopic = useCallback((topicId: string) => {
    return viewCountUpdatedForTopicId === topicId;
  }, [viewCountUpdatedForTopicId]);

  return { attemptViewCountUpdate, resetViewCountUpdateStatus, wasViewCountUpdatedForTopic };
};
