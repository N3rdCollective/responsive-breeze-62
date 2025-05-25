import { UserProfile } from './profile'; // Assuming UserProfile is correctly defined

export interface DirectMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  recipient_id: string; // Added recipient_id
  content: string;
  timestamp: string; // Changed from created_at
  is_deleted?: boolean;
  media_url?: string | null;
  profile?: Pick<UserProfile, 'id' | 'username' | 'display_name' | 'avatar_url'> | null;
}

export interface Conversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  last_message_timestamp: string;
  // We'll determine the 'other participant' in the frontend
  otherParticipantProfile?: Pick<UserProfile, 'id' | 'username' | 'display_name' | 'avatar_url'>; // Changed profile_picture to avatar_url
  lastMessage?: Pick<DirectMessage, 'content' | 'sender_id' | 'timestamp'> & { sender_display_name?: string };
  unread_count?: number; // Optional: for future unread messages feature
}

// For fetching conversations, we'll join with profiles
export interface FetchedConversation extends Conversation {
  participant1: Pick<UserProfile, 'id' | 'username' | 'display_name' | 'avatar_url'>; // Changed profile_picture to avatar_url
  participant2: Pick<UserProfile, 'id' | 'username' | 'display_name' | 'avatar_url'>; // Changed profile_picture to avatar_url
  // last_message_content: string | null; // If fetching directly
  // last_message_sender_id: string | null; // If fetching directly
}
