
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Notification } from '@/types/notifications';
import type { User } from '@supabase/supabase-js';

interface UseNotificationActionsProps {
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  currentUser: User | null; // Renamed for clarity, was 'user'
}

export const useNotificationActions = ({ setNotifications, currentUser }: UseNotificationActionsProps) => {
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!currentUser) return;
    try {
      const { error } = await supabase
        .from('forum_notifications')
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('recipient_id', currentUser.id);

      if (error) throw error;

      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === notificationId ? { ...notification, read: true } : notification
        )
      );
    } catch (err: any) {
      console.error("Error marking notification as read:", err.message);
      toast({ title: "Error", description: "Could not mark notification as read.", variant: "destructive" });
    }
  }, [currentUser, setNotifications]);

  const markAllAsRead = useCallback(async () => {
    if (!currentUser) return;
    try {
      const { error } = await supabase
        .from('forum_notifications')
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq('recipient_id', currentUser.id)
        .eq('read', false); 

      if (error) throw error;

      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
      toast({ title: "All notifications marked as read." });
    } catch (err: any) {
      console.error("Error marking all notifications as read:", err.message);
      toast({ title: "Error", description: "Could not mark all notifications as read.", variant: "destructive" });
    }
  }, [currentUser, setNotifications]);

  return { markAsRead, markAllAsRead };
};

