
import { useConversationsList } from './messaging/useConversationsList';
import { useConversationActions } from './messaging/useConversationActions';
import { useConversationSubscription } from './messaging/useConversationSubscription';

export const useConversations = () => {
  const {
    conversations,
    isLoading,
    isError,
    error,
    refetchConversations,
    totalUnreadCount
  } = useConversationsList();

  const {
    markConversationAsRead,
    startOrCreateConversation
  } = useConversationActions();

  useConversationSubscription();

  return {
    conversations,
    isLoading,
    isError,
    error,
    refetchConversations,
    startOrCreateConversation,
    markConversationAsRead,
    totalUnreadCount,
  };
};
