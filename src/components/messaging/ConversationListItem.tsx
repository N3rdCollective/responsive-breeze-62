import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Conversation } from '@/types/messaging';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge'; // Import Badge


interface ConversationListItemProps {
  conversation: Conversation;
  currentUserId: string | undefined;
  isSelected: boolean;
  onSelect: (conversationId: string) => void;
}

const ConversationListItem: React.FC<ConversationListItemProps> = ({ conversation, currentUserId, isSelected, onSelect }) => {
  const otherParticipant = conversation.otherParticipantProfile;
  const displayName = otherParticipant?.display_name || otherParticipant?.username || 'Unknown User';
  const avatarFallback = displayName.charAt(0).toUpperCase();

  let lastMessagePreview = 'No messages yet.';
  let lastMessageTimestamp = conversation.last_message_timestamp;

  if (conversation.lastMessage) {
    const prefix = conversation.lastMessage.sender_id === currentUserId ? 'You: ' : '';
    const messageContent = typeof conversation.lastMessage.content === 'string' ? conversation.lastMessage.content : '';
    lastMessagePreview = `${prefix}${messageContent.substring(0, 30)}${messageContent.length > 30 ? '...' : ''}`;
    lastMessageTimestamp = conversation.lastMessage.timestamp; 
  }

  const unreadCount = conversation.unread_count || 0;

  return (
    <button
      onClick={() => onSelect(conversation.id)}
      className={`w-full text-left p-3 hover:bg-muted/50 dark:hover:bg-muted/30 transition-colors rounded-md flex items-center gap-3 ${isSelected ? 'bg-muted dark:bg-muted/60' : ''}`}
    >
      <Avatar className="h-10 w-10">
        <AvatarImage src={otherParticipant?.avatar_url || undefined} alt={displayName} />
        <AvatarFallback>{avatarFallback}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <p className="font-semibold truncate text-sm text-foreground">{displayName}</p>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="h-5 px-1.5 text-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">{lastMessagePreview}</p>
      </div>
      <div className="text-xs text-muted-foreground whitespace-nowrap self-start pt-1">
        {lastMessageTimestamp && formatDistanceToNow(new Date(lastMessageTimestamp), { addSuffix: true })}
      </div>
    </button>
  );
};

export default ConversationListItem;
