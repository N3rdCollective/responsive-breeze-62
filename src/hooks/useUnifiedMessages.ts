import { useConversationUnreadCount } from './messaging/useConversationUnreadCount';
import { useAdminMessages } from './messaging/useAdminMessages';

export const useUnifiedMessages = () => {
  const { unreadCount: conversationUnreadCount } = useConversationUnreadCount();
  const { adminUnreadCount, loading } = useAdminMessages();

  const totalUnreadCount = conversationUnreadCount + adminUnreadCount;

  return {
    conversationUnreadCount,
    adminUnreadCount,
    totalUnreadCount,
    loading,
    refreshCounts: () => {
      // Individual hooks handle their own refresh logic
    }
  };
};
