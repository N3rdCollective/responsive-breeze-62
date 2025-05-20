
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Notification, NotificationUser, NotificationType } from '@/types/notifications';

export const useNotificationMapper = () => {
  const mapDbNotificationToType = useCallback(async (dbNotif: any): Promise<Notification> => {
    let actorProfile: NotificationUser | undefined = undefined;
    if (dbNotif.actor_id) {
      let actorName = 'User';
      let actorAvatar: string | undefined = undefined;
      let actorId = dbNotif.actor_id;

      // Prefer pre-fetched actor_profiles if available
      if (dbNotif.actor_profiles) {
        actorName = dbNotif.actor_profiles.display_name || dbNotif.actor_profiles.username || 'User';
        actorAvatar = dbNotif.actor_profiles.profile_picture;
        actorId = dbNotif.actor_profiles.id || dbNotif.actor_id;
      } else {
        // Fallback to fetching profile if actor_profiles is not available
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, display_name, username, profile_picture')
          .eq('id', dbNotif.actor_id)
          .single();
        if (!profileError && profileData) {
          actorId = profileData.id;
          actorName = profileData.display_name || profileData.username || 'User';
          actorAvatar = profileData.profile_picture;
        }
      }
      actorProfile = { id: actorId, name: actorName, avatar: actorAvatar };
    }

    let content = dbNotif.content_preview || `Notification type: ${dbNotif.type}`;
    let link = '/members/forum';
    let topicTitle = '';
    let topicSlugVal: string | undefined = undefined;
    let categorySlugVal: string | undefined = undefined;

    if (dbNotif.topic_id) {
      const { data: topicDetails, error: topicError } = await supabase
        .from('forum_topics')
        .select('title, slug, category:forum_categories(slug)')
        .eq('id', dbNotif.topic_id)
        .single();
      if (!topicError && topicDetails) {
        topicTitle = topicDetails.title;
        topicSlugVal = topicDetails.slug;
        if (topicDetails.category && typeof topicDetails.category === 'object' && topicDetails.category !== null && 'slug' in topicDetails.category) {
          categorySlugVal = (topicDetails.category as { slug: string }).slug;
        } else if (typeof topicDetails.category === 'string') {
            // This case should ideally not happen if the query is correct
            // but as a fallback, if category is just a slug string (old structure?)
            console.warn("Topic category data is not in expected object format, attempting to use as slug.");
            categorySlugVal = topicDetails.category;
        }
      }
    }
    
    const notificationType = dbNotif.type as NotificationType;

    switch (notificationType) {
      case 'reply':
        if (actorProfile && topicTitle) {
          content = `${actorProfile.name} replied to your topic: "${topicTitle}"`;
        }
        break;
      case 'like':
        if (actorProfile && topicTitle) {
          content = `${actorProfile.name} liked your post in: "${topicTitle}"`;
        }
        break;
      case 'mention_reply':
        if (actorProfile && topicTitle) {
          content = `${actorProfile.name} mentioned you in a reply on topic: "${topicTitle}"`;
        } else if (actorProfile) {
          content = `${actorProfile.name} mentioned you in a reply.`;
        }
        break;
      case 'mention_post':
         if (actorProfile && topicTitle) {
          content = `${actorProfile.name} mentioned you in a post on topic: "${topicTitle}"`;
        } else if (actorProfile) {
          content = `${actorProfile.name} mentioned you in a post.`;
        }
        break;
      case 'system':
        content = dbNotif.content_preview || "System notification";
        break;
      default:
        // For unknown types, use the content_preview or a generic message
        content = dbNotif.content_preview || `Notification: ${dbNotif.type}`;
    }

    // Construct link, ensuring topicSlugVal or dbNotif.topic_id is used
    if (categorySlugVal && (topicSlugVal || dbNotif.topic_id)) {
      link = `/members/forum/${categorySlugVal}/${topicSlugVal || dbNotif.topic_id}`;
      if (dbNotif.post_id) link += `?post_id=${dbNotif.post_id}#post-${dbNotif.post_id}`;
    }


    return {
      id: dbNotif.id,
      type: notificationType,
      read: dbNotif.read,
      actor: actorProfile,
      content: content,
      link: link,
      timestamp: dbNotif.created_at,
      topic_id: dbNotif.topic_id,
      post_id: dbNotif.post_id,
      content_preview: dbNotif.content_preview,
      topic_title: topicTitle,
      topic_slug: topicSlugVal,
      category_slug: categorySlugVal,
    };
  }, []);

  return { mapDbNotificationToType };
};
