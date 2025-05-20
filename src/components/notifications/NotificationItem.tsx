
import React from 'react';
import { Link } from 'react-router-dom';
import { Notification } from '@/types/notifications';
import NotificationIcon from './NotificationIcon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  formatTimeAgo: (timestamp: string) => string;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkAsRead, formatTimeAgo }) => {
  const handleItemClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    // Navigation will be handled by Link if present
  };

  const content = (
    <div 
      className={`p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
        notification.read ? 'opacity-70' : 'bg-primary/5 dark:bg-primary/10'
      }`}
      onClick={handleItemClick}
    >
      <div className="flex items-start space-x-3">
        <div className="mt-1 shrink-0">
          <NotificationIcon type={notification.type} />
        </div>
        <div className="flex-1 min-w-0">
          {notification.user && (
            <div className="flex items-center mb-0.5">
              <Avatar className="w-5 h-5 mr-2">
                <AvatarImage src={notification.user.avatar} alt={notification.user.name} />
                <AvatarFallback>{notification.user.name.substring(0, 1)}</AvatarFallback>
              </Avatar>
              <span className="font-medium text-sm truncate text-gray-800 dark:text-gray-200">
                {notification.user.name}
              </span>
            </div>
          )}
          <p className={`text-sm ${notification.user ? 'text-gray-600 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
            {notification.content}
          </p>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {formatTimeAgo(notification.timestamp)}
          </div>
        </div>
        {!notification.read && (
          <div className="w-2.5 h-2.5 bg-primary rounded-full ml-2 mt-1 shrink-0"></div>
        )}
      </div>
    </div>
  );

  if (notification.link) {
    return <Link to={notification.link}>{content}</Link>;
  }
  return content;
};

export default NotificationItem;

