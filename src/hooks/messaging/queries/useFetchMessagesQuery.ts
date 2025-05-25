
import { useQuery } from '@tanstack/react-query';
import { fetchMessagesFromSupabase } from '@/services/messageService';
import { DirectMessage } from '@/types/messaging';
import { User } from '@supabase/supabase-js';

interface UseFetchMessagesQueryProps {
  conversationId: string | null;
  user: User | null;
}

export const useFetchMessagesQuery = ({ conversationId, user }: UseFetchMessagesQueryProps) => {
  const queryKey = ['messages', conversationId];

  return useQuery<DirectMessage[], Error>({
    queryKey,
    queryFn: () => {
      if (!conversationId || !user?.id) return Promise.resolve([]);
      return fetchMessagesFromSupabase(conversationId);
    },
    enabled: !!conversationId && !!user?.id,
  });
};

