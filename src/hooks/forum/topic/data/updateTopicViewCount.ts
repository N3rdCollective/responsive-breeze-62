
import { SupabaseClient } from '@supabase/supabase-js';

export const updateTopicViewCount = async (
  topicId: string,
  supabase: SupabaseClient
): Promise<void> => {
  try {
    console.log(`[updateTopicViewCount] Updating view count for topic ${topicId}`);
    await supabase.rpc('increment_topic_view_count', { topic_id_param: topicId });
  } catch (err) {
    console.error('[updateTopicViewCount] Error updating view count:', err);
    // Optionally, add a toast for view count update failure if desired
    // No re-throw here, as this is a background task and shouldn't block UI
  }
};
