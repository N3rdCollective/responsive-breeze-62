
import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export const useConversationActions = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

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
      queryClient.setQueryData(['conversations', user?.id], (oldConversations: any[]) => {
        return oldConversations?.map(conv => 
          conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
        ) || [];
      });
    },
    onError: (err) => {
      console.error("Failed to mark conversation as read (mutation.onError):", err);
    }
  });

  const startOrCreateConversation = useCallback(async (targetUserId: string): Promise<string | null> => {
    if (!user?.id || !targetUserId || user.id === targetUserId) {
      console.error("Cannot start conversation: Invalid user IDs or trying to chat with self.");
      return null;
    }

    // Check for existing conversation
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

    // Create new conversation
    const { data: newConv, error: newConvError } = await supabase
      .from('conversations')
      .insert({ 
        participant1_id: user.id, 
        participant2_id: targetUserId,
        last_message_timestamp: new Date().toISOString()
      })
      .select('id')
      .single();

    if (newConvError || !newConv) {
      console.error("Error creating new conversation:", newConvError);
      throw newConvError || new Error("Failed to create conversation and get ID.");
    }

    await queryClient.invalidateQueries({ queryKey: ['conversations', user.id] });
    return newConv.id;
  }, [user, queryClient]);

  return {
    markConversationAsRead: markAsReadMutation.mutate,
    startOrCreateConversation,
  };
};
