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
  created_at: string; // Topic creation date
  updated_at: string;
  last_post_at: string;
  last_post_user_id: string | null;
  profile?: {
    username?: string | null;
    display_name?: string | null;
    profile_picture?: string | null;
    created_at?: string | null; // User's join date
    forum_post_count?: number | null;
    forum_signature?: string | null;
  };
  _count?: {
    posts: number;
  };
  category?: {
    name: string;
    slug: string;
  };
  poll?: ForumPoll | null; // Add poll to ForumTopic
}

export interface ForumPollVote {
  id: string;
  poll_id: string;
  option_id: string;
  user_id: string;
  created_at: string;
}

export interface ForumPollOption {
  id: string;
  poll_id: string;
  option_text: string;
  created_at: string;
  vote_count: number;
  // Optionally, to indicate if the current user has voted for this option in a multi-choice scenario (not used for single choice display)
  // currentUserVoted?: boolean; 
}

export interface ForumPoll {
  id: string;
  topic_id: string;
  user_id: string;
  question: string;
  created_at: string;
  updated_at: string;
  ends_at?: string | null;
  allow_multiple_choices: boolean;
  options: ForumPollOption[];
  // To store the option_id the current user voted for, if any
  currentUserVote?: string | null; // option_id
  totalVotes?: number; // Calculated dynamically or stored
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
  created_at: string; // Post creation date
  updated_at: string;
  profile?: {
    username?: string | null;
    display_name?: string | null;
    profile_picture?: string | null;
    created_at?: string | null; // User's join date
    forum_post_count?: number | null;
    forum_signature?: string | null;
  };
  forum_post_reactions?: ForumPostReaction[];
}

export interface ForumPostEditHistoryEntry {
  id: string;
  post_id: string;
  user_id: string;
  old_content: string;
  edited_at: string;
  reason?: string | null;
  profile?: { // For displaying editor's info
    username?: string | null;
    display_name?: string | null;
    profile_picture?: string | null;
  };
}

export interface CreatePollInput {
  question: string;
  options: string[]; // Array of option texts
  ends_at?: string | null;
}

export interface CreateTopicInput {
  category_id: string;
  title: string;
  content: string;
  poll?: CreatePollInput | null; // Add poll to CreateTopicInput
}

export interface CreatePostInput {
  topic_id: string;
  content: string;
}
