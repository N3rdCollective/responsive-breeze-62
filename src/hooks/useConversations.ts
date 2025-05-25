
import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Conversation, FetchedConversation } from '@/types/messaging';
import { UserProfile } from '@/types/profile';

const fetchConversationsForUser = async (userId: string): Promise<Conversation[]> => {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      id,
      participant1_id,
      participant2_id,
      last_message_timestamp,
      participant1:profiles!conversations_participant1_id_fkey (id, username, display_name, profile_picture),
      participant2:profiles!conversations_participant2_id_fkey (id, username, display_name, profile_picture),
      messages (
        content,
        sender_id,
        created_at,
        profile:profiles!messages_sender_id_fkey (display_name, username)
      )
    `)
    .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
    .order('last_message_timestamp', { ascending: false, foreignTable: null }) // Order conversations by their own last_message_timestamp
    .order('created_at', { foreignTable: 'messages', ascending: false }) // For messages, get the latest one
    .limit(1, { foreignTable: 'messages' }); // Limit to the latest message for preview

  if (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }

  return (data as any[]).map((conv: any): Conversation => {
    const otherParticipant = conv.participant1_id === userId ? conv.participant2 : conv.participant1;
    const lastMessageData = conv.messages && conv.messages.length > 0 ? conv.messages[0] : null;
    
    return {
      id: conv.id,
      participant1_id: conv.participant1_id,
      participant2_id: conv.participant2_id,
      last_message_timestamp: conv.last_message_timestamp,
      otherParticipantProfile: otherParticipant ? {
        id: otherParticipant.id,
        username: otherParticipant.username,
        display_name: otherParticipant.display_name,
        profile_picture: otherParticipant.profile_picture,
      } : undefined,
      lastMessage: lastMessageData ? {
        content: lastMessageData.content,
        sender_id: lastMessageData.sender_id,
        created_at: lastMessageData.created_at,
        sender_display_name: lastMessageData.profile?.display_name || lastMessageData.profile?.username || (lastMessageData.sender_id === userId ? 'You' : otherParticipant?.display_name || otherParticipant?.username || 'User')
      } : undefined,
    };
  });
};

export const useConversations = () => {
  const { user } = useAuth();

  const {
    data: conversations,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Conversation[], Error>({
    queryKey: ['conversations', user?.id],
    queryFn: () => {
      if (!user?.id) return Promise.resolve([]);
      return fetchConversationsForUser(user.id);
    },
    enabled: !!user?.id,
  });

  return {
    conversations: conversations || [],
    isLoading,
    isError,
    error,
    refetchConversations: refetch,
  };
};
