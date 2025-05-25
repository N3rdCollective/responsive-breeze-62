import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Conversation } from '@/types/messaging';
import { formatDistanceToNow } from 'date-fns';
// Removed unused User import from '@supabase/supabase-js'

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
  let lastMessageTimestamp = conversation.last_message_timestamp; // Default to conversation's last update

  if (conversation.lastMessage) {
    const prefix = conversation.lastMessage.sender_id === currentUserId ? 'You: ' : '';
    // Ensure content is a string before calling substring
    const messageContent = typeof conversation.lastMessage.content === 'string' ? conversation.lastMessage.content : '';
    lastMessagePreview = `${prefix}${messageContent.substring(0, 30)}${messageContent.length > 30 ? '...' : ''}`;
    // Corrected: Use timestamp from the lastMessage object
    lastMessageTimestamp = conversation.lastMessage.timestamp; 
  }


  return (
    <button
      onClick={() => onSelect(conversation.id)}
      className={`w-full text-left p-3 hover:bg-muted/50 dark:hover:bg-muted/30 transition-colors rounded-md ${isSelected ? 'bg-muted dark:bg-muted/60' : ''}`}
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          {/* Use avatar_url and provide undefined if null for AvatarImage src */}
          <AvatarImage src={otherParticipant?.avatar_url || undefined} alt={displayName} />
          <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate text-sm text-foreground">{displayName}</p>
          <p className="text-xs text-muted-foreground truncate">{lastMessagePreview}</p>
        </div>
        <div className="text-xs text-muted-foreground whitespace-nowrap">
          {/* Ensure lastMessageTimestamp is valid before formatting */}
          {lastMessageTimestamp && formatDistanceToNow(new Date(lastMessageTimestamp), { addSuffix: true })}
        </div>
      </div>
    </button>
  );
};

export default ConversationListItem;
