import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'; // Added useMutation
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Conversation } from '@/types/messaging'; // UserProfile is not directly used here anymore for mapping
import { toast } from '@/hooks/use-toast'; // Import toast

// This function now calls the RPC 'get_conversations_with_unread_status'
const fetchConversationsWithUnreadStatus = async (userId: string): Promise<Conversation[]> => {
  const { data, error } = await supabase.rpc('get_conversations_with_unread_status', { p_user_id: userId });

  if (error) {
    console.error('Error fetching conversations with unread status:', error);
    throw error;
  }

  // The RPC returns JSON, which might be a string if '[]'. Parse it.
  // And ensure it's an array of objects structured like Conversation.
  let parsedData: any[];
  if (typeof data === 'string') {
    try {
      parsedData = JSON.parse(data);
    } catch (e) {
      console.error("Failed to parse conversations JSON string:", e, data);
      return [];
    }
  } else {
    parsedData = data as any[];
  }
  
  if (!Array.isArray(parsedData)) {
    console.warn('fetchConversationsWithUnreadStatus: parsedData is not an array', parsedData);
    return [];
  }

  // Map the data to ensure it matches the Conversation type, especially for potentially null/undefined nested objects
  return parsedData.map((conv: any): Conversation => ({
    id: conv.id,
    participant1_id: conv.participant1_id,
    participant2_id: conv.participant2_id,
    last_message_timestamp: conv.last_message_timestamp,
    otherParticipantProfile: conv.otherParticipantProfile || undefined,
    lastMessage: conv.lastMessage || undefined,
    unread_count: conv.unread_count || 0,
  }));
};

export const useConversations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

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
      return fetchConversationsWithUnreadStatus(user.id); // Use the new RPC-based fetcher
    },
    enabled: !!user?.id,
  });

  const totalUnreadCount = conversations?.reduce((sum, conv) => sum + (conv.unread_count || 0), 0) || 0;

  const markAsReadMutation = useMutation<void, Error, string>({
    mutationFn: async (conversationId: string) => {
      if (!user?.id || !conversationId) {
        throw new Error("User ID or Conversation ID is missing.");
      }
      const { error: upsertError } = await supabase
        .from('user_conversation_read_status')
        .upsert({
          user_id: user.id,
          conversation_id: conversationId,
          last_read_timestamp: new Date().toISOString(),
        }, { onConflict: 'user_id,conversation_id' });

      if (upsertError) {
        console.error('Error marking conversation as read:', upsertError);
        toast({ title: "Error", description: "Could not mark conversation as read.", variant: "destructive" });
        throw upsertError;
      }
    },
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
      // Optimistically update the specific conversation's unread count to 0
      queryClient.setQueryData<Conversation[]>(['conversations', user?.id], (oldConversations) => {
        return oldConversations?.map(conv => 
          conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
        ) || [];
      });
    },
    onError: (err) => {
        console.error("Failed to mark conversation as read (mutation.onError):", err);
        // Toast is handled in mutationFn for specific supabase error
    }
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
    startOrCreateConversation,
    markConversationAsRead: markAsReadMutation.mutate,
    totalUnreadCount, // Expose totalUnreadCount
  };
};
