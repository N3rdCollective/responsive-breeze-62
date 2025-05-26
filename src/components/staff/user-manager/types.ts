export interface User {
  id: string;
  username: string;
  display_name: string;
  email: string;
  profile_picture?: string;
  created_at: string; // User registration date
  last_active: string;
  forum_post_count: number;
  forum_signature: string | null; // Added forum signature
  timeline_post_count: number;
  pending_report_count: number;
  status: 'active' | 'suspended' | 'banned';
  role: 'user' | 'moderator' | 'admin';
}

// Define types for callback functions to ensure consistency
export type ActionDialogHandler = (action: 'suspend' | 'ban' | 'unban' | 'warn', user: User) => void; // Added 'warn'
export type MessageDialogHandler = (user: User) => void;
