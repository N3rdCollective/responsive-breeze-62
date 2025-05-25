
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useConversations } from '@/hooks/useConversations';
import ConversationList from '@/components/messaging/ConversationList';
// Placeholder for ChatView, NewConversationModal
// import ChatView from '@/components/messaging/ChatView'; 
// import NewConversationModal from '@/components/messaging/NewConversationModal';
import { Separator } from '@/components/ui/separator';
import { LayoutGrid, MessageCircle, Users } from 'lucide-react';

const MessagesPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { conversations, isLoading: conversationsLoading, refetchConversations } = useConversations();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  // const [isNewConversationModalOpen, setIsNewConversationModalOpen] = useState(false);

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
  
  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    // Future: navigate to /messages/:conversationId or update main view
  };

  const handleStartNewConversation = () => {
    // setIsNewConversationModalOpen(true);
    // For now, just log. We will implement a modal or a new page for this.
    console.log("Attempting to start a new conversation.");
    alert("Starting a new conversation feature will be implemented soon!");
  };

  if (authLoading || (user && conversationsLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirecting
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="pt-16 flex-1 flex">
        {/* Sidebar for conversation list */}
        <aside className="w-full md:w-1/3 lg:w-1/4 border-r dark:border-gray-700/50 flex flex-col">
          <div className="p-4 border-b dark:border-gray-700/50">
            <h2 className="text-xl font-semibold text-foreground">Messages</h2>
          </div>
          <ConversationList
            conversations={conversations}
            currentUserId={user.id}
            isLoading={conversationsLoading}
            selectedConversationId={selectedConversationId}
            onSelectConversation={handleSelectConversation}
            onStartNewConversation={handleStartNewConversation}
          />
        </aside>

        {/* Main chat view area */}
        <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
          {selectedConversationId ? (
            <p className="text-muted-foreground">
              Chat view for conversation ID: {selectedConversationId} will be here.
              {/* <ChatView conversationId={selectedConversationId} /> */}
            </p>
          ) : (
            <div className="text-center text-muted-foreground">
              <MessageCircle size={48} className="mx-auto mb-4" />
              <p className="text-lg">Select a conversation to start messaging</p>
              <p className="text-sm">or start a new one.</p>
            </div>
          )}
        </main>
      </div>
      {/* {isNewConversationModalOpen && (
        <NewConversationModal
          isOpen={isNewConversationModalOpen}
          onClose={() => setIsNewConversationModalOpen(false)}
          currentUserId={user.id}
          onConversationCreated={(newConvId) => {
            refetchConversations();
            setSelectedConversationId(newConvId);
            setIsNewConversationModalOpen(false);
          }}
        />
      )} */}
    </div>
  );
};

export default MessagesPage;
