
import { supabase } from '@/integrations/supabase/client';
import { ChatRoom, ChatMessage } from '@/types/chat';

export const fetchChatRooms = async (): Promise<ChatRoom[]> => {
  const { data, error } = await supabase
    .from('chat_rooms')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching chat rooms:', error);
    throw new Error('Failed to fetch chat rooms');
  }

  return data || [];
};

export const fetchChatMessages = async (roomId: string, limit = 50): Promise<ChatMessage[]> => {
  const { data, error } = await supabase
    .from('chat_messages')
    .select(`
      *,
      profiles!inner (
        id,
        username,
        display_name,
        profile_picture
      )
    `)
    .eq('room_id', roomId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching chat messages:', error);
    throw new Error('Failed to fetch chat messages');
  }

  // Transform the data to match our ChatMessage type
  const transformedData = (data || []).map(item => ({
    id: item.id,
    room_id: item.room_id,
    user_id: item.user_id,
    content: item.content,
    created_at: item.created_at,
    updated_at: item.updated_at,
    is_deleted: item.is_deleted,
    profile: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles
  }));

  return transformedData.reverse() as ChatMessage[];
};

export const sendChatMessage = async (roomId: string, content: string): Promise<ChatMessage> => {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      room_id: roomId,
      user_id: (await supabase.auth.getUser()).data.user?.id,
      content: content.trim()
    })
    .select(`
      *,
      profiles!inner (
        id,
        username,
        display_name,
        profile_picture
      )
    `)
    .single();

  if (error) {
    console.error('Error sending chat message:', error);
    throw new Error('Failed to send message');
  }

  // Transform the data to match our ChatMessage type
  const transformedData = {
    id: data.id,
    room_id: data.room_id,
    user_id: data.user_id,
    content: data.content,
    created_at: data.created_at,
    updated_at: data.updated_at,
    is_deleted: data.is_deleted,
    profile: Array.isArray(data.profiles) ? data.profiles[0] : data.profiles
  };

  return transformedData as ChatMessage;
};

export const deleteChatMessage = async (messageId: string): Promise<void> => {
  const { error } = await supabase
    .from('chat_messages')
    .update({ is_deleted: true })
    .eq('id', messageId);

  if (error) {
    console.error('Error deleting chat message:', error);
    throw new Error('Failed to delete message');
  }
};
