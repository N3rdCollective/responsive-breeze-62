
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
    case 'like_post': // Added
    case 'like_reply': // Added
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
    case 'new_topic_in_category': // Added
      return <Megaphone className={`text-indigo-500 ${className}`} size={size} />;
    case 'system':
      return <Bell className={`text-gray-600 ${className}`} size={size} />;
    default:
      // This default case should now ideally not be reached by known NotificationType members.
      // The exhaustiveCheck line helps ensure type safety. If new NotificationType members are added
      // and not handled above, TypeScript will error here, prompting an update.
      const exhaustiveCheck: never = type;
      // Log a warning and return a fallback icon for any unexpected types that might still occur at runtime.
      console.warn(`NotificationIcon: Unknown or unhandled notification type encountered - "${type}". Rendering fallback.`);
      return <Star className={`text-gray-400 ${className}`} size={size} />;
  }
};

export default NotificationIcon;
