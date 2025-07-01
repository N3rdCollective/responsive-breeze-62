
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import { deleteChatMessage } from '@/services/chatService';
import { useToast } from '@/hooks/use-toast';
import ChatMessageItem from './ChatMessageItem';
import ChatInput from './ChatInput';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Users } from 'lucide-react';

interface ChatRoomProps {
  roomId?: string;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ roomId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    messages,
    currentRoom,
    onlineUsers,
    isLoading,
    isSending,
    sendMessage,
    scrollAreaRef,
    isStaff
  } = useChat(roomId);

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteChatMessage(messageId);
      toast({
        title: "Message deleted",
        description: "The message has been removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Sign in to join the chat</h2>
          <p className="text-muted-foreground">
            You need to be signed in to participate in the chat room.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!currentRoom) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading chat room...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto h-[600px] flex flex-col">
      <CardHeader className="flex-shrink-0 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{currentRoom.name}</CardTitle>
            {currentRoom.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {currentRoom.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {onlineUsers.length} online
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="flex-1">
          <div className="p-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2 text-muted-foreground">Loading messages...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No messages yet. Be the first to say hello! 👋</p>
              </div>
            ) : (
              <div className="space-y-1">
                {messages.map((message) => (
                  <ChatMessageItem
                    key={message.id}
                    message={message}
                    isOwnMessage={message.user_id === user.id}
                    canDelete={isStaff || message.user_id === user.id}
                    onDelete={handleDeleteMessage}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        <ChatInput
          onSendMessage={sendMessage}
          isSending={isSending}
          disabled={!currentRoom}
        />
      </CardContent>
    </Card>
  );
};

export default ChatRoom;
