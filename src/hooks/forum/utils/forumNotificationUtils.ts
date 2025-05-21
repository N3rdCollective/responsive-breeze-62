
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
  console.log('[createForumNotification] Called with params:', { recipientId, actorId, type, topicId, postId, contentPreview });

  if (recipientId === actorId) {
    console.log('[createForumNotification] Recipient is the same as actor. Notification not created.');
    return; 
  }

  try {
    const notificationPayload = {
      recipient_id: recipientId,
      actor_id: actorId,
      type: type,
      topic_id: topicId,
      post_id: postId,
      content_preview: contentPreview,
    };
    console.log('[createForumNotification] Attempting to insert notification payload:', JSON.stringify(notificationPayload, null, 2));
    
    const { error } = await supabase.from('forum_notifications').insert(notificationPayload);
    
    if (error) {
      console.error(`[createForumNotification] Error creating ${type} notification:`, error.message, 'Details:', error);
    } else {
      console.log(`[createForumNotification] ${type} notification created successfully for recipient ${recipientId}.`);
    }
  } catch (err: any) {
    console.error(`[createForumNotification] Exception while creating ${type} notification:`, err.message || err);
  }
};

