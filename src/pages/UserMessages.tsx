
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, MailOpen, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import TitleUpdater from '@/components/TitleUpdater';
import { Navigate } from 'react-router-dom';

interface UserMessage {
  id: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
  message_type: string;
}

const UserMessages = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<UserMessage | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && user) {
      fetchMessages();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('user_messages')
        .select('*')
        .eq('recipient_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      toast({
        title: "Error",
        description: "Failed to load messages.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('user_messages')
        .update({ is_read: true })
        .eq('id', messageId);

      if (error) throw error;

      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, is_read: true } : msg
      ));
    } catch (err: any) {
      console.error('Error marking message as read:', err);
    }
  };

  const handleMessageClick = (message: UserMessage) => {
    setSelectedMessage(message);
    if (!message.is_read) {
      markAsRead(message.id);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const unreadCount = messages.filter(msg => !msg.is_read).length;

  return (
    <>
      <TitleUpdater title="My Messages" />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <Mail className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">My Messages</h1>
                <p className="text-muted-foreground">
                  {unreadCount > 0 && `${unreadCount} unread message${unreadCount === 1 ? '' : 's'}`}
                  {unreadCount === 0 && 'All messages read'}
                </p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-12">
              {/* Message List */}
              <div className="lg:col-span-5">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      Messages ({messages.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {messages.length === 0 ? (
                      <div className="p-6 text-center text-muted-foreground">
                        <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No messages yet</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            onClick={() => handleMessageClick(message)}
                            className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 border-b last:border-b-0 ${
                              selectedMessage?.id === message.id ? 'bg-muted' : ''
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

              {/* Message Content */}
              <div className="lg:col-span-7">
                <Card className="h-fit">
                  {selectedMessage ? (
                    <>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          {selectedMessage.is_read ? (
                            <MailOpen className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <Mail className="h-5 w-5 text-primary" />
                          )}
                          {selectedMessage.subject}
                        </CardTitle>
                        <CardDescription>
                          <div className="flex items-center gap-4">
                            <span>From: Staff</span>
                            <span>•</span>
                            <span>{new Date(selectedMessage.created_at).toLocaleString()}</span>
                            <Badge variant="outline" className="ml-2">
                              {selectedMessage.message_type}
                            </Badge>
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="prose prose-sm max-w-none">
                          <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                        </div>
                      </CardContent>
                    </>
                  ) : (
                    <CardContent className="p-12 text-center text-muted-foreground">
                      <Mail className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">Select a message to read</p>
                      <p className="text-sm">Choose a message from the list to view its content</p>
                    </CardContent>
                  )}
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserMessages;
