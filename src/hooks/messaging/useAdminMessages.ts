
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UserMessage {
  id: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
  message_type: string;
}

export const useAdminMessages = () => {
  const { user } = useAuth();
  const [adminMessages, setAdminMessages] = useState<UserMessage[]>([]);
  const [adminUnreadCount, setAdminUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAdminMessages();
      
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
            fetchAdminMessages();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setAdminMessages([]);
      setAdminUnreadCount(0);
      setLoading(false);
    }
  }, [user]);

  const fetchAdminMessages = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_messages')
        .select('*')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const messages = data || [];
      setAdminMessages(messages);
      setAdminUnreadCount(messages.filter(msg => !msg.is_read).length);
    } catch (err: any) {
      console.error('Error fetching admin messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('user_messages')
        .update({ is_read: true })
        .eq('id', messageId);

      if (error) throw error;

      setAdminMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, is_read: true } : msg
      ));
      setAdminUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error('Error marking admin message as read:', err);
    }
  };

  return {
    adminMessages,
    adminUnreadCount,
    loading,
    markAsRead,
    refreshMessages: fetchAdminMessages
  };
};
