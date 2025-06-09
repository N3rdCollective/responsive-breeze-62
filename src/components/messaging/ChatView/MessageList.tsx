
import React, { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import MessageItem from '../MessageItem';
import { DirectMessage } from '@/types/messaging';
import { MessageCircle, AlertTriangle } from 'lucide-react';

interface MessageListProps {
  messages: DirectMessage[];
  isLoading: boolean;
  isError: boolean;
  currentUserId: string | undefined;
  conversationId: string | null;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading, isError, currentUserId, conversationId }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom(messages.length > 0 ? "smooth" : "auto");
  }, [messages, conversationId]);

  if (isLoading) {
    return (
      <div className="flex-1 p-4 space-y-4 max-h-[60vh] overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`flex gap-2 ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
            {i % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full" />}
            <Skeleton className="h-16 w-3/5 rounded-lg" />
            {i % 2 !== 0 && <Skeleton className="h-8 w-8 rounded-full" />}
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-destructive p-4 max-h-[60vh]">
        <AlertTriangle size={48} className="mb-4" />
        <p className="text-lg">Error loading messages.</p>
        <p className="text-sm">Please try again later.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 max-h-[60vh] md:max-h-[65vh]">
      <div className="p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground min-h-[200px]">
            <MessageCircle size={48} className="mb-4" />
            <p>No messages in this conversation yet.</p>
            <p>Be the first to send a message!</p>
          </div>
        )}
        {messages.map((msg) => (
          <MessageItem key={msg.id} message={msg} currentUserId={currentUserId} />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};

export default MessageList;
