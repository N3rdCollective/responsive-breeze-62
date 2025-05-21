
import { supabase } from '@/integrations/supabase/client';
import { DbNotification, Notification, NotificationType } from '@/types/notifications';
import { Profile } from '@/types/profile';

// Helper to get actor display name
const getActorDisplayName = (actorProfile: Partial<Profile> | null | undefined): string => {
  return actorProfile?.display_name || actorProfile?.username || 'Someone';
};

export const useNotificationMapper = () => {
  const mapDbNotificationToType = async (dbNotif: DbNotification): Promise<Notification> => {
    console.log('[useNotificationMapper] Mapping notification:', JSON.stringify(dbNotif, null, 2));
    const actorProfile = dbNotif.actor_profiles;
    const actorName = getActorDisplayName(actorProfile);
    const notificationType = dbNotif.type as NotificationType;
    
    let content = dbNotif.content_preview || 'New notification';
    let link = '/members/forum'; // Default link
    let topicTitle = dbNotif.details?.topic_title as string || 'a topic';
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
          if (!topicTitle || topicTitle === 'a topic') topicTitle = topicDetails.title; // Prioritize fetched title if generic
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
      case 'mention_post': // A user was mentioned in an initial topic post
        content = dbNotif.content_preview || `${actorName} mentioned you in the new topic "${topicTitle}"`;
        break;
      case 'mention_reply': // A user was mentioned in a reply to a topic
        content = dbNotif.content_preview || `${actorName} mentioned you in a reply on "${topicTitle}"`;
        break;
      case 'like_post':
      case 'like_reply': // Consolidate like notifications
        content = dbNotif.content_preview || `${actorName} liked your post in "${topicTitle}"`;
        break;
      case 'quote':
        content = dbNotif.content_preview || `${actorName} quoted your post in "${topicTitle}"`;
        break;
      case 'new_topic_in_category': // This type might be for category subscriptions (if implemented)
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
        content = dbNotif.content_preview || `Notification from ${actorName}`;
    }
    
    // Construct link for forum-related notifications
    // targetPostId should point to the specific post of interest for the notification
    // For 'reply' or 'mention_reply', it's the new reply itself (dbNotif.post_id)
    // For 'quote', dbNotif.post_id is the original quoted post.
    //    We want to link to the page containing the post where the quote action happened (the new reply).
    //    This implies that for 'quote' notifications, the 'post_id' on 'forum_notifications' should ideally be the *new post containing the quote*.
    //    If 'details.reply_post_id_containing_quote' is available, use that. Otherwise, use dbNotif.post_id.
    //    For now, we'll assume dbNotif.post_id is what we need to find the page for.
    //    `dbNotif.details?.quoted_post_id` is the ID of the post that was quoted.
    //    `dbNotif.post_id` in the case of a quote notification (as currently implemented in useQuoteHandler) IS the original quoted post.
    //    This is an area for future refinement if needed. For now, targetPostId will be dbNotif.post_id for most relevant actions.
    const targetPostId = dbNotif.post_id; // Simplify for now: always use the post_id from the notification record.

    const isForumContextNotification = ['reply', 'mention_post', 'mention_reply', 'like_post', 'like_reply', 'quote'].includes(notificationType);

    if (isForumContextNotification) {
      if (categorySlugVal && topicSlugVal) {
        link = `/members/forum/${categorySlugVal}/${topicSlugVal}`;
        if (targetPostId) {
          link += `?postId=${targetPostId}`; // Use query parameter
        }
      } else {
        // Fallback if category or topic slug is missing. 'link' remains '/members/forum'.
        console.warn(`[useNotificationMapper] Could not determine specific topic link for forum notification ID ${dbNotif.id}. Defaulting to /members/forum. CategorySlug: '${categorySlugVal}', TopicSlug: '${topicSlugVal}'. Details:`, dbNotif.details);
      }
    } else if (dbNotif.details?.link_url && notificationType !== 'system') { // Use explicit link_url if provided and not already handled by 'system'
        link = dbNotif.details.link_url as string;
    }


    const mapped: Notification = {
      id: dbNotif.id,
      type: notificationType,
      actor: actorProfile ? {
        id: actorProfile.id || '', // Ensure id is not undefined
        username: actorProfile.username || 'Unknown',
        display_name: actorProfile.display_name || actorProfile.username || 'Unknown User',
        profile_picture: actorProfile.profile_picture || undefined,
      } : undefined,
      content: content,
      timestamp: dbNotif.created_at,
      read: dbNotif.read,
      link: link,
      topicId: dbNotif.topic_id,
      postId: dbNotif.post_id, // This is the post_id from the notification record itself
      details: dbNotif.details || undefined,
    };
    console.log('[useNotificationMapper] Mapped notification result:', JSON.stringify(mapped, null, 2));
    return mapped;
  };

  return { mapDbNotificationToType };
};
