import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { useConversations } from '@/hooks/useConversations';
import ConversationList from '@/components/messaging/ConversationList';
import ChatView from '@/components/messaging/ChatView';
import NewConversationModal from '@/components/messaging/NewConversationModal';
import { MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const MessagesPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    conversations, 
    isLoading: conversationsLoading, 
    refetchConversations,
    startOrCreateConversation,
    markConversationAsRead
  } = useConversations();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [otherParticipantId, setOtherParticipantId] = useState<string | null>(null);
  const [isNewConversationModalOpen, setIsNewConversationModalOpen] = useState(false);
  const { toast } = useToast();

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
    if (conversationsLoading) {
        console.log("MessagesPage: Conversations loading, skipping selection logic in useEffect.");
        return;
    }
    
    const routeState = location.state as { selectConversationWithUser?: string, conversationId?: string } | undefined;

    if (routeState?.selectConversationWithUser && routeState?.conversationId && user) {
      if (selectedConversationId !== routeState.conversationId) {
        console.log("MessagesPage: Selecting conversation from route state:", routeState);
        setSelectedConversationId(routeState.conversationId);
        // Ensure otherParticipantId is correctly set based on the target user from routeState
        // This might require finding the conversation object if participant IDs aren't directly in routeState
        // For now, we assume selectConversationWithUser IS the otherParticipantId.
        setOtherParticipantId(routeState.selectConversationWithUser); 
        if (markConversationAsRead && routeState.conversationId) {
          markConversationAsRead(routeState.conversationId);
        }
        // Clear state after processing
        navigate(location.pathname, { replace: true, state: {} }); 
      }
    } else if (!selectedConversationId && conversations.length > 0 && user) {
      const firstConv = conversations[0];
      if (firstConv && firstConv.id) {
        console.log("MessagesPage: Selecting first conversation:", firstConv.id);
        setSelectedConversationId(firstConv.id);
        setOtherParticipantId(user.id === firstConv.participant1_id ? firstConv.participant2_id : firstConv.participant1_id);
        if (markConversationAsRead && firstConv.id) {
          markConversationAsRead(firstConv.id);
        }
      }
    } else if (conversations.length === 0 && selectedConversationId && !conversationsLoading) {
      console.log("MessagesPage: Resetting selectedConversationId due to empty conversations array.");
      setSelectedConversationId(null);
      setOtherParticipantId(null);
    }
  }, [
    conversations, 
    selectedConversationId, 
    user, 
    conversationsLoading, 
    markConversationAsRead, 
    location.state, 
    navigate
  ]);

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    const selectedConv = conversations.find(c => c.id === conversationId);
    if (user && selectedConv) {
      setOtherParticipantId(user.id === selectedConv.participant1_id ? selectedConv.participant2_id : selectedConv.participant1_id);
      if (markConversationAsRead && conversationId) {
        markConversationAsRead(conversationId);
      }
    } else {
      console.warn("MessagesPage: Could not find selected conversation or user not available for setting otherParticipantId.");
      setOtherParticipantId(null); // Reset if selection fails
    }
  };

  const handleStartNewConversation = () => {
    setIsNewConversationModalOpen(true);
  };

  const handleSelectUserForNewConversation = async (targetUserId: string) => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    if (user.id === targetUserId) {
      toast({ title: "Info", description: "You cannot start a conversation with yourself.", variant: "default" });
      return;
    }

    try {
      const newConversationId = await startOrCreateConversation(targetUserId);
      if (newConversationId) {
        setSelectedConversationId(newConversationId);
        setOtherParticipantId(targetUserId); // The targetUserId is the other participant
        setIsNewConversationModalOpen(false);
        if (markConversationAsRead && newConversationId) {
          markConversationAsRead(newConversationId);
        }
      } else {
        toast({ title: "Error", description: "Could not start or find conversation.", variant: "destructive"});
      }
    } catch (error: any) {
      console.error("MessagesPage: Failed to start or create conversation:", error);
      toast({ title: "Error", description: error.message || "Failed to start conversation.", variant: "destructive"});
    }
  };

  if (authLoading || (user && conversationsLoading && !conversations.length && !selectedConversationId && !location.state?.conversationId)) {
    if (authLoading || (user && conversationsLoading && conversations.length === 0  && !location.state?.conversationId)) {
         return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            </div>
        );
    }
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
              {conversationsLoading && conversations.length === 0 && !location.state?.conversationId ? (
                 <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary mb-4"></div>
              ) : (
                conversations.length > 0 ? null : <MessageCircle size={48} className="mx-auto mb-4" />
              )}
              {conversations.length > 0 && !conversationsLoading ? (
                <p className="text-lg">Select a conversation to start messaging</p>
              ) : (
                 conversationsLoading && conversations.length === 0 && !location.state?.conversationId ? (
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
      {user && (
        <NewConversationModal
          isOpen={isNewConversationModalOpen}
          onOpenChange={setIsNewConversationModalOpen}
          onSelectUser={handleSelectUserForNewConversation}
          currentUserId={user?.id}
        />
      )}
    </div>
  );
};

export default MessagesPage;
