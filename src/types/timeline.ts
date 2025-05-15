
export interface TimelinePost {
  id: string;
  user_id: string;
  content: string;
  media_url?: string | null;
  created_at: string;
  updated_at: string;
  profile?: {
    username?: string | null;
    display_name?: string | null;
    avatar_url?: string | null;
  }
}

export interface CreatePostInput {
  content: string;
  media_url?: string | null;
}
