import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'react-router-dom';
import { useScrollToTopNavigation } from '@/hooks/useScrollToTopNavigation';
import { useConversations } from '@/hooks/useConversations';
import { useUserMessages } from '@/hooks/useUserMessages';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import NewConversationModal from '@/components/messaging/NewConversationModal';
import MessagesPageHeader from '@/components/messaging/MessagesPageHeader';
import ConversationsTab from '@/components/messaging/ConversationsTab';
import NotificationsTab from '@/components/messaging/NotificationsTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import TitleUpdater from '@/components/TitleUpdater';

interface UserMessage {
  id: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
  message_type: string;
}

const UnifiedMessagesPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useScrollToTopNavigation();
  const location = useLocation();
  const { toast } = useToast();
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Conversation state
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

  // Admin messages state
  const [adminMessages, setAdminMessages] = useState<UserMessage[]>([]);
  const [selectedAdminMessage, setSelectedAdminMessage] = useState<UserMessage | null>(null);
  const [adminMessagesLoading, setAdminMessagesLoading] = useState(true);
  
  // Unified state
  const { unreadCount: conversationUnreadCount } = useUserMessages();
  const [adminUnreadCount, setAdminUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState('conversations');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      refetchConversations();
      fetchAdminMessages();
    }
  }, [user, refetchConversations]);

  const fetchAdminMessages = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_messages')
        .select('*')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const messages = data || [];
      setAdminMessages(messages);
      setAdminUnreadCount(messages.filter(msg => !msg.is_read).length);
    } catch (err: any) {
      console.error('Error fetching admin messages:', err);
      toast({
        title: "Error",
        description: "Failed to load admin messages.",
        variant: "destructive"
      });
    } finally {
      setAdminMessagesLoading(false);
    }
  };

  const markAdminMessageAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('user_messages')
        .update({ is_read: true })
        .eq('id', messageId);

      if (error) throw error;

      setAdminMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, is_read: true } : msg
      ));
      setAdminUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error('Error marking admin message as read:', err);
    }
  };

  const handleAdminMessageClick = (message: UserMessage) => {
    setSelectedAdminMessage(message);
    if (!message.is_read) {
      markAdminMessageAsRead(message.id);
    }
  };

  // Conversation handlers
  useEffect(() => {
    if (conversationsLoading) return;
    
    const routeState = location.state as { selectConversationWithUser?: string, conversationId?: string } | undefined;

    if (routeState?.selectConversationWithUser && routeState?.conversationId && user) {
      if (selectedConversationId !== routeState.conversationId) {
        setSelectedConversationId(routeState.conversationId);
        setOtherParticipantId(routeState.selectConversationWithUser);
        if (markConversationAsRead && routeState.conversationId) {
          markConversationAsRead(routeState.conversationId);
        }
        navigate(location.pathname, { replace: true, state: {} });
      }
    } else if (!selectedConversationId && conversations.length > 0 && user) {
      const firstConv = conversations[0];
      if (firstConv && firstConv.id) {
        setSelectedConversationId(firstConv.id);
        setOtherParticipantId(user.id === firstConv.participant1_id ? firstConv.participant2_id : firstConv.participant1_id);
        if (markConversationAsRead && firstConv.id) {
          markConversationAsRead(firstConv.id);
        }
      }
    } else if (conversations.length === 0 && selectedConversationId && !conversationsLoading) {
      setSelectedConversationId(null);
      setOtherParticipantId(null);
    }
  }, [conversations, selectedConversationId, user, conversationsLoading, markConversationAsRead, location.state, navigate]);

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    const selectedConv = conversations.find(c => c.id === conversationId);
    if (user && selectedConv) {
      setOtherParticipantId(user.id === selectedConv.participant1_id ? selectedConv.participant2_id : selectedConv.participant1_id);
      if (markConversationAsRead && conversationId) {
        markConversationAsRead(conversationId);
      }
    } else {
      setOtherParticipantId(null);
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
        setOtherParticipantId(targetUserId);
        setIsNewConversationModalOpen(false);
        if (markConversationAsRead && newConversationId) {
          markConversationAsRead(newConversationId);
        }
      } else {
        toast({ title: "Error", description: "Could not start or find conversation.", variant: "destructive"});
      }
    } catch (error: any) {
      console.error("Failed to start or create conversation:", error);
      toast({ title: "Error", description: error.message || "Failed to start conversation.", variant: "destructive"});
    }
  };

  if (authLoading || (user && conversationsLoading && adminMessagesLoading && !conversations.length && !adminMessages.length)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const totalUnreadCount = conversationUnreadCount + adminUnreadCount;

  return (
    <>
      <TitleUpdater title="Messages" />
      <Navbar />
      <div className="flex flex-col bg-background min-h-screen pt-16">
        <div className="flex flex-col flex-1 min-h-0">
          <MessagesPageHeader totalUnreadCount={totalUnreadCount} />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
            <div className="px-4 pt-4 flex-shrink-0">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="conversations" className="relative">
                  Conversations
                  {conversationUnreadCount > 0 && (
                    <Badge variant="destructive" className="ml-2 h-5 w-5 min-w-[1.25rem] p-0 flex items-center justify-center text-xs rounded-full">
                      {conversationUnreadCount > 9 ? '9+' : conversationUnreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="notifications" className="relative">
                  Notifications
                  {adminUnreadCount > 0 && (
                    <Badge variant="destructive" className="ml-2 h-5 w-5 min-w-[1.25rem] p-0 flex items-center justify-center text-xs rounded-full">
                      {adminUnreadCount > 9 ? '9+' : adminUnreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="conversations" className="flex-1 flex mt-0 min-h-0">
              <ConversationsTab
                conversations={conversations}
                currentUserId={user.id}
                conversationsLoading={conversationsLoading}
                selectedConversationId={selectedConversationId}
                otherParticipantId={otherParticipantId}
                onSelectConversation={handleSelectConversation}
                onStartNewConversation={handleStartNewConversation}
              />
            </TabsContent>

            <TabsContent value="notifications" className="flex-1 mt-0 min-h-0">
              <NotificationsTab
                adminMessages={adminMessages}
                adminMessagesLoading={adminMessagesLoading}
                selectedAdminMessage={selectedAdminMessage}
                onAdminMessageClick={handleAdminMessageClick}
              />
            </TabsContent>
          </Tabs>
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
    </>
  );
};

export default UnifiedMessagesPage;
