
import React from 'react';
import ConversationList from './ConversationList';
import ChatView from './ChatView';
import { MessageCircle } from 'lucide-react';
import { Conversation } from '@/types/messaging';

interface ConversationsTabProps {
  conversations: Conversation[];
  currentUserId: string;
  conversationsLoading: boolean;
  selectedConversationId: string | null;
  otherParticipantId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onStartNewConversation: () => void;
}

const ConversationsTab: React.FC<ConversationsTabProps> = ({
  conversations,
  currentUserId,
  conversationsLoading,
  selectedConversationId,
  otherParticipantId,
  onSelectConversation,
  onStartNewConversation
}) => {
  return (
    <div className="flex-1 flex min-h-0 h-full">
      <aside className="w-full md:w-1/3 lg:w-1/4 border-r dark:border-gray-700/50 flex flex-col min-h-0 h-full">
        <ConversationList
          conversations={conversations}
          currentUserId={currentUserId}
          isLoading={conversationsLoading && conversations.length === 0}
          selectedConversationId={selectedConversationId}
          onSelectConversation={onSelectConversation}
          onStartNewConversation={onStartNewConversation}
        />
      </aside>

      <main className="flex-1 flex flex-col min-h-0 h-full">
        {selectedConversationId && otherParticipantId ? (
          <ChatView conversationId={selectedConversationId} otherParticipantId={otherParticipantId} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground p-4 md:p-8">
            {conversationsLoading && conversations.length === 0 ? (
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary mb-4"></div>
            ) : (
              conversations.length > 0 ? null : <MessageCircle size={48} className="mx-auto mb-4" />
            )}
            {conversations.length > 0 && !conversationsLoading ? (
              <p className="text-lg">Select a conversation to start messaging</p>
            ) : (
              conversationsLoading && conversations.length === 0 ? (
                <p className="text-lg">Loading conversations...</p>
              ) : (
                <p className="text-lg">No conversations yet.</p>
              )
            )}
            {!conversationsLoading && <p className="text-sm">or start a new one.</p>}
          </div>
        )}
      </main>
    </div>
  );
};

export default ConversationsTab;
