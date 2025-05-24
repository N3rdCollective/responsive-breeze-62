
// Define shared types for user management

export interface User {
  id: string;
  username: string;
  display_name: string;
  email: string;
  profile_picture?: string;
  created_at: string;
  last_active: string;
  forum_post_count: number;
  timeline_post_count: number;
  pending_report_count: number;
  status: 'active' | 'suspended' | 'banned';
  role: 'user' | 'moderator' | 'admin';
}

export interface UserAction {
  id: string;
  user_id: string;
  action_type: 'suspend' | 'ban' | 'unban' | 'warn' | 'note';
  reason: string;
  moderator_id: string;
  created_at: string;
  expires_at?: string;
  moderator?: {
    username?: string;
    display_name?: string;
  };
}
