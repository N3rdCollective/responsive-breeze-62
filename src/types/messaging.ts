
import { UserProfile } from './profile'; // Assuming UserProfile is correctly defined

export interface DirectMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string; // Supabase typically uses 'timestamp with time zone' which becomes string
  is_deleted?: boolean;
  media_url?: string | null;
  profile?: Pick<UserProfile, 'id' | 'username' | 'display_name' | 'profile_picture'>; // Sender's profile
}

export interface Conversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  last_message_timestamp: string;
  // We'll determine the 'other participant' in the frontend
  otherParticipantProfile?: Pick<UserProfile, 'id' | 'username' | 'display_name' | 'profile_picture'>;
  lastMessage?: Pick<DirectMessage, 'content' | 'sender_id' | 'created_at'> & { sender_display_name?: string };
  unread_count?: number; // Optional: for future unread messages feature
}

// For fetching conversations, we'll join with profiles
export interface FetchedConversation extends Conversation {
  participant1: Pick<UserProfile, 'id' | 'username' | 'display_name' | 'profile_picture'>;
  participant2: Pick<UserProfile, 'id' | 'username' | 'display_name' | 'profile_picture'>;
  // last_message_content: string | null; // If fetching directly
  // last_message_sender_id: string | null; // If fetching directly
}
