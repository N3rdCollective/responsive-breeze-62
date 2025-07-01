
export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  profile?: {
    id: string;
    username?: string;
    display_name?: string;
    profile_picture?: string;
  };
}

export interface ChatPresence {
  user_id: string;
  username: string;
  display_name?: string;
  online_at: string;
}
