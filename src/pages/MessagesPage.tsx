import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useConversations } from '@/hooks/useConversations';
import ConversationList from '@/components/messaging/ConversationList';
import ChatView from '@/components/messaging/ChatView';
import { Separator } from '@/components/ui/separator';
import { LayoutGrid, MessageCircle, Users } from 'lucide-react';
import { Conversation } from '@/types/messaging';

const MessagesPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { conversations, isLoading: conversationsLoading, refetchConversations } = useConversations();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [otherParticipantId, setOtherParticipantId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      refetchConversations();
    }
  }, [user, refetchConversations]);
  
  useEffect(() => {
    if (!selectedConversationId && conversations.length > 0) {
      const firstConv = conversations[0];
      setSelectedConversationId(firstConv.id);
      if (user && firstConv) {
        setOtherParticipantId(user.id === firstConv.participant1_id ? firstConv.participant2_id : firstConv.participant1_id);
      }
    }
  }, [conversations, selectedConversationId, user]);

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    const selectedConv = conversations.find(c => c.id === conversationId);
    if (user && selectedConv) {
      setOtherParticipantId(user.id === selectedConv.participant1_id ? selectedConv.participant2_id : selectedConv.participant1_id);
    } else {
      setOtherParticipantId(null);
    }
  };

  const handleStartNewConversation = () => {
    console.log("Attempting to start a new conversation.");
    alert("Starting a new conversation feature will be implemented soon!");
  };

  if (authLoading || (user && conversationsLoading && !conversations.length)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; 
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="pt-16 flex-1 flex max-h-[calc(100vh-4rem)]">
        <aside className="w-full md:w-1/3 lg:w-1/4 border-r dark:border-gray-700/50 flex flex-col">
          <div className="p-4 border-b dark:border-gray-700/50">
            <h2 className="text-xl font-semibold text-foreground">Messages</h2>
          </div>
          <ConversationList
            conversations={conversations}
            currentUserId={user.id}
            isLoading={conversationsLoading && conversations.length === 0}
            selectedConversationId={selectedConversationId}
            onSelectConversation={handleSelectConversation}
            onStartNewConversation={handleStartNewConversation}
          />
        </aside>

        <main className="flex-1 flex flex-col">
          {selectedConversationId && otherParticipantId ? (
            <ChatView conversationId={selectedConversationId} otherParticipantId={otherParticipantId} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground p-4 md:p-8">
              <MessageCircle size={48} className="mx-auto mb-4" />
              <p className="text-lg">Select a conversation to start messaging</p>
              <p className="text-sm">or start a new one.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MessagesPage;
