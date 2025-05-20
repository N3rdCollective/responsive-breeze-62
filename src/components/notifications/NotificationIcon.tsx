
import React from 'react';
import { MessageSquare, Heart, AtSign, Tag, Star, UserPlus, Bell, Megaphone } from 'lucide-react';
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
      return <Heart className={`text-red-500 fill-red-500 ${className}`} size={size} />;
    case 'mention':
      return <AtSign className={`text-purple-500 ${className}`} size={size} />;
    case 'tag':
      return <Tag className={`text-green-500 ${className}`} size={size} />;
    case 'follow':
      return <UserPlus className={`text-yellow-500 ${className}`} size={size} />;
    case 'new_post':
      return <Megaphone className={`text-indigo-500 ${className}`} size={size} />;
    case 'system':
      return <Bell className={`text-gray-600 ${className}`} size={size} />;
    default:
      return <Star className={`text-gray-400 ${className}`} size={size} />;
  }
};

export default NotificationIcon;

