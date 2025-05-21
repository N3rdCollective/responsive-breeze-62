
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
    if (!currentUser || !initialLoadComplete) {
      if (!currentUser) console.log('[NotificationSubscription] No current user, subscription not started.');
      if (!initialLoadComplete) console.log('[NotificationSubscription] Initial load not complete, subscription not started.');
      return;
    }

    console.log('[NotificationSubscription] Attempting to subscribe to channel for user:', currentUser.id);

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
          console.log('[NotificationSubscription] Received raw payload:', payload);
          const newDbNotification = payload.new as any;
          console.log('[NotificationSubscription] Extracted newDbNotification from payload:', newDbNotification);

          if (!newDbNotification || !newDbNotification.id) {
            console.error('[NotificationSubscription] Invalid or missing newDbNotification data from payload.');
            return;
          }

          console.log(`[NotificationSubscription] Fetching full notification details for ID: ${newDbNotification.id}`);
          const { data: fullNewDbNotification, error: fetchError } = await supabase
            .from('forum_notifications')
            .select(`
              *,
              actor_profiles:profiles!forum_notifications_actor_id_fkey(id, display_name, username, profile_picture)
            `)
            .eq('id', newDbNotification.id)
            .single();

          if (fetchError || !fullNewDbNotification) {
            console.error("[NotificationSubscription] Error fetching full new notification for real-time update:", fetchError?.message || "Notification not found via direct fetch. Full object not found.");
            console.log("[NotificationSubscription] Falling back to mapping with potentially incomplete data from payload.new:", newDbNotification);
            const mappedFallbackNotification = await mapDbNotificationToType(newDbNotification);
            console.log('[NotificationSubscription] Mapped fallback notification:', mappedFallbackNotification);
            
            setNotifications(prevNotifications => {
                if (prevNotifications.find(n => n.id === mappedFallbackNotification.id)) {
                  console.log('[NotificationSubscription] Fallback notification already exists, not adding.');
                  return prevNotifications;
                }
                console.log('[NotificationSubscription] Adding fallback notification to state.');
                return [mappedFallbackNotification, ...prevNotifications];
            });
            toast({
                title: "New Notification! (Fallback)",
                description: mappedFallbackNotification.content.substring(0, 50) + "...",
            });
            return;
          }
          
          console.log('[NotificationSubscription] Successfully fetched fullNewDbNotification:', fullNewDbNotification);
          const newNotification = await mapDbNotificationToType(fullNewDbNotification);
          console.log('[NotificationSubscription] Mapped new notification from full data:', newNotification);
          
          setNotifications(prevNotifications => {
            if (prevNotifications.find(n => n.id === newNotification.id)) {
              console.log('[NotificationSubscription] Notification already exists, not adding.');
              return prevNotifications;
            }
            console.log('[NotificationSubscription] Adding new notification to state.');
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
          console.log('[NotificationSubscription] Successfully subscribed to notifications channel:', `notifications:${currentUser.id}`);
        }
        if (status === 'CHANNEL_ERROR') {
          console.error('[NotificationSubscription] Channel error:', err);
          toast({ title: "Notification Error", description: "Connection issue with notifications.", variant: "destructive" });
        }
        if (status === 'TIMED_OUT') {
          console.warn('[NotificationSubscription] Channel subscription timed out.');
          toast({ title: "Notification Warning", description: "Notification connection timed out, try refreshing.", variant: "destructive" });
        }
         console.log(`[NotificationSubscription] Channel status: ${status}`, err || '');
      });

    return () => {
      console.log('[NotificationSubscription] Unsubscribing from channel:', `notifications:${currentUser.id}`);
      supabase.removeChannel(channel);
    };
  }, [currentUser, initialLoadComplete, mapDbNotificationToType, setNotifications]);
};
