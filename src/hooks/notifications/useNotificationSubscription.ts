
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Notification } from '@/types/notifications';
import type { User } from '@supabase/supabase-js';

interface UseNotificationSubscriptionProps {
  currentUser: User | null;
  initialLoadComplete: boolean;
  mapDbNotificationToType: (dbNotif: any) => Promise<Notification>;
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

export const useNotificationSubscription = ({
  currentUser,
  initialLoadComplete,
  mapDbNotificationToType,
  setNotifications,
}: UseNotificationSubscriptionProps) => {
  useEffect(() => {
    if (!currentUser || !initialLoadComplete) return;

    const channel = supabase
      .channel(`notifications:${currentUser.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'forum_notifications',
          filter: `recipient_id=eq.${currentUser.id}`,
        },
        async (payload) => {
          const newDbNotification = payload.new as any;
          // Need to fetch related data for new notifications for consistency
           const { data: fullNewDbNotification, error: fetchError } = await supabase
            .from('forum_notifications')
            .select(`
              *,
              actor_profiles:profiles!forum_notifications_actor_id_fkey(id, display_name, username, profile_picture)
            `)
            .eq('id', newDbNotification.id)
            .single();

          if (fetchError || !fullNewDbNotification) {
            console.error("Error fetching full new notification for real-time update:", fetchError?.message || "Notification not found");
            // Fallback to mapping with potentially incomplete data if actor_profiles is not directly on payload.new
            const newNotification = await mapDbNotificationToType(newDbNotification);
            setNotifications(prevNotifications => {
                if (prevNotifications.find(n => n.id === newNotification.id)) return prevNotifications;
                return [newNotification, ...prevNotifications];
            });
            toast({
                title: "New Notification!",
                description: newNotification.content.substring(0, 50) + "...",
            });
            return;
          }
          
          const newNotification = await mapDbNotificationToType(fullNewDbNotification);
          
          setNotifications(prevNotifications => {
            if (prevNotifications.find(n => n.id === newNotification.id)) {
              return prevNotifications;
            }
            return [newNotification, ...prevNotifications];
          });
          toast({
            title: "New Notification!",
            description: newNotification.content.substring(0, 50) + "...",
          });
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to notifications channel');
        }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('Notification channel error or timed out:', err);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, initialLoadComplete, mapDbNotificationToType, setNotifications]);
};

