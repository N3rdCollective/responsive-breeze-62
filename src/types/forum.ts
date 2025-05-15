
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
    avatar_url?: string | null;
  };
  _count?: {
    posts: number;
  };
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
    avatar_url?: string | null;
  };
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
