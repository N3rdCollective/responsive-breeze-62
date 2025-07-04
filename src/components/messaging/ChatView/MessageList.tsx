
import React, { useRef, forwardRef, useImperativeHandle } from 'react';
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

export interface MessageListRef {
  scrollToBottom: (behavior?: ScrollBehavior) => void;
}

const MessageList = forwardRef<MessageListRef, MessageListProps>(({ messages, isLoading, isError, currentUserId, conversationId }, ref) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useImperativeHandle(ref, () => ({
    scrollToBottom
  }));

  if (isLoading) {
    return (
      <div className="h-full p-4 space-y-4 overflow-hidden">
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
      <div className="h-full flex flex-col items-center justify-center text-destructive p-4">
        <AlertTriangle size={48} className="mb-4" />
        <p className="text-lg">Error loading messages.</p>
        <p className="text-sm">Please try again later.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground min-h-[300px]">
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
});

MessageList.displayName = 'MessageList';

export default MessageList;
