
import React from 'react';
import { MessageCircle } from 'lucide-react';

interface MessagesPageHeaderProps {
  totalUnreadCount: number;
}

const MessagesPageHeader: React.FC<MessagesPageHeaderProps> = ({ totalUnreadCount }) => {
  return (
    <div className="p-4 border-b dark:border-gray-700/50 flex-shrink-0">
      <div className="flex items-center gap-3">
        <MessageCircle className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          {totalUnreadCount > 0 && (
            <p className="text-muted-foreground">
              {totalUnreadCount} unread message{totalUnreadCount === 1 ? '' : 's'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPageHeader;
