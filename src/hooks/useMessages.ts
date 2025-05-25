import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DirectMessage } from '@/types/messaging';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

const fetchMessages = async (conversationId: string): Promise<DirectMessage[]> => {
  if (!conversationId) return [];

  const { data, error } = await supabase
    .from('messages')
    .select(`
      id,
      conversation_id,
      sender_id,
      content,
      created_at,
      is_deleted,
      media_url,
      profile:profiles!messages_sender_id_fkey (id, username, display_name, avatar_url)
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
  // Ensure profiles are correctly attached
  return data.map(msg => ({
    ...msg,
    profile: msg.profile || undefined // Ensure profile is explicitly undefined if null
  })) as DirectMessage[];
};

const sendMessage = async (newMessage: {
  conversation_id: string;
  sender_id: string;
  content: string;
  media_url?: string | null;
}): Promise<DirectMessage> => {
  const { data, error } = await supabase
    .from('messages')
    .insert(newMessage)
    .select(`
      id,
      conversation_id,
      sender_id,
      content,
      created_at,
      is_deleted,
      media_url,
      profile:profiles!messages_sender_id_fkey (id, username, display_name, avatar_url)
    `)
    .single();

  if (error) {
    console.error('Error sending message:', error);
    toast({ title: "Error Sending Message", description: error.message, variant: "destructive" });
    throw error;
  }
  // Update last_message_timestamp for the conversation
  await supabase
    .from('conversations')
    .update({ last_message_timestamp: new Date().toISOString() })
    .eq('id', newMessage.conversation_id);
    
  return { ...data, profile: data.profile || undefined } as DirectMessage;
};

export const useMessages = (conversationId: string | null) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const queryKey = ['messages', conversationId];

  const {
    data: messages,
    isLoading,
    isError,
    error,
  } = useQuery<DirectMessage[], Error>({
    queryKey,
    queryFn: () => {
      if (!conversationId || !user?.id) return Promise.resolve([]);
      return fetchMessages(conversationId);
    },
    enabled: !!conversationId && !!user?.id,
  });

  const mutation = useMutation<DirectMessage, Error, { content: string; media_url?: string | null }>({
    mutationFn: async (newMessageData) => {
      if (!conversationId || !user?.id) {
        throw new Error('User or conversation ID is missing.');
      }
      return sendMessage({
        conversation_id: conversationId,
        sender_id: user.id,
        content: newMessageData.content,
        media_url: newMessageData.media_url,
      });
    },
    onSuccess: (newMessage) => {
      // Optimistically update the messages list
      queryClient.setQueryData<DirectMessage[]>(queryKey, (oldMessages = []) => {
        const fullNewMessage = {
          ...newMessage,
        };
        return [...oldMessages, fullNewMessage];
      });
      // Invalidate conversations query to update last message preview in ConversationList
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
    },
    onError: (err) => {
      console.error("Failed to send message:", err);
      // Toast is handled in sendMessage function for RLS errors etc.
    }
  });

  useEffect(() => {
    if (!conversationId || !user?.id) return;

    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as DirectMessage;
          if (newMessage.sender_id !== user.id) {
             queryClient.setQueryData<DirectMessage[]>(queryKey, (oldMessages = []) => {
                const existingMessage = oldMessages.find(msg => msg.id === newMessage.id);
                if (!existingMessage) {
                    return [...oldMessages, { ...newMessage, profile: newMessage.profile || undefined }];
                }
                return oldMessages;
             });
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to conversation: ${conversationId}`);
        }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            console.error(`Subscription error for conversation ${conversationId}: ${status}`, err);
            toast({ title: "Realtime Connection Error", description: "Could not connect to messaging service. Please refresh.", variant: "destructive" });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user?.id, queryClient, queryKey]);

  return {
    messages: messages || [],
    isLoading,
    isError,
    error,
    sendMessage: mutation.mutate,
    isSending: mutation.isPending,
  };
};
