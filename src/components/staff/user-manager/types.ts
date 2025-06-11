
// User interface aligned with database schema
export interface User {
  id: string;
  email: string;
  username: string;
  display_name: string;
  status: 'active' | 'suspended' | 'banned';
  role: 'user' | 'moderator' | 'admin';
  created_at: string;
  last_active: string | null;
  profile_picture: string | null;
  forum_post_count: number;
  timeline_post_count: number;
  pending_report_count: number;
}

// Dialog handler types
export type ActionDialogHandler = (action: 'suspend' | 'ban' | 'unban', user: User) => void;
export type MessageDialogHandler = (user: User) => void;
