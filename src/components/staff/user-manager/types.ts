
export interface User {
  id: string;
  username: string;
  display_name: string;
  email: string;
  profile_picture?: string;
  role: 'user' | 'moderator' | 'admin';
  status: 'active' | 'suspended' | 'banned';
  post_count: number;
  report_count: number;
  last_active: string;
  created_at: string;
}

// Define types for callback functions to ensure consistency
export type ActionDialogHandler = (action: 'suspend' | 'ban' | 'unban', user: User) => void;
export type MessageDialogHandler = (user: User) => void;
