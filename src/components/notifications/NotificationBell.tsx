
import React, { useEffect } from 'react'; // Added useEffect
import { Bell as BellIcon } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationPanel from './NotificationPanel';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from '@/components/ui/button';

interface NotificationBellProps {
  isHomePage?: boolean;
  isScrolled?: boolean;
  mobile?: boolean;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ isHomePage, isScrolled, mobile }) => {
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    formatTimeAgo,
  } = useNotifications();
  const [isOpen, setIsOpen] = React.useState(false);

  // Diagnostic logs
  useEffect(() => {
    console.log('[NotificationBell] Notifications state updated. Count:', notifications.length, 'Unread:', unreadCount, 'Notifications:', notifications);
  }, [notifications, unreadCount]);

  useEffect(() => {
    console.log('[NotificationBell] Unread count specifically changed to:', unreadCount);
  }, [unreadCount]);


  const bellColorClass = mobile 
    ? 'text-[#333333] dark:text-white hover:text-primary dark:hover:text-primary'
    : isHomePage && !isScrolled
      ? 'text-white hover:text-primary dark:text-primary dark:hover:text-white'
      : 'text-primary-foreground dark:text-primary hover:text-primary/80 dark:hover:text-primary/80';


  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`relative rounded-full focus:outline-none 
            ${ mobile ? 'h-9 w-9' : 'h-9 w-9'}
            ${isHomePage && !isScrolled && !mobile 
                ? "text-white hover:text-primary dark:text-primary dark:hover:text-white hover:bg-white/10 dark:hover:bg-black/10" 
                : "text-foreground hover:text-primary dark:hover:text-primary hover:bg-accent dark:hover:bg-accent"
            }`
          }
          aria-label="Toggle notifications"
        >
          <BellIcon size={mobile ? 22 : 20} />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-600 rounded-full border-2 border-card dark:border-gray-800">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end" sideOffset={10}>
        <NotificationPanel
          notifications={notifications}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onFetchNotifications={fetchNotifications}
          formatTimeAgo={formatTimeAgo}
          isLoading={isLoading}
          onClose={() => setIsOpen(false)}
        />
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
