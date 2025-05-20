
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Notification, NotificationUser } from '@/types/notifications';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const mapDbNotificationToType = async (dbNotif: any): Promise<Notification> => {
    let actorProfile: NotificationUser | undefined = undefined;
    if (dbNotif.actor_id) {
      // Fetch actor profile if not already fetched or passed
      // For simplicity in this pass, we'll assume actor_profiles might be joined
      // or fetched separately. In a real scenario, you'd fetch profile details.
      // For now, let's assume dbNotif.actor_profiles holds this.
      // This part needs robust implementation: joining in query or separate fetch.
      let actorName = 'User';
      let actorAvatar: string | undefined = undefined;
      let actorId = dbNotif.actor_id;

      if (dbNotif.actor_profiles) { // If joined in the query
         actorName = dbNotif.actor_profiles.display_name || dbNotif.actor_profiles.username || 'User';
         actorAvatar = dbNotif.actor_profiles.profile_picture;
      } else {
        // Fallback: Fetch profile if not joined
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, display_name, username, profile_picture')
          .eq('id', dbNotif.actor_id)
          .single();
        if (!profileError && profileData) {
          actorId = profileData.id;
          actorName = profileData.display_name || profileData.username || 'User';
          actorAvatar = profileData.profile_picture;
        }
      }
      actorProfile = { id: actorId, name: actorName, avatar: actorAvatar };
    }

    // Construct notification content and link
    // This part will also need Topic/Post titles, slugs etc. for meaningful messages and links.
    // These would ideally be joined in the main query or fetched.
    let content = dbNotif.content_preview || `Notification type: ${dbNotif.type}`;
    let link = '/members/forum'; // Default link

    // Fetch topic details if topic_id exists for better content/link
    let topicTitle = '';
    let topicSlugVal: string | undefined = undefined;
    let categorySlugVal: string | undefined = undefined;

    if (dbNotif.topic_id) {
        const { data: topicDetails, error: topicError } = await supabase
            .from('forum_topics')
            .select('title, slug, category:forum_categories(slug)')
            .eq('id', dbNotif.topic_id)
            .single();
        if (!topicError && topicDetails) {
            topicTitle = topicDetails.title;
            topicSlugVal = topicDetails.slug;
            if (topicDetails.category && typeof topicDetails.category === 'object' && topicDetails.category !== null && 'slug' in topicDetails.category) {
              categorySlugVal = (topicDetails.category as { slug: string }).slug;
            }
        }
    }


    if (dbNotif.type === 'reply' && actorProfile && topicTitle) {
      content = `${actorProfile.name} replied to your topic: "${topicTitle}"`;
      if (categorySlugVal && (topicSlugVal || dbNotif.topic_id)) {
        link = `/members/forum/${categorySlugVal}/${topicSlugVal || dbNotif.topic_id}`;
        if (dbNotif.post_id) link += `?post_id=${dbNotif.post_id}`; // For potential future scroll-to-post
      }
    } else if (dbNotif.type === 'like' && actorProfile && topicTitle) {
      content = `${actorProfile.name} liked your post in: "${topicTitle}"`;
       if (categorySlugVal && (topicSlugVal || dbNotif.topic_id)) {
        link = `/members/forum/${categorySlugVal}/${topicSlugVal || dbNotif.topic_id}`;
        if (dbNotif.post_id) link += `?post_id=${dbNotif.post_id}`;
      }
    } else if (dbNotif.type === 'system') {
        content = dbNotif.content_preview || "System notification";
    }
    // Extend for other types as needed


    return {
      id: dbNotif.id,
      type: dbNotif.type,
      read: dbNotif.read,
      actor: actorProfile,
      content: content,
      link: link,
      timestamp: dbNotif.created_at,
      topic_id: dbNotif.topic_id,
      post_id: dbNotif.post_id,
      content_preview: dbNotif.content_preview,
      topic_title: topicTitle,
      topic_slug: topicSlugVal,
      category_slug: categorySlugVal,
    };
  };

  const fetchNotifications = useCallback(async (showToast = false) => {
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
        .limit(30); // Fetch last 30 notifications

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
      setInitialLoadComplete(true);
    }
  }, [user]); // toast can be removed if not used or passed as param

  useEffect(() => {
    if (user && !initialLoadComplete) {
      fetchNotifications();
    }
  }, [user, fetchNotifications, initialLoadComplete]);

  // Real-time subscription
  useEffect(() => {
    if (!user || !initialLoadComplete) return;

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'forum_notifications',
          filter: `recipient_id=eq.${user.id}`,
        },
        async (payload) => {
          const newDbNotification = payload.new as any;
          const newNotification = await mapDbNotificationToType(newDbNotification);
          
          setNotifications(prevNotifications => {
            // Avoid duplicates if somehow received multiple times
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
          // Optionally, try to resubscribe or notify user
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, initialLoadComplete]); // mapDbNotificationToType needs to be stable or wrapped in useCallback if complex

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('forum_notifications')
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('recipient_id', user.id);

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
  }, [user]);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('forum_notifications')
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq('recipient_id', user.id)
        .eq('read', false); // Only update unread ones

      if (error) throw error;

      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
      toast({ title: "All notifications marked as read." });
    } catch (err: any) {
      console.error("Error marking all notifications as read:", err.message);
      toast({ title: "Error", description: "Could not mark all notifications as read.", variant: "destructive" });
    }
  }, [user]);

  const formatTimeAgo = (timestamp: string): string => {
    try {
        const date = new Date(timestamp);
        return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
        return "Invalid date";
    }
  };
  
  // This function is for client-side or system-initiated notifications not from forum actions.
  // For forum replies/likes, notifications are created in useForum.ts and fetched.
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'read' | 'timestamp' | 'actor'> & { actorId?: string }) => {
     console.warn("addNotification is primarily for non-forum, client-side notifications now.");
     // Basic example if still needed for system messages not stored in DB
     const newNotification: Notification = {
       ...notification,
       id: Date.now().toString(),
       read: false,
       timestamp: new Date().toISOString(),
       // actor details would need to be fetched or provided
     };
     setNotifications(prev => [newNotification, ...prev.slice(0,29)]); // Keep max 30
     toast({ title: notification.type, description: notification.content.substring(0,30) + "..."});
  }, []);


  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications: () => fetchNotifications(true), // Pass true to show toast on manual refresh
    markAsRead,
    markAllAsRead,
    formatTimeAgo,
    addNotification, // Kept for now, its role is diminished
  };
};
