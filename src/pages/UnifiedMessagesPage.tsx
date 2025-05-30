
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { useConversations } from '@/hooks/useConversations';
import { useUserMessages } from '@/hooks/useUserMessages';
import { supabase } from '@/integrations/supabase/client';
import ConversationList from '@/components/messaging/ConversationList';
import ChatView from '@/components/messaging/ChatView';
import NewConversationModal from '@/components/messaging/NewConversationModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Mail, MailOpen, Clock } from 'lucide-react';
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
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
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
      <div className="min-h-screen flex flex-col bg-background">
        <div className="pt-16 flex-1 flex max-h-[calc(100vh-4rem)]">
          <div className="w-full">
            <div className="p-4 border-b dark:border-gray-700/50">
              <div className="flex items-center gap-3">
                <MessageCircle className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-3xl font-bold">Messages</h1>
                  {totalUnreadCount > 0 && (
                    <p className="text-muted-foreground">
                      {totalUnreadCount} unread message{totalUnreadCount === 1 ? '' : 's'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <div className="px-4 pt-4">
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

              <TabsContent value="conversations" className="flex-1 flex mt-0">
                <aside className="w-full md:w-1/3 lg:w-1/4 border-r dark:border-gray-700/50 flex flex-col">
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
              </TabsContent>

              <TabsContent value="notifications" className="flex-1 flex mt-0">
                <div className="w-full grid gap-6 lg:grid-cols-12 p-4">
                  <div className="lg:col-span-5">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Mail className="h-5 w-5" />
                          Notifications ({adminMessages.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        {adminMessagesLoading ? (
                          <div className="p-6 text-center">
                            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary mx-auto mb-3"></div>
                            <p className="text-muted-foreground">Loading notifications...</p>
                          </div>
                        ) : adminMessages.length === 0 ? (
                          <div className="p-6 text-center text-muted-foreground">
                            <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>No notifications yet</p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {adminMessages.map((message) => (
                              <div
                                key={message.id}
                                onClick={() => handleAdminMessageClick(message)}
                                className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 border-b last:border-b-0 ${
                                  selectedAdminMessage?.id === message.id ? 'bg-muted' : ''
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className="mt-1">
                                    {message.is_read ? (
                                      <MailOpen className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                      <Mail className="h-4 w-4 text-primary" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className={`font-medium truncate ${!message.is_read ? 'font-semibold' : ''}`}>
                                        {message.subject}
                                      </p>
                                      {!message.is_read && (
                                        <Badge variant="default" className="px-1.5 py-0.5 text-xs">
                                          New
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <Clock className="h-3 w-3" />
                                      {new Date(message.created_at).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  <div className="lg:col-span-7">
                    <Card className="h-fit">
                      {selectedAdminMessage ? (
                        <>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              {selectedAdminMessage.is_read ? (
                                <MailOpen className="h-5 w-5 text-muted-foreground" />
                              ) : (
                                <Mail className="h-5 w-5 text-primary" />
                              )}
                              {selectedAdminMessage.subject}
                            </CardTitle>
                            <CardDescription>
                              <div className="flex items-center gap-4">
                                <span>From: Staff</span>
                                <span>•</span>
                                <span>{new Date(selectedAdminMessage.created_at).toLocaleString()}</span>
                                <Badge variant="outline" className="ml-2">
                                  {selectedAdminMessage.message_type}
                                </Badge>
                              </div>
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="prose prose-sm max-w-none">
                              <p className="whitespace-pre-wrap">{selectedAdminMessage.message}</p>
                            </div>
                          </CardContent>
                        </>
                      ) : (
                        <CardContent className="p-12 text-center text-muted-foreground">
                          <Mail className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg">Select a notification to read</p>
                          <p className="text-sm">Choose a notification from the list to view its content</p>
                        </CardContent>
                      )}
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
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
