
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Conversation } from '@/types/messaging';

const fetchConversationsWithUnreadStatus = async (userId: string): Promise<Conversation[]> => {
  const { data, error } = await supabase.rpc('get_conversations_with_unread_status', { p_user_id: userId });

  if (error) {
    console.error('Error fetching conversations with unread status:', error);
    throw error;
  }

  let parsedData: any[];
  if (typeof data === 'string') {
    try {
      parsedData = JSON.parse(data);
    } catch (e) {
      console.error("Failed to parse conversations JSON string:", e, data);
      return [];
    }
  } else {
    parsedData = data as any[];
  }
  
  if (!Array.isArray(parsedData)) {
    console.warn('fetchConversationsWithUnreadStatus: parsedData is not an array', parsedData);
    return [];
  }

  return parsedData.map((conv: any): Conversation => ({
    id: conv.id,
    participant1_id: conv.participant1_id,
    participant2_id: conv.participant2_id,
    last_message_timestamp: conv.last_message_timestamp,
    otherParticipantProfile: conv.otherParticipantProfile || undefined,
    lastMessage: conv.lastMessage || undefined,
    unread_count: conv.unread_count || 0,
  }));
};

export const useConversationsList = () => {
  const { user } = useAuth();

  const {
    data: conversations,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Conversation[], Error>({
    queryKey: ['conversations', user?.id],
    queryFn: () => {
      if (!user?.id) return Promise.resolve([]);
      return fetchConversationsWithUnreadStatus(user.id); 
    },
    enabled: !!user?.id,
  });

  const totalUnreadCount = conversations?.reduce((sum, conv) => sum + (conv.unread_count || 0), 0) || 0;

  return {
    conversations: conversations || [],
    isLoading,
    isError,
    error,
    refetchConversations: refetch,
    totalUnreadCount,
  };
};
