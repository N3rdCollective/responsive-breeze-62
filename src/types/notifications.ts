
export type NotificationType = 'reply' | 'mention' | 'like' | 'tag' | 'follow' | 'system' | 'new_post';

export interface NotificationUser {
  id: string; // User ID of the actor
  name: string;
  avatar?: string; // URL to avatar image
}

export interface Notification {
  id: string; // Notification ID
  type: NotificationType;
  read: boolean;
  actor?: NotificationUser; // The user who performed the action (renamed from 'user' for clarity)
  content: string; // The main textual content of the notification message
  link?: string; // Optional link to navigate to (e.g., topic, post)
  timestamp: string; // ISO date string for when the notification was created

  // Forum-specific fields, mirroring forum_notifications table
  topic_id?: string;
  post_id?: string; // The specific post that was replied to or liked
  content_preview?: string | null; // e.g., snippet of a reply
  
  // For constructing messages/links if needed
  topic_title?: string; 
  topic_slug?: string;
  category_slug?: string;
}
