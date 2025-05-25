
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Conversation } from '@/types/messaging';
import { formatDistanceToNow } from 'date-fns';
import { User } from '@supabase/supabase-js';

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
    lastMessagePreview = `${prefix}${conversation.lastMessage.content.substring(0, 30)}${conversation.lastMessage.content.length > 30 ? '...' : ''}`;
    lastMessageTimestamp = conversation.lastMessage.created_at;
  }


  return (
    <button
      onClick={() => onSelect(conversation.id)}
      className={`w-full text-left p-3 hover:bg-muted/50 dark:hover:bg-muted/30 transition-colors rounded-md ${isSelected ? 'bg-muted dark:bg-muted/60' : ''}`}
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={otherParticipant?.profile_picture || undefined} alt={displayName} />
          <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate text-sm text-foreground">{displayName}</p>
          <p className="text-xs text-muted-foreground truncate">{lastMessagePreview}</p>
        </div>
        <div className="text-xs text-muted-foreground whitespace-nowrap">
          {lastMessageTimestamp && formatDistanceToNow(new Date(lastMessageTimestamp), { addSuffix: true })}
        </div>
      </div>
    </button>
  );
};

export default ConversationListItem;
