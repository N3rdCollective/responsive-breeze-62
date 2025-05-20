
import React from 'react';
import { Notification } from '@/types/notifications';
import NotificationItem from './NotificationItem';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefreshCw, X, CheckCheck } from 'lucide-react';

interface NotificationPanelProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onFetchNotifications: () => void;
  formatTimeAgo: (timestamp: string) => string;
  isLoading: boolean;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onFetchNotifications,
  formatTimeAgo,
  isLoading,
  onClose,
}) => {
  return (
    <div className="w-80 md:w-96 bg-card rounded-lg shadow-xl border border-border">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <h3 className="font-semibold text-card-foreground">Notifications</h3>
        <div className="flex items-center space-x-2">
          {notifications.some(n => !n.read) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkAllAsRead}
              className="text-xs"
              title="Mark all as read"
            >
              <CheckCheck size={16} className="mr-1" />
              Mark All Read
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
            <X size={16} />
            <span className="sr-only">Close notifications</span>
          </Button>
        </div>
      </div>

      {/* Notification List */}
      <ScrollArea className="h-[350px] sm:h-[400px]">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            No new notifications.
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={onMarkAsRead}
              formatTimeAgo={formatTimeAgo}
            />
          ))
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-2 border-t border-border text-center">
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-sm"
          onClick={onFetchNotifications}
          disabled={isLoading}
        >
          <RefreshCw size={14} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Refreshing...' : 'Refresh Notifications'}
        </Button>
      </div>
    </div>
  );
};

export default NotificationPanel;

