
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserMessages } from '@/hooks/useUserMessages';

export const useUnifiedMessages = () => {
  const { user } = useAuth();
  const { unreadCount: conversationUnreadCount } = useUserMessages();
  const [adminUnreadCount, setAdminUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAdminUnreadCount();
      
      // Set up real-time subscription for admin messages
      const channel = supabase
        .channel('unified_messages_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_messages',
            filter: `recipient_id=eq.${user.id}`
          },
          () => {
            fetchAdminUnreadCount();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setAdminUnreadCount(0);
      setLoading(false);
    }
  }, [user]);

  const fetchAdminUnreadCount = async () => {
    if (!user) return;
    
    try {
      const { count, error } = await supabase
        .from('user_messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      setAdminUnreadCount(count || 0);
    } catch (err) {
      console.error('Error fetching admin unread count:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalUnreadCount = conversationUnreadCount + adminUnreadCount;

  return {
    conversationUnreadCount,
    adminUnreadCount,
    totalUnreadCount,
    loading,
    refreshCounts: () => {
      fetchAdminUnreadCount();
    }
  };
};
