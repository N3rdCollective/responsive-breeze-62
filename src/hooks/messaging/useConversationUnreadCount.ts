
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useConversationUnreadCount = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      
      const channel = supabase
        .channel('conversation_messages_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `recipient_id=eq.${user.id}`
          },
          () => {
            fetchUnreadCount();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setUnreadCount(0);
      setLoading(false);
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    if (!user) return;
    
    try {
      const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select(`
          id,
          last_message_timestamp,
          user_conversation_read_status!inner(last_read_timestamp)
        `)
        .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
        .eq('user_conversation_read_status.user_id', user.id);

      if (convError) throw convError;

      const unreadConversations = conversations?.filter(conv => {
        const readStatus = conv.user_conversation_read_status[0];
        if (!readStatus?.last_read_timestamp) return true;
        return new Date(conv.last_message_timestamp) > new Date(readStatus.last_read_timestamp);
      }).length || 0;

      setUnreadCount(unreadConversations);
    } catch (err) {
      console.error('Error fetching conversation unread count:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    unreadCount,
    loading,
    refreshUnreadCount: fetchUnreadCount
  };
};
