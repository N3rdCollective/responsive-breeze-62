
import { useAuth } from '@/hooks/useAuth';
import { useFetchMessagesQuery } from './messaging/queries/useFetchMessagesQuery';
import { useSendMessageMutation } from './messaging/mutations/useSendMessageMutation';
import { useMessageSubscription } from './messaging/subscriptions/useMessageSubscription';

export const useMessages = (conversationId: string | null) => {
  const { user } = useAuth();

  const {
    data: messages,
    isLoading,
    isError,
    error,
  } = useFetchMessagesQuery({ conversationId, user });

  const {
    mutate: sendMessage,
    isPending: isSending,
  } = useSendMessageMutation({ conversationId, currentUser: user });

  useMessageSubscription({ conversationId, currentUser: user });

  return {
    messages: messages || [],
    isLoading,
    isError,
    error,
    sendMessage,
    isSending,
  };
};

