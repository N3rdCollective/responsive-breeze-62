
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export const useConversationSubscription = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user?.id) return;

    const newMessagesChannel = supabase
      .channel(`user-new-messages-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('useConversationSubscription: New message received for user, invalidating conversations list:', payload);
          queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log(`useConversationSubscription: Subscribed to new messages channel for user ${user.id}`);
        } else if (err) {
          console.error(`useConversationSubscription: Subscription error on new messages channel for user ${user.id}`, err);
          toast({
            title: "Realtime Issue",
            description: "Could not reliably update message counts. Please refresh if counts seem off.",
            variant: "default"
          });
        }
      });

    return () => {
      console.log(`useConversationSubscription: Unsubscribing from new messages channel for user ${user.id}`);
      supabase.removeChannel(newMessagesChannel);
    };
  }, [user?.id, queryClient]);
};
