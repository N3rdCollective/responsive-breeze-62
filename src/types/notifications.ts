
export type NotificationType = 'reply' | 'mention' | 'like' | 'tag' | 'follow' | 'system' | 'new_post';

export interface NotificationUser {
  name: string;
  avatar?: string; // URL to avatar image
}

export interface Notification {
  id: string;
  type: NotificationType;
  read: boolean;
  user?: NotificationUser; // Optional if it's a system notification
  content: string;
  link?: string; // Optional link to navigate to (e.g., topic, post)
  timestamp: string; // ISO date string
}

