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
      recipient_id,
      content,
      timestamp, 
      is_deleted,
      media_url,
      profile:profiles!messages_sender_id_fkey (id, username, display_name, profile_picture)
    `)
    .eq('conversation_id', conversationId)
    .order('timestamp', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    if (error instanceof Error) throw error;
    throw new Error(typeof error === 'string' ? error : 'Failed to fetch messages');
  }
  if (!Array.isArray(data)) {
    console.warn('fetchMessages: data is not an array', data);
    return [];
  }
  return data.map(msg => ({
    ...msg,
    profile: msg.profile ? {
      id: msg.profile.id,
      username: msg.profile.username,
      display_name: msg.profile.display_name,
      avatar_url: msg.profile.profile_picture // Map profile_picture to avatar_url
    } : null
  })) as DirectMessage[];
};

const sendMessageSupabase = async (newMessage: {
  conversation_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  media_url?: string | null;
}): Promise<DirectMessage> => {
  const funcStartTime = Date.now();
  console.log(`useMessages: sendMessageSupabase called at ${new Date(funcStartTime).toISOString()}`);

  let insertStartTime = Date.now();
  console.log(`useMessages: Attempting to insert message at ${new Date(insertStartTime).toISOString()}`);
  const { data, error } = await supabase
    .from('messages')
    .insert({ ...newMessage, timestamp: new Date().toISOString() })
    .select(`
      id,
      conversation_id,
      sender_id,
      recipient_id,
      content,
      timestamp,
      is_deleted,
      media_url,
      profile:profiles!messages_sender_id_fkey (id, username, display_name, profile_picture)
    `)
    .single();
  const insertEndTime = Date.now();
  console.log(`useMessages: Message insert operation took ${insertEndTime - insertStartTime}ms.`);

  if (error) {
    console.error('Error sending message (inserting):', error);
    toast({ title: "Error Sending Message", description: error.message, variant: "destructive" });
    if (error instanceof Error) throw error;
    throw new Error(typeof error === 'string' ? error : 'Failed to send message (insert)');
  }
   if (!data) {
    console.error('Error sending message: No data returned after insert.');
    toast({ title: "Error Sending Message", description: "Could not confirm message sent.", variant: "destructive" });
    throw new Error('No data returned after sending message');
  }
  
  const updateConvStartTime = Date.now();
  console.log(`useMessages: Attempting to update conversation timestamp at ${new Date(updateConvStartTime).toISOString()}`);
  const { error: convUpdateError } = await supabase
    .from('conversations')
    .update({ last_message_timestamp: new Date().toISOString() })
    .eq('id', newMessage.conversation_id);
  const updateConvEndTime = Date.now();
  console.log(`useMessages: Conversation update operation took ${updateConvEndTime - updateConvStartTime}ms.`);
    
  if (convUpdateError) {
    console.error('Error updating conversation timestamp:', convUpdateError);
    // Not throwing here as the message was sent, but logging and toasting error
    toast({ title: "Warning", description: "Message sent, but failed to update conversation metadata.", variant: "default" });
  }
  
  const funcEndTime = Date.now();
  console.log(`useMessages: sendMessageSupabase finished at ${new Date(funcEndTime).toISOString()}. Total time in function: ${funcEndTime - funcStartTime}ms`);
  return { 
    ...data, 
    profile: data.profile ? {
      id: data.profile.id,
      username: data.profile.username,
      display_name: data.profile.display_name,
      avatar_url: data.profile.profile_picture // Map profile_picture to avatar_url
    } : null 
  } as DirectMessage;
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

  const mutation = useMutation<DirectMessage, Error, { content: string; media_url?: string | null; otherParticipantId: string }>({
    mutationFn: async (newMessageData) => {
      if (!conversationId || !user?.id) {
        throw new Error('User or conversation ID is missing.');
      }
      if (!newMessageData.otherParticipantId) {
        toast({ title: "Error Sending Message", description: "Recipient information is missing.", variant: "destructive" });
        throw new Error('Recipient ID (otherParticipantId) is missing.');
      }
      // Renamed the original sendMessage to sendMessageSupabase to avoid confusion with the exported sendMessage from the hook
      return sendMessageSupabase({
        conversation_id: conversationId,
        sender_id: user.id,
        recipient_id: newMessageData.otherParticipantId,
        content: newMessageData.content,
        media_url: newMessageData.media_url,
      });
    },
    onSuccess: (newMessage) => {
      console.log("useMessages: mutation.onSuccess triggered.");
      queryClient.setQueryData<DirectMessage[]>(queryKey, (oldMessages = []) => {
        const fullNewMessage = {
          ...newMessage,
        };
        return [...oldMessages, fullNewMessage];
      });
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
    },
    onError: (err) => {
      console.error("useMessages: mutation.onError - Failed to send message:", err);
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
          console.log(`useMessages: Received real-time message payload for conversation ${conversationId}:`, payload);
          const rawNewMessage = payload.new as any; 
          
          const newMessage: DirectMessage = {
            ...rawNewMessage,
            profile: rawNewMessage.profile ? {
              id: rawNewMessage.profile.id,
              username: rawNewMessage.profile.username,
              display_name: rawNewMessage.profile.display_name,
              avatar_url: rawNewMessage.profile.profile_picture 
            } : null,
            id: rawNewMessage.id,
            conversation_id: rawNewMessage.conversation_id,
            sender_id: rawNewMessage.sender_id,
            recipient_id: rawNewMessage.recipient_id,
            content: rawNewMessage.content,
            timestamp: rawNewMessage.timestamp,
            is_deleted: rawNewMessage.is_deleted || false,
            media_url: rawNewMessage.media_url || null,
          };

          if (newMessage.sender_id !== user.id) {
             queryClient.setQueryData<DirectMessage[]>(queryKey, (oldMessages = []) => {
                const existingMessage = oldMessages.find(msg => msg.id === newMessage.id);
                if (!existingMessage) {
                    console.log(`useMessages: Adding new real-time message from other user to cache for conversation ${conversationId}.`);
                    return [...oldMessages, newMessage];
                }
                console.log(`useMessages: Real-time message from other user already in cache for conversation ${conversationId}.`);
                return oldMessages;
             });
          } else {
            console.log(`useMessages: Real-time message is from current user, already handled by optimistic update for conversation ${conversationId}.`);
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to conversation: ${conversationId}`);
        }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            console.error(`Subscription error for conversation ${conversationId}: ${status}`, err);
            toast({ title: "Realtime Connection Error", description: `Could not connect to messaging service (${status}). Please refresh.`, variant: "destructive" });
        }
      });

    return () => {
      console.log(`useMessages: Unsubscribing from conversation ${conversationId}`);
      supabase.removeChannel(channel);
    };
  }, [conversationId, user?.id, queryClient, queryKey]);

  return {
    messages: messages || [],
    isLoading,
    isError,
    error,
    sendMessage: mutation.mutate, // This is what ChatView calls
    isSending: mutation.isPending,
  };
};
