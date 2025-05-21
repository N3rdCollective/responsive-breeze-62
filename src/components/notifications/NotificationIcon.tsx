
import React from 'react';
import { MessageSquare, Heart, AtSign, Tag, Star, UserPlus, Bell, Megaphone, MessageSquareQuote } from 'lucide-react';
import { NotificationType } from '@/types/notifications';

interface NotificationIconProps {
  type: NotificationType;
  size?: number;
  className?: string;
}

const NotificationIcon: React.FC<NotificationIconProps> = ({ type, size = 18, className }) => {
  switch (type) {
    case 'reply':
      return <MessageSquare className={`text-blue-500 ${className}`} size={size} />;
    case 'like':
    case 'like_post': // Added case for like_post
      return <Heart className={`text-red-500 fill-red-500 ${className}`} size={size} />;
    case 'like_reply': // Added case for like_reply
      return <Heart className={`text-red-500 fill-red-500 ${className}`} size={size} />;
    case 'mention': 
    case 'mention_reply':
    case 'mention_post':
      return <AtSign className={`text-purple-500 ${className}`} size={size} />;
    case 'quote':
      return <MessageSquareQuote className={`text-teal-500 ${className}`} size={size} />;
    case 'tag':
      return <Tag className={`text-green-500 ${className}`} size={size} />;
    case 'follow':
      return <UserPlus className={`text-yellow-500 ${className}`} size={size} />;
    case 'new_post':
    case 'new_topic_in_category': // Added case for new_topic_in_category
      return <Megaphone className={`text-indigo-500 ${className}`} size={size} />;
    case 'system':
      return <Bell className={`text-gray-600 ${className}`} size={size} />;
    default:
      // Fallback for any unhandled or new types
      // If all types are handled, this line should not cause a TS error.
      // If it does, it means a NotificationType is not handled above.
      const exhaustiveCheck: never = type; 
      console.warn(`NotificationIcon: Unknown notification type encountered - "${type}"`);
      return <Star className={`text-gray-400 ${className}`} size={size} />;
  }
};

export default NotificationIcon;

