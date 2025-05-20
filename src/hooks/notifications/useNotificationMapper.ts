
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Notification, NotificationUser } from '@/types/notifications';

export const useNotificationMapper = () => {
  const mapDbNotificationToType = useCallback(async (dbNotif: any): Promise<Notification> => {
    let actorProfile: NotificationUser | undefined = undefined;
    if (dbNotif.actor_id) {
      let actorName = 'User';
      let actorAvatar: string | undefined = undefined;
      let actorId = dbNotif.actor_id;

      if (dbNotif.actor_profiles) {
        actorName = dbNotif.actor_profiles.display_name || dbNotif.actor_profiles.username || 'User';
        actorAvatar = dbNotif.actor_profiles.profile_picture;
      } else {
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
        }
      }
    }

    if (dbNotif.type === 'reply' && actorProfile && topicTitle) {
      content = `${actorProfile.name} replied to your topic: "${topicTitle}"`;
      if (categorySlugVal && (topicSlugVal || dbNotif.topic_id)) {
        link = `/members/forum/${categorySlugVal}/${topicSlugVal || dbNotif.topic_id}`;
        if (dbNotif.post_id) link += `?post_id=${dbNotif.post_id}`;
      }
    } else if (dbNotif.type === 'like' && actorProfile && topicTitle) {
      content = `${actorProfile.name} liked your post in: "${topicTitle}"`;
      if (categorySlugVal && (topicSlugVal || dbNotif.topic_id)) {
        link = `/members/forum/${categorySlugVal}/${topicSlugVal || dbNotif.topic_id}`;
        if (dbNotif.post_id) link += `?post_id=${dbNotif.post_id}`;
      }
    } else if (dbNotif.type === 'system') {
      content = dbNotif.content_preview || "System notification";
    }

    return {
      id: dbNotif.id,
      type: dbNotif.type,
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

