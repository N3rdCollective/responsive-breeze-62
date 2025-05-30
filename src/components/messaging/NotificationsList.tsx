
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Mail, MailOpen, Clock } from 'lucide-react';

interface UserMessage {
  id: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
  message_type: string;
}

interface NotificationsListProps {
  adminMessages: UserMessage[];
  adminMessagesLoading: boolean;
  selectedAdminMessage: UserMessage | null;
  onAdminMessageClick: (message: UserMessage) => void;
}

const NotificationsList: React.FC<NotificationsListProps> = ({
  adminMessages,
  adminMessagesLoading,
  selectedAdminMessage,
  onAdminMessageClick
}) => {
  if (adminMessagesLoading) {
    return (
      <div className="p-6 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary mx-auto mb-3"></div>
        <p className="text-muted-foreground">Loading notifications...</p>
      </div>
    );
  }

  if (adminMessages.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No notifications yet</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-1">
        {adminMessages.map((message) => (
          <div
            key={message.id}
            onClick={() => onAdminMessageClick(message)}
            className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 border-b last:border-b-0 ${
              selectedAdminMessage?.id === message.id ? 'bg-muted' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-1">
                {message.is_read ? (
                  <MailOpen className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Mail className="h-4 w-4 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className={`font-medium truncate ${!message.is_read ? 'font-semibold' : ''}`}>
                    {message.subject}
                  </p>
                  {!message.is_read && (
                    <Badge variant="default" className="px-1.5 py-0.5 text-xs">
                      New
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {new Date(message.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default NotificationsList;
