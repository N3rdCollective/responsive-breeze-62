
import { supabase } from '@/integrations/supabase/client';
import { NotificationType } from '@/types/notifications'; // Import updated NotificationType

export const createForumNotification = async (
  recipientId: string,
  actorId: string,
  type: NotificationType, // Use the updated NotificationType
  topicId: string,
  postId?: string,
  contentPreview?: string
) => {
  if (recipientId === actorId) return; // Don't notify users about their own actions

  try {
    const { error } = await supabase.from('forum_notifications').insert({
      recipient_id: recipientId,
      actor_id: actorId,
      type: type,
      topic_id: topicId,
      post_id: postId,
      content_preview: contentPreview, // This will be stored in the DB
    });
    if (error) {
      console.error(`Error creating ${type} notification:`, error);
    }
  } catch (err) {
    console.error(`Exception while creating ${type} notification:`, err);
  }
};
