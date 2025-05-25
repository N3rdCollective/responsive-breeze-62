
import React from 'react';
import { DirectMessage } from '@/types/messaging';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface MessageItemProps {
  message: DirectMessage;
  currentUserId: string | undefined;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, currentUserId }) => {
  const isCurrentUserMessage = message.sender_id === currentUserId;
  const senderDisplayName = message.profile?.display_name || message.profile?.username || 'User';
  const avatarFallback = senderDisplayName.charAt(0).toUpperCase();

  return (
    <div className={cn(
      "flex items-end gap-2 p-2",
      isCurrentUserMessage ? "justify-end" : "justify-start"
    )}>
      {!isCurrentUserMessage && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={message.profile?.avatar_url || undefined} alt={senderDisplayName} />
          <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>
      )}
      <div className={cn(
        "max-w-[70%] rounded-lg px-3 py-2 text-sm break-words",
        isCurrentUserMessage
          ? "bg-primary text-primary-foreground"
          : "bg-muted dark:bg-muted/60"
      )}>
        {!isCurrentUserMessage && message.profile && (
          <p className="text-xs font-semibold mb-0.5 text-muted-foreground dark:text-gray-400">
            {senderDisplayName}
          </p>
        )}
        <p>{message.content}</p>
        <p className={cn(
          "text-xs mt-1",
          isCurrentUserMessage ? "text-primary-foreground/80 text-right" : "text-muted-foreground/80 text-left"
        )}>
          {/* Changed created_at to timestamp */}
          {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
        </p>
      </div>
      {isCurrentUserMessage && (
         <Avatar className="h-8 w-8">
          <AvatarImage src={message.profile?.avatar_url || undefined} alt={senderDisplayName} />
          <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default MessageItem;
