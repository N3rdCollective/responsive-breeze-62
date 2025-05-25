
import React from 'react';
import { Conversation } from '@/types/messaging';
import ConversationListItem from './ConversationListItem';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { PenSquare } from 'lucide-react';

interface ConversationListProps {
  conversations: Conversation[];
  currentUserId: string | undefined;
  isLoading: boolean;
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onStartNewConversation: () => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  currentUserId,
  isLoading,
  selectedConversationId,
  onSelectConversation,
  onStartNewConversation
}) => {
  if (isLoading) {
    return (
      <div className="p-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-muted/30 animate-pulse rounded-md mb-2"></div>
        ))}
      </div>
    );
  }

  if (!conversations.length) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>No conversations yet.</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={onStartNewConversation}>
          <PenSquare className="mr-2 h-4 w-4" />
          Start a new message
        </Button>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-2 space-y-1">
        <div className="px-1 mb-2">
             <Button variant="outline" className="w-full" onClick={onStartNewConversation}>
                <PenSquare className="mr-2 h-4 w-4" />
                New Message
            </Button>
        </div>
        {conversations.map((conv) => (
          <ConversationListItem
            key={conv.id}
            conversation={conv}
            currentUserId={currentUserId}
            isSelected={selectedConversationId === conv.id}
            onSelect={onSelectConversation}
          />
        ))}
      </div>
    </ScrollArea>
  );
};

export default ConversationList;
