
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

    let content = dbNotif.content_preview || dbNotif.details?.content_summary || `Notification type: ${dbNotif.type}`;
    let link = '/members/forum';
    let topicTitle = dbNotif.details?.topic_title || '';
    let topicSlugVal: string | undefined = dbNotif.details?.topic_slug;
    let categorySlugVal: string | undefined = undefined; // Will be fetched if topic_id exists

    // Fetch topic details if not already in dbNotif.details (prefer details from notification itself if present)
    if (dbNotif.topic_id && (!topicTitle || !topicSlugVal)) {
      const { data: topicDetails, error: topicError } = await supabase
        .from('forum_topics')
        .select('title, slug, category:forum_categories(slug)')
        .eq('id', dbNotif.topic_id)
        .single();
      if (!topicError && topicDetails) {
        topicTitle = topicDetails.title; // Overwrite if fetched is newer/better
        topicSlugVal = topicDetails.slug;
        if (topicDetails.category && typeof topicDetails.category === 'object' && topicDetails.category !== null && 'slug' in topicDetails.category) {
          categorySlugVal = (topicDetails.category as { slug: string }).slug;
        }
      }
    } else if (dbNotif.details?.topic_id && dbNotif.details?.category_slug) {
      // If details has topic_id and category_slug, use them (less common scenario, but for completeness)
      categorySlugVal = dbNotif.details.category_slug;
    }
    
    const notificationType = (dbNotif.details?.true_type || dbNotif.type) as NotificationType;

    switch (notificationType) {
      case 'reply':
        if (actorProfile && topicTitle) {
          content = `${actorProfile.name} replied to your topic: "${topicTitle}"`;
        } else if (actorProfile) {
          content = `${actorProfile.name} replied to a topic.`;
        }
        break;
      case 'like':
        if (actorProfile && topicTitle) {
          content = `${actorProfile.name} liked your post in: "${topicTitle}"`;
        } else if (actorProfile) {
          content = `${actorProfile.name} liked a post.`;
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
      case 'quote': // Handle new 'quote' type
        if (actorProfile && topicTitle) {
          content = `${actorProfile.name} quoted your post in: "${topicTitle}"`;
        } else if (actorProfile) {
          content = `${actorProfile.name} quoted your post.`;
        } else {
          content = `Someone quoted your post.`; // Fallback
        }
        break;
      case 'system':
        content = dbNotif.content_preview || dbNotif.details?.content_summary || "System notification";
        break;
      default:
        // For unknown types, use the content_preview or a generic message
        content = dbNotif.content_preview || dbNotif.details?.content_summary || `Notification: ${dbNotif.type}`;
    }

    // Construct link, ensuring topicSlugVal or dbNotif.topic_id is used
    // Use post_id from dbNotif (the ID of the *quoted* post, which is what we want to link to)
    const targetPostId = dbNotif.details?.quoted_post_id || dbNotif.post_id; 
    
    // If categorySlugVal is not set yet and we have topic_id, try to fetch it
    if (!categorySlugVal && dbNotif.topic_id) {
        const { data: topicCatDetails, error: topicCatError } = await supabase
            .from('forum_topics')
            .select('category:forum_categories(slug)')
            .eq('id', dbNotif.topic_id)
            .single();
        if (!topicCatError && topicCatDetails && topicCatDetails.category && typeof topicCatDetails.category === 'object' && 'slug' in topicCatDetails.category) {
            categorySlugVal = (topicCatDetails.category as { slug: string }).slug;
        }
    }


    if (categorySlugVal && topicSlugVal) {
      link = `/members/forum/${categorySlugVal}/${topicSlugVal}`;
      if (targetPostId) {
        // Link to the quoted post, not the new reply post
        link += `/${targetPostId}`; // Assuming URL structure for specific post
      }
    } else if (topicSlugVal) { // Fallback if category slug isn't available
      link = `/members/forum/topic/${topicSlugVal}`;
      if (targetPostId) {
        link += `/${targetPostId}`;
      }
    } else if (dbNotif.link_url) { // Use provided link_url from details if available
      link = dbNotif.link_url;
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
      post_id: dbNotif.post_id, // This is the ID of the post that *contains* the quote
      content_preview: dbNotif.content_preview,
      topic_title: topicTitle,
      topic_slug: topicSlugVal,
      category_slug: categorySlugVal,
      details: dbNotif.details,
    };
  }, []);

  return { mapDbNotificationToType };
};
