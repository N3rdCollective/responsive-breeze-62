
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DirectMessage } from '@/types/messaging';
import { toast } from '@/hooks/use-toast';
import { User } from '@supabase/supabase-js';

interface UseMessageSubscriptionProps {
  conversationId: string | null;
  currentUser: User | null;
}

export const useMessageSubscription = ({ conversationId, currentUser }: UseMessageSubscriptionProps) => {
  const queryClient = useQueryClient();
  const messagesQueryKey = ['messages', conversationId];

  useEffect(() => {
    if (!conversationId || !currentUser?.id) return;

    const channel = supabase
      .channel(`conversation-${conversationId}-messages`) // Unique channel name for messages specifically
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          console.log(`useMessageSubscription: Received real-time message payload for conv ${conversationId}:`, payload);
          const rawNewMessage = payload.new as any;
          
          // Attempt to fetch profile data if not included or if sender is not current user
          // For simplicity, we'll rely on the sender client to include profile in its optimistic update
          // Or we fetch it. Here, we assume payload.new might not have profile expanded like query.
          // A better approach would be a DB function that always returns messages with profiles.
          // For now, map what we get.
          const newMessage: DirectMessage = {
            ...rawNewMessage,
            id: rawNewMessage.id, // ensure all essential fields from DirectMessage are present
            conversation_id: rawNewMessage.conversation_id,
            sender_id: rawNewMessage.sender_id,
            recipient_id: rawNewMessage.recipient_id,
            content: rawNewMessage.content,
            timestamp: rawNewMessage.timestamp,
            is_deleted: rawNewMessage.is_deleted || false,
            media_url: rawNewMessage.media_url || null,
            // Profile might be missing or partial here for incoming messages if not expanded by sender's insert.
            // The fetchMessages query does expand it.
            // If profile is critical for immediate display of incoming messages, it should be fetched or guaranteed in payload.
            // For now, if it's missing, MessageItem might show default.
            profile: rawNewMessage.profile ? { // Assuming profile structure comes through, if not, need to adapt
                id: rawNewMessage.profile.id,
                username: rawNewMessage.profile.username,
                display_name: rawNewMessage.profile.display_name,
                avatar_url: rawNewMessage.profile.profile_picture,
            } : null,
          };

          if (newMessage.sender_id !== currentUser.id) {
             queryClient.setQueryData<DirectMessage[]>(messagesQueryKey, (oldMessages = []) => {
                const existingMessage = oldMessages.find(msg => msg.id === newMessage.id);
                if (!existingMessage) {
                    console.log(`useMessageSubscription: Adding new real-time message from other user to cache for conv ${conversationId}.`);
                    return [...oldMessages, newMessage];
                }
                console.log(`useMessageSubscription: Real-time message from other user already in cache for conv ${conversationId}.`);
                return oldMessages;
             });
          } else {
            // Message from current user, likely handled by optimistic update from useSendMessageMutation
            console.log(`useMessageSubscription: Real-time message is from current user, likely handled by optimistic update for conv ${conversationId}.`);
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log(`useMessageSubscription: SUBSCRIBED to messages on conversation-${conversationId}`);
        } else if (err) {
            console.error(`useMessageSubscription: Subscription error for conversation-${conversationId}: ${status}`, err);
            toast({ title: "Realtime Connection Error", description: `Messaging service error (${status}). Please refresh.`, variant: "destructive" });
        } else {
             console.log(`useMessageSubscription: Subscription status for conversation-${conversationId}: ${status}`);
        }
      });

    return () => {
      console.log(`useMessageSubscription: Unsubscribing from messages on conversation ${conversationId}`);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [conversationId, currentUser?.id, queryClient, messagesQueryKey]);
};

