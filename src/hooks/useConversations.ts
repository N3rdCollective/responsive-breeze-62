
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query'; // Added useQueryClient
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Conversation, DirectMessage, FetchedConversation } from '@/types/messaging';
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
        timestamp, 
        profile:profiles!messages_sender_id_fkey (display_name, username)
      )
    `)
    .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
    .order('last_message_timestamp', { ascending: false, foreignTable: null })
    .order('timestamp', { foreignTable: 'messages', ascending: false }) // Order messages by timestamp
    .limit(1, { foreignTable: 'messages' });

  if (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }

  return (data as any[]).map((conv: any): Conversation => {
    const otherParticipantRaw = conv.participant1_id === userId ? conv.participant2 : conv.participant1;
    const lastMessageData = conv.messages && conv.messages.length > 0 ? conv.messages[0] : null;
    
    const otherParticipantProfile = otherParticipantRaw ? {
      id: otherParticipantRaw.id,
      username: otherParticipantRaw.username,
      display_name: otherParticipantRaw.display_name,
      avatar_url: otherParticipantRaw.profile_picture, // Map profile_picture to avatar_url
    } : undefined;

    return {
      id: conv.id,
      participant1_id: conv.participant1_id,
      participant2_id: conv.participant2_id,
      last_message_timestamp: conv.last_message_timestamp,
      otherParticipantProfile: otherParticipantProfile,
      lastMessage: lastMessageData ? {
        content: lastMessageData.content,
        sender_id: lastMessageData.sender_id,
        timestamp: lastMessageData.timestamp, // Use timestamp
        sender_display_name: lastMessageData.profile?.display_name || lastMessageData.profile?.username || (lastMessageData.sender_id === userId ? 'You' : otherParticipantProfile?.display_name || otherParticipantProfile?.username || 'User')
      } : undefined,
    };
  });
};

export const useConversations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient(); // Initialize queryClient

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

  const startOrCreateConversation = useCallback(async (targetUserId: string): Promise<string | null> => {
    if (!user?.id || !targetUserId || user.id === targetUserId) {
      console.error("Cannot start conversation: Invalid user IDs or trying to chat with self.");
      return null;
    }

    // 1. Check for existing conversation
    const { data: existingConv, error: existingConvError } = await supabase
      .from('conversations')
      .select('id')
      .or(
        `and(participant1_id.eq.${user.id},participant2_id.eq.${targetUserId}),` +
        `and(participant1_id.eq.${targetUserId},participant2_id.eq.${user.id})`
      )
      .maybeSingle();

    if (existingConvError) {
      console.error("Error checking for existing conversation:", existingConvError);
      throw existingConvError;
    }

    if (existingConv) {
      return existingConv.id;
    }

    // 2. Create new conversation if none exists
    const { data: newConv, error: newConvError } = await supabase
      .from('conversations')
      .insert({ 
        participant1_id: user.id, 
        participant2_id: targetUserId,
        last_message_timestamp: new Date().toISOString() // Initialize with current time
      })
      .select('id')
      .single();

    if (newConvError || !newConv) {
      console.error("Error creating new conversation:", newConvError);
      throw newConvError || new Error("Failed to create conversation and get ID.");
    }

    // Invalidate and refetch conversations list to include the new one
    await queryClient.invalidateQueries({ queryKey: ['conversations', user.id] });
    // Optionally await refetch();

    return newConv.id;
  }, [user, queryClient]);

  return {
    conversations: conversations || [],
    isLoading,
    isError,
    error,
    refetchConversations: refetch,
    startOrCreateConversation, // Expose the new function
  };
};
