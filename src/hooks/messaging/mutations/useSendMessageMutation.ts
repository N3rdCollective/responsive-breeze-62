
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendMessageToSupabase } from '@/services/messageService';
import { DirectMessage } from '@/types/messaging';
import { toast } from '@/hooks/use-toast';
import { User } from '@supabase/supabase-js';

interface UseSendMessageMutationProps {
  conversationId: string | null;
  currentUser: User | null;
}

export const useSendMessageMutation = ({ conversationId, currentUser }: UseSendMessageMutationProps) => {
  const queryClient = useQueryClient();
  const messagesQueryKey = ['messages', conversationId];

  return useMutation<DirectMessage, Error, { content: string; media_file?: File | null; otherParticipantId: string }>({
    mutationFn: async (newMessageData) => {
      if (!conversationId || !currentUser?.id) {
        throw new Error('User or conversation ID is missing for sending message.');
      }
      if (!newMessageData.otherParticipantId) {
        toast({ title: "Error Sending Message", description: "Recipient information is missing.", variant: "destructive" });
        throw new Error('Recipient ID (otherParticipantId) is missing.');
      }
      return sendMessageToSupabase({
        conversation_id: conversationId,
        sender_id: currentUser.id,
        recipient_id: newMessageData.otherParticipantId,
        content: newMessageData.content,
        media_file: newMessageData.media_file,
      });
    },
    onSuccess: (newMessage) => {
      console.log("useSendMessageMutation: mutation.onSuccess triggered.");
      queryClient.setQueryData<DirectMessage[]>(messagesQueryKey, (oldMessages = []) => {
        // Ensure fullNewMessage structure matches DirectMessage, especially profile
        const fullNewMessage: DirectMessage = {
          ...newMessage,
          // Profile data should already be correctly structured by sendMessageToSupabase
        };
        return [...oldMessages, fullNewMessage];
      });
      // Invalidate conversations list to update last message preview
      queryClient.invalidateQueries({ queryKey: ['conversations', currentUser?.id] }); 
    },
    onError: (err) => {
      console.error("useSendMessageMutation: mutation.onError - Failed to send message:", err);
      // Toast is handled in sendMessageToSupabase for specific errors,
      // but a general one could be here if needed.
    }
  });
};

