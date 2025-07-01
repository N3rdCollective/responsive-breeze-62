
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
      id,
      room_id,
      user_id,
      content,
      created_at,
      updated_at,
      is_deleted
    `)
    .eq('room_id', roomId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching chat messages:', error);
    throw new Error('Failed to fetch chat messages');
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Get unique user IDs
  const userIds = [...new Set(data.map(msg => msg.user_id))];
  
  // Fetch profiles for these users
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, username, display_name, profile_picture')
    .in('id', userIds);

  if (profileError) {
    console.error('Error fetching profiles:', profileError);
    // Continue without profiles rather than failing completely
  }

  // Create a map of user_id to profile
  const profileMap = new Map();
  if (profiles) {
    profiles.forEach(profile => {
      profileMap.set(profile.id, profile);
    });
  }

  // Transform the data to match our ChatMessage type
  const transformedData = data.map(item => ({
    id: item.id,
    room_id: item.room_id,
    user_id: item.user_id,
    content: item.content,
    created_at: item.created_at,
    updated_at: item.updated_at,
    is_deleted: item.is_deleted,
    profile: profileMap.get(item.user_id) || null
  }));

  return transformedData.reverse() as ChatMessage[];
};

export const sendChatMessage = async (roomId: string, content: string): Promise<ChatMessage> => {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      room_id: roomId,
      user_id: userId,
      content: content.trim()
    })
    .select('id, room_id, user_id, content, created_at, updated_at, is_deleted')
    .single();

  if (error) {
    console.error('Error sending chat message:', error);
    throw new Error('Failed to send message');
  }

  // Fetch the user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, display_name, profile_picture')
    .eq('id', userId)
    .single();

  // Transform the data to match our ChatMessage type
  const transformedData = {
    id: data.id,
    room_id: data.room_id,
    user_id: data.user_id,
    content: data.content,
    created_at: data.created_at,
    updated_at: data.updated_at,
    is_deleted: data.is_deleted,
    profile: profile || null
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
