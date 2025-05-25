import React, { useState, useEffect, useRef } from 'react';
import { useMessages } from '@/hooks/useMessages';
import MessageItem from './MessageItem';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, MessageCircle, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';

interface ChatViewProps {
  conversationId: string;
  otherParticipantId: string; // Added otherParticipantId
}

const ChatView: React.FC<ChatViewProps> = ({ conversationId, otherParticipantId }) => {
  const { user } = useAuth();
  const currentUserId = user?.id;
  // Note: useMessages hook doesn't need otherParticipantId directly, it's passed through its sendMessage mutate function
  const { messages, isLoading, isError, sendMessage, isSending } = useMessages(conversationId);
  const [newMessageContent, setNewMessageContent] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageContent.trim() || !currentUserId || !otherParticipantId) {
      console.error("Cannot send message: missing content, user ID, or other participant ID.");
      // Optionally, show a toast to the user
      return;
    }
    
    sendMessage(
      { content: newMessageContent.trim(), otherParticipantId: otherParticipantId }, // Pass otherParticipantId
      {
        onSuccess: () => {
          setNewMessageContent('');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full p-4">
        <div className="flex-1 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`flex gap-2 ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
              {i % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full" />}
              <Skeleton className="h-16 w-3/5 rounded-lg" />
              {i % 2 !== 0 && <Skeleton className="h-8 w-8 rounded-full" />}
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <Skeleton className="h-10 flex-1 rounded-md" />
          <Skeleton className="h-10 w-20 rounded-md" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-destructive p-4">
        <AlertTriangle size={48} className="mb-4" />
        <p className="text-lg">Error loading messages.</p>
        <p className="text-sm">Please try again later.</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <MessageCircle size={48} className="mb-4" />
            <p>No messages in this conversation yet.</p>
            <p>Be the first to send a message!</p>
          </div>
        )}
        {messages.map((msg) => (
          <MessageItem key={msg.id} message={msg} currentUserId={currentUserId} />
        ))}
        <div ref={messagesEndRef} />
      </ScrollArea>
      <form onSubmit={handleSendMessage} className="p-4 border-t dark:border-gray-700/50 flex items-center gap-2 bg-background">
        <Input
          type="text"
          placeholder="Type a message..."
          value={newMessageContent}
          onChange={(e) => setNewMessageContent(e.target.value)}
          className="flex-1"
          disabled={isSending}
        />
        <Button type="submit" disabled={!newMessageContent.trim() || isSending || !otherParticipantId}>
          {isSending ? (
            <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-current"></div>
          ) : (
            <Send size={18} />
          )}
          <span className="sr-only">Send message</span>
        </Button>
      </form>
    </div>
  );
};

export default ChatView;
