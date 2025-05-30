
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, MailOpen } from 'lucide-react';

interface UserMessage {
  id: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
  message_type: string;
}

interface NotificationDetailsProps {
  selectedAdminMessage: UserMessage | null;
}

const NotificationDetails: React.FC<NotificationDetailsProps> = ({ selectedAdminMessage }) => {
  if (!selectedAdminMessage) {
    return (
      <CardContent className="flex-1 flex items-center justify-center text-center text-muted-foreground">
        <div>
          <Mail className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">Select a notification to read</p>
          <p className="text-sm">Choose a notification from the list to view its content</p>
        </div>
      </CardContent>
    );
  }

  return (
    <>
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          {selectedAdminMessage.is_read ? (
            <MailOpen className="h-5 w-5 text-muted-foreground" />
          ) : (
            <Mail className="h-5 w-5 text-primary" />
          )}
          {selectedAdminMessage.subject}
        </CardTitle>
        <CardDescription>
          <div className="flex items-center gap-4">
            <span>From: Staff</span>
            <span>•</span>
            <span>{new Date(selectedAdminMessage.created_at).toLocaleString()}</span>
            <Badge variant="outline" className="ml-2">
              {selectedAdminMessage.message_type}
            </Badge>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap">{selectedAdminMessage.message}</p>
          </div>
        </ScrollArea>
      </CardContent>
    </>
  );
};

export default NotificationDetails;
