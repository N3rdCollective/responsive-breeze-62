
import { supabase } from '@/integrations/supabase/client';
import { DbNotification, Notification, NotificationType, NotificationUser } from '@/types/notifications'; // Added DbNotification, NotificationUser
import { UserProfile } from '@/types/profile'; // Changed Profile to UserProfile

// Helper to get actor display name
const getActorDisplayName = (actorProfile: Partial<UserProfile> | null | undefined): string => {
  return actorProfile?.display_name || actorProfile?.username || 'Someone';
};

export const useNotificationMapper = () => {
  const mapDbNotificationToType = async (dbNotif: DbNotification): Promise<Notification> => {
    console.log('[useNotificationMapper] Mapping notification:', JSON.stringify(dbNotif, null, 2));
    const actorProfileData = dbNotif.actor_profiles;
    const actorName = getActorDisplayName(actorProfileData);
    const notificationType = dbNotif.type as NotificationType; // Cast raw string type

    let content = dbNotif.content_preview || 'New notification';
    let link = '/members/forum'; // Default link
    let topicTitle = (dbNotif.details?.topic_title as string) || 'a topic';
    let topicSlugVal = dbNotif.details?.topic_slug as string | undefined;
    let categorySlugVal = dbNotif.details?.category_slug as string | undefined;

    // Consolidate fetching topic details if needed
    if (dbNotif.topic_id && (!topicSlugVal || !categorySlugVal || (notificationType !== 'system' && !dbNotif.details?.topic_title))) {
      console.log(`[useNotificationMapper] Topic details partially missing for topic_id ${dbNotif.topic_id}. Fetching. Current: topicSlug='${topicSlugVal}', categorySlug='${categorySlugVal}', topicTitle='${topicTitle}'`);
      try {
        const { data: topicDetails, error: topicError } = await supabase
          .from('forum_topics')
          .select('title, slug, category:forum_categories(slug)')
          .eq('id', dbNotif.topic_id)
          .single();

        if (topicError) {
          console.error(`[useNotificationMapper] Error fetching topic details for ${dbNotif.topic_id}:`, topicError);
        } else if (topicDetails) {
          console.log(`[useNotificationMapper] Fetched topic details for ${dbNotif.topic_id}:`, topicDetails);
          if (!topicTitle || topicTitle === 'a topic') topicTitle = topicDetails.title;
          if (!topicSlugVal) topicSlugVal = topicDetails.slug;
          if (!categorySlugVal && topicDetails.category && typeof topicDetails.category === 'object' && topicDetails.category !== null && 'slug' in topicDetails.category) {
            categorySlugVal = (topicDetails.category as { slug: string }).slug;
          }
        }
      } catch (e) {
        console.error(`[useNotificationMapper] Exception fetching topic details for ${dbNotif.topic_id}:`, e);
      }
    } else if (dbNotif.details) {
      // Ensure values from details are used if fetching wasn't needed
      if (dbNotif.details.topic_title && (!topicTitle || topicTitle === 'a topic')) topicTitle = dbNotif.details.topic_title as string;
      if (dbNotif.details.topic_slug && !topicSlugVal) topicSlugVal = dbNotif.details.topic_slug as string;
      if (dbNotif.details.category_slug && !categorySlugVal) categorySlugVal = dbNotif.details.category_slug as string;
    }


    // Determine content and link based on notification type
    switch (notificationType) {
      case 'reply':
        content = dbNotif.content_preview || `${actorName} replied to your topic "${topicTitle}"`;
        break;
      case 'mention_post':
        content = dbNotif.content_preview || `${actorName} mentioned you in the new topic "${topicTitle}"`;
        break;
      case 'mention_reply':
        content = dbNotif.content_preview || `${actorName} mentioned you in a reply on "${topicTitle}"`;
        break;
      case 'like_post': // Now valid
      case 'like_reply': // Now valid
        // The 'like' case can be a fallback if specific like_post/like_reply is not used from DB
      case 'like':
        content = dbNotif.content_preview || `${actorName} liked your post in "${topicTitle}"`;
        break;
      case 'quote':
        content = dbNotif.content_preview || `${actorName} quoted your post in "${topicTitle}"`;
        break;
      case 'new_topic_in_category': // Now valid
        content = dbNotif.content_preview || `${actorName} created a new topic "${topicTitle}" in a category you follow.`;
        break;
      case 'system':
        content = dbNotif.content_preview || 'New system notification.';
        if (dbNotif.details?.link_url) {
          link = dbNotif.details.link_url as string;
        } else {
          link = '/'; // Default system notification link
        }
        break;
      default:
        // const exhaustiveCheck: never = notificationType; // This might cause issues if DB sends unknown types
        console.warn(`[useNotificationMapper] Unhandled notification type: ${notificationType}`);
        content = dbNotif.content_preview || `Notification from ${actorName}`;
    }
    
    const targetPostId = dbNotif.post_id;

    const isForumContextNotification = ['reply', 'mention_post', 'mention_reply', 'like', 'like_post', 'like_reply', 'quote'].includes(notificationType);

    if (isForumContextNotification) {
      if (categorySlugVal && topicSlugVal) {
        link = `/members/forum/${categorySlugVal}/${topicSlugVal}`;
        if (targetPostId) {
          link += `?postId=${targetPostId}`;
        }
      } else {
        console.warn(`[useNotificationMapper] Could not determine specific topic link for forum notification ID ${dbNotif.id}. Defaulting to /members/forum. CategorySlug: '${categorySlugVal}', TopicSlug: '${topicSlugVal}'. Details:`, dbNotif.details);
      }
    } else if (dbNotif.details?.link_url && notificationType !== 'system') {
        link = dbNotif.details.link_url as string;
    }

    const mappedActor: NotificationUser | undefined = actorProfileData ? {
        id: actorProfileData.id || '', // This is user_id of actor
        name: actorProfileData.display_name || actorProfileData.username || 'Unknown User',
        avatar: actorProfileData.profile_picture || undefined,
      } : undefined;

    const mapped: Notification = {
      id: dbNotif.id,
      type: notificationType,
      actor: mappedActor,
      content: content,
      timestamp: dbNotif.created_at,
      read: dbNotif.read,
      link: link,
      topicId: dbNotif.topic_id || undefined,
      postId: dbNotif.post_id || undefined,
      details: dbNotif.details || undefined,
    };
    console.log('[useNotificationMapper] Mapped notification result:', JSON.stringify(mapped, null, 2));
    return mapped;
  };

  return { mapDbNotificationToType };
};
