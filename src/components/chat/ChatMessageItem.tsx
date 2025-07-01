
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ChatMessage } from '@/types/chat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface ChatMessageItemProps {
  message: ChatMessage;
  isOwnMessage: boolean;
  canDelete: boolean;
  onDelete?: (messageId: string) => void;
}

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  isOwnMessage,
  canDelete,
  onDelete
}) => {
  const displayName = message.profile?.display_name || 
                     message.profile?.username || 
                     'User';

  const avatarInitial = displayName.charAt(0).toUpperCase();

  const handleDelete = () => {
    if (onDelete && window.confirm('Are you sure you want to delete this message?')) {
      onDelete(message.id);
    }
  };

  return (
    <div className={`flex gap-3 p-3 hover:bg-muted/50 group ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={message.profile?.profile_picture || ''} />
        <AvatarFallback className="text-xs">{avatarInitial}</AvatarFallback>
      </Avatar>
      
      <div className={`flex-1 min-w-0 ${isOwnMessage ? 'text-right' : ''}`}>
        <div className={`flex items-center gap-2 mb-1 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
          <span className="font-medium text-sm text-foreground">
            {displayName}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
          </span>
        </div>
        
        <div className={`bg-card border rounded-lg p-2 ${isOwnMessage ? 'bg-primary text-primary-foreground' : ''}`}>
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
      </div>

      {canDelete && (
        <Button
          variant="ghost"
          size="sm"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default ChatMessageItem;
