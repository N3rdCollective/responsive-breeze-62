
import { useState, useCallback, useEffect } from 'react';
import { Notification, NotificationUser } from '@/types/notifications';
import { toast } from '@/hooks/use-toast';

// Mock data - this would typically come from an API
const initialNotifications: Notification[] = [
  {
    id: '1',
    type: 'reply',
    read: false,
    user: { name: 'Alex Johnson', avatar: 'https://avatar.iran.liara.run/public/boy?username=Alex' },
    content: 'replied to your topic "Best practices for React hooks"',
    link: '/members/forum/topic/topic-123',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 mins ago
  },
  {
    id: '2',
    type: 'mention',
    read: false,
    user: { name: 'Sarah Chen', avatar: 'https://avatar.iran.liara.run/public/girl?username=Sarah' },
    content: 'mentioned you in "API Documentation Discussion"',
    link: '/members/forum/topic/topic-456',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
  },
  {
    id: '3',
    type: 'like',
    read: true,
    user: { name: 'Michael Wilson', avatar: 'https://avatar.iran.liara.run/public/boy?username=Michael' },
    content: 'liked your post in "Frontend Performance Tips"',
    link: '/members/forum/topic/topic-789/post/post-abc',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString() // 22 hours ago
  },
  {
    id: '4',
    type: 'tag',
    read: true,
    user: { name: 'Leila Patel', avatar: 'https://avatar.iran.liara.run/public/girl?username=Leila' }, // System could also initiate tag notifications
    content: 'tagged a topic with #javascript that you follow',
    link: '/members/forum/tag/javascript',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() // 2 days ago
  },
  {
    id: '5',
    type: 'follow',
    read: true,
    user: { name: 'Thomas Brown', avatar: 'https://avatar.iran.liara.run/public/boy?username=Thomas' },
    content: 'is now following you',
    link: '/profile/thomas-brown',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString() // 3 days ago
  },
  {
    id: '6',
    type: 'system',
    read: false,
    content: 'Forum maintenance scheduled for tomorrow at 2 AM.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() // 5 hours ago
  }
];

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [isLoading, setIsLoading] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    // In a real app, you'd fetch from an API and update user avatars if needed
    // For demo, we just reset to initial or add a new one
    const newNotification: Notification = {
      id: Date.now().toString(),
      type: 'new_post',
      read: false,
      user: { name: 'Community Bot', avatar: 'https://avatar.iran.liara.run/public/bot' },
      content: 'A new announcement has been posted: "Summer Event Details!"',
      link: '/news/summer-event-details',
      timestamp: new Date().toISOString()
    };
    setNotifications(prev => [newNotification, ...prev.slice(0,14)]); // Keep max 15 notifications
    setIsLoading(false);
    toast({ title: "Notifications refreshed!" });
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === notificationId ? { ...notification, read: true } : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification => ({ ...notification, read: true }))
    );
    toast({ title: "All notifications marked as read." });
  }, []);

  const formatTimeAgo = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.round(diffMs / 1000);
    const diffMins = Math.round(diffSecs / 60);
    const diffHours = Math.round(diffMins / 60);
    const diffDays = Math.round(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  };
  
  // Example: Add a new notification (e.g., via WebSocket or on some event)
  // This would be called from elsewhere in your app
  const addNotification = (notification: Omit<Notification, 'id' | 'read' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      read: false,
      timestamp: new Date().toISOString(),
    };
    setNotifications(prev => [newNotification, ...prev]);
  };


  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    formatTimeAgo,
    addNotification, // Expose for potential external use
  };
};

