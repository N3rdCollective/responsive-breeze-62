
import { Tables } from "@/integrations/supabase/types";

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  timestamp: string;
  media_url?: string | null;
  status: 'sent' | 'delivered' | 'seen';
}

export interface Conversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  last_message_timestamp: string;
  participant: {
    id: string;
    email: string;
    display_name?: string | null;
    profile_picture?: string | null;
  };
  last_message?: Partial<Message> | null;
}

export interface StaffMember {
  id: string;
  email: string;
  display_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  profile_picture?: string | null;
}
