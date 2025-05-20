
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Notification } from '@/types/notifications';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { useNotificationMapper } from './notifications/useNotificationMapper';
import { useNotificationActions } from './notifications/useNotificationActions';
import { useNotificationSubscription } from './notifications/useNotificationSubscription';

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const { mapDbNotificationToType } = useNotificationMapper();
  const { markAsRead, markAllAsRead } = useNotificationActions({ setNotifications, currentUser: user });

  useNotificationSubscription({
    currentUser: user,
    initialLoadComplete,
    mapDbNotificationToType,
    setNotifications,
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const fetchNotificationsInternal = useCallback(async (showToast = false) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('forum_notifications')
        .select(`
          *,
          actor_profiles:profiles!forum_notifications_actor_id_fkey(id, display_name, username, profile_picture)
        `)
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw error;

      const mappedNotifications = await Promise.all(data.map(mapDbNotificationToType));
      setNotifications(mappedNotifications);
      if (showToast) {
        toast({ title: "Notifications refreshed!" });
      }
    } catch (err: any) {
      console.error("Error fetching notifications:", err.message);
      toast({ title: "Error", description: "Could not fetch notifications.", variant: "destructive" });
    } finally {
      setIsLoading(false);
      if (!initialLoadComplete) { // Set initialLoadComplete only after the first successful or failed load
        setInitialLoadComplete(true);
      }
    }
  }, [user, mapDbNotificationToType, initialLoadComplete]); // Added initialLoadComplete

  useEffect(() => {
    if (user && !initialLoadComplete) {
      fetchNotificationsInternal();
    }
  }, [user, fetchNotificationsInternal, initialLoadComplete]);


  const formatTimeAgo = (timestamp: string): string => {
    try {
        const date = new Date(timestamp);
        return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
        return "Invalid date";
    }
  };
  
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'read' | 'timestamp' | 'actor'> & { actorId?: string }) => {
     console.warn("addNotification is primarily for non-forum, client-side notifications now.");
     const newNotification: Notification = {
       ...notification,
       id: Date.now().toString(),
       read: false,
       timestamp: new Date().toISOString(),
     };
     setNotifications(prev => [newNotification, ...prev.slice(0,29)]);
     toast({ title: notification.type, description: notification.content.substring(0,30) + "..."});
  }, []);


  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications: () => fetchNotificationsInternal(true),
    markAsRead,
    markAllAsRead,
    formatTimeAgo,
    addNotification,
  };
};

