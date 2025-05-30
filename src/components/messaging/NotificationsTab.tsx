
import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail } from 'lucide-react';
import NotificationsList from './NotificationsList';
import NotificationDetails from './NotificationDetails';

interface UserMessage {
  id: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
  message_type: string;
}

interface NotificationsTabProps {
  adminMessages: UserMessage[];
  adminMessagesLoading: boolean;
  selectedAdminMessage: UserMessage | null;
  onAdminMessageClick: (message: UserMessage) => void;
}

const NotificationsTab: React.FC<NotificationsTabProps> = ({
  adminMessages,
  adminMessagesLoading,
  selectedAdminMessage,
  onAdminMessageClick
}) => {
  return (
    <div className="flex-1 mt-0 min-h-0">
      <div className="h-full p-4">
        <div className="grid gap-6 lg:grid-cols-12 h-full">
          <div className="lg:col-span-5 h-full">
            <Card className="h-full flex flex-col">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Notifications ({adminMessages.length})
                </CardTitle>
              </CardHeader>
              <div className="p-0 flex-1 min-h-0">
                <NotificationsList
                  adminMessages={adminMessages}
                  adminMessagesLoading={adminMessagesLoading}
                  selectedAdminMessage={selectedAdminMessage}
                  onAdminMessageClick={onAdminMessageClick}
                />
              </div>
            </Card>
          </div>

          <div className="lg:col-span-7 h-full">
            <Card className="h-full flex flex-col">
              <NotificationDetails selectedAdminMessage={selectedAdminMessage} />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsTab;
