export interface NotificationUser {
  id: string;
  name: string;
  avatar?: string | null;
}

// Added 'mention' for broader use if needed by NotificationIcon,
// but 'mention_reply' and 'mention_post' are primary for forum.
// Also added 'tag', 'follow', 'new_post' back for compatibility with NotificationIcon,
// though they might be phased out or mapped differently later.
// Added 'quote' type
// Added 'like_post', 'like_reply', 'new_topic_in_category'
export type NotificationType =
  | 'reply'
  | 'like'
  | 'like_post' // Added
  | 'like_reply' // Added
  | 'system'
  | 'mention_reply'
  | 'mention_post'
  | 'mention' // Generic mention for other contexts if any
  | 'tag'     // For NotificationIcon compatibility
  | 'follow'  // For NotificationIcon compatibility
  | 'new_post' // For NotificationIcon compatibility (generic new post)
  | 'new_topic_in_category' // Added (specific to forum categories)
  | 'quote'; // New type for post quotes


export interface Notification {
  id: string;
  type: NotificationType;
  read: boolean;
  actor?: NotificationUser; // User who performed theaction
  content: string; // The main notification text
  link?: string; // Link to navigate to
  timestamp: string; // ISO string
  topicId?: string; // Renamed from topic_id for consistency
  postId?: string;  // Renamed from post_id for consistency
  // content_preview?: string | null; // Raw preview from DB if available (already on DbNotification)
  // For mapper convenience, if enriched during mapping
  // topic_title?: string;
  // topic_slug?: string | null;
  // category_slug?: string | null;
  details?: any; // Keep details if needed by UI, matches DbNotification.details
}

export interface DbNotification {
  id: string;
  recipient_id: string;
  actor_id: string | null;
  type: string; // Raw type from DB, will be cast to NotificationType in mapper
  topic_id: string | null;
  post_id: string | null;
  content_preview: string | null;
  read: boolean;
  details: any | null; // JSONB from DB
  created_at: string;
  updated_at: string;
  actor_profiles?: { // This comes from the join: profiles!forum_notifications_actor_id_fkey
    id: string; // user_id of the actor
    display_name: string | null;
    username: string | null;
    profile_picture: string | null;
  } | null;
}

export interface ForumCategory {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ForumTopic {
  id: string;
  category_id: string;
  user_id: string;
  title: string;
  slug: string;
  is_sticky: boolean;
  is_locked: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
  last_post_at: string;
  last_post_user_id: string | null;
  profile?: {
    username?: string | null;
    display_name?: string | null;
    profile_picture?: string | null; // Changed from avatar_url
  };
  _count?: {
    posts: number;
  };
  category?: {
    name: string;
    slug: string;
  };
}

export interface ForumPostReaction {
  id: string;
  post_id: string;
  user_id: string;
  reaction_type: 'like'; // For now, only 'like'
  created_at: string;
}

export interface ForumPost {
  id: string;
  topic_id: string;
  user_id: string;
  content: string;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  profile?: {
    username?: string | null;
    display_name?: string | null;
    profile_picture?: string | null;
  };
  forum_post_reactions?: ForumPostReaction[]; 
}

export interface CreateTopicInput {
  category_id: string;
  title: string;
  content: string;
}

export interface CreatePostInput {
  topic_id: string;
  content: string;
}
