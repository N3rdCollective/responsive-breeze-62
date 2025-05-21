
import React from 'react';
import { MessageSquare, Heart, AtSign, Tag, Star, UserPlus, Bell, Megaphone, MessageSquareQuote } from 'lucide-react';
import { NotificationType } from '@/types/notifications';

interface CustomNotificationIconProps {
  type: NotificationType;
  size?: number;
  className?: string;
}

const CustomNotificationIcon: React.FC<CustomNotificationIconProps> = ({ type, size = 18, className }) => {
  switch (type) {
    case 'reply':
      return <MessageSquare className={`text-blue-500 ${className}`} size={size} />;
    case 'like':
    case 'like_post':
    case 'like_reply':
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
    case 'new_topic_in_category':
      return <Megaphone className={`text-indigo-500 ${className}`} size={size} />;
    case 'system':
      return <Bell className={`text-gray-600 ${className}`} size={size} />;
    default:
      // This ensures that if NotificationType gets a new member not covered above,
      // TypeScript will warn us if we try to assign it to `never`.
      // However, to prevent build errors if new types are added and not immediately handled here,
      // we'll log a warning and return a fallback icon.
      console.warn(`CustomNotificationIcon: Unknown notification type encountered - "${type}". Rendering fallback.`);
      return <Star className={`text-gray-400 ${className}`} size={size} />;
  }
};

export default CustomNotificationIcon;
