
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useConversations } from '@/hooks/useConversations';
import ConversationList from '@/components/messaging/ConversationList';
import ChatView from '@/components/messaging/ChatView';
import NewConversationModal from '@/components/messaging/NewConversationModal'; // Import the new modal
import { Separator } from '@/components/ui/separator';
import { LayoutGrid, MessageCircle, Users } from 'lucide-react';
import { Conversation } from '@/types/messaging';
import { useToast } from '@/hooks/use-toast'; // Import useToast

const MessagesPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { 
    conversations, 
    isLoading: conversationsLoading, 
    refetchConversations,
    startOrCreateConversation // Get the new function
  } = useConversations();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [otherParticipantId, setOtherParticipantId] = useState<string | null>(null);
  const [isNewConversationModalOpen, setIsNewConversationModalOpen] = useState(false); // State for modal
  const { toast } = useToast(); // Initialize toast

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
      // Check if the first conversation's ID is already selected to prevent infinite loop
      if (conversations[0].id !== selectedConversationId) {
        const firstConv = conversations[0];
        setSelectedConversationId(firstConv.id);
        if (user && firstConv) {
          setOtherParticipantId(user.id === firstConv.participant1_id ? firstConv.participant2_id : firstConv.participant1_id);
        }
      }
    } else if (conversations.length === 0 && selectedConversationId) {
      // If no conversations, clear selection
      setSelectedConversationId(null);
      setOtherParticipantId(null);
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
    setIsNewConversationModalOpen(true); // Open the modal
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
      const conversationId = await startOrCreateConversation(targetUserId);
      if (conversationId) {
        // The useConversations hook should refetch, and the useEffect for conversations should handle selection.
        // However, to be more direct:
        setSelectedConversationId(conversationId);
        setOtherParticipantId(targetUserId);
        setIsNewConversationModalOpen(false); // Close modal
        
        // Ensure the new conversation is visible if it was just created
        // The refetch in startOrCreateConversation should handle this,
        // but sometimes direct selection needs a bit more nudge or wait for list update.
        // For now, we rely on the useEffect listening to `conversations` to pick it up.
        // If not, we might need to manually add it to the local state or force a re-render.
      } else {
        toast({ title: "Error", description: "Could not start or find conversation.", variant: "destructive"});
      }
    } catch (error: any) {
      console.error("Failed to start or create conversation:", error);
      toast({ title: "Error", description: error.message || "Failed to start conversation.", variant: "destructive"});
    }
  };


  if (authLoading || (user && conversationsLoading && !conversations.length && !selectedConversationId)) { // Adjusted loading condition
    // If there are conversations but none selected yet, it's not necessarily "loading" initial state
    // Show loader if auth is loading OR (user exists AND conversations are loading AND no conversations yet AND no conversation selected)
    // This prevents showing loader just because no conv is selected when the list is actually loaded.
    if (authLoading || (user && conversationsLoading && conversations.length === 0)) {
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
            // Pass conversationsLoading only if there are no conversations yet.
            // If conversations exist, list is not "loading" in terms of initial fetch.
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
              {conversations.length > 0 ? (
                <p className="text-lg">Select a conversation to start messaging</p>
              ) : (
                 <p className="text-lg">No conversations yet.</p>
              )}
              <p className="text-sm">or start a new one.</p>
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
