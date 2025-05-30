
import { useConversationUnreadCount } from './messaging/useConversationUnreadCount';

export const useUserMessages = () => {
  return useConversationUnreadCount();
};
