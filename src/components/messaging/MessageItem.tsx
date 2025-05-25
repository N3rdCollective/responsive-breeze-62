
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
        "max-w-[70%] rounded-lg px-3 py-2 text-sm break-words flex flex-col", // Added flex flex-col
        isCurrentUserMessage
          ? "bg-primary text-primary-foreground"
          : "bg-muted dark:bg-muted/60"
      )}>
        {!isCurrentUserMessage && message.profile && (
          <p className="text-xs font-semibold mb-0.5 text-muted-foreground dark:text-gray-400">
            {senderDisplayName}
          </p>
        )}
        {message.content && message.content !== "[Image]" && <p>{message.content}</p>}
        {message.media_url && (
          <a href={message.media_url} target="_blank" rel="noopener noreferrer" className="mt-1">
            <img 
              src={message.media_url} 
              alt="Shared media" 
              className="max-w-[200px] md:max-w-[280px] max-h-[300px] object-contain rounded-md cursor-pointer hover:opacity-90 transition-opacity" 
            />
          </a>
        )}
        <p className={cn(
          "text-xs mt-1",
          isCurrentUserMessage ? "text-primary-foreground/80 text-right" : "text-muted-foreground/80 text-left"
        )}>
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

