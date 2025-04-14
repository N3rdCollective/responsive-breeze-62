
import { useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { Check, CheckCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Message } from "@/types/messages";

interface MessageListProps {
  messages: Message[];
  userId?: string;
  isLoading: boolean;
}

const MessageList = ({ messages, userId, isLoading }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className={`flex ${i % 2 ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] ${i % 2 ? "bg-primary text-primary-foreground" : "bg-muted"} p-3 rounded-lg`}>
              <Skeleton className={`h-4 w-${Math.floor(Math.random() * 20) + 10}`} />
              <Skeleton className={`h-4 w-${Math.floor(Math.random() * 30) + 5} mt-1`} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div 
          key={message.id}
          className={`flex ${message.sender_id === userId ? "justify-end" : "justify-start"}`}
        >
          <div 
            className={`max-w-[80%] p-3 rounded-lg ${
              message.sender_id === userId 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted"
            }`}
          >
            {message.media_url && (
              <img 
                src={message.media_url} 
                alt="Shared media" 
                className="mb-2 rounded-md max-w-full max-h-60 object-contain"
              />
            )}
            <p>{message.content}</p>
            <div className={`text-xs mt-1 flex items-center justify-end gap-1 ${
              message.sender_id === userId 
                ? "text-primary-foreground/70" 
                : "text-gray-500 dark:text-gray-400"
            }`}>
              <span>{formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}</span>
              {message.sender_id === userId && (
                <>
                  {message.status === 'sent' && <Check className="h-3 w-3" />}
                  {message.status === 'delivered' && <Check className="h-3 w-3" />}
                  {message.status === 'seen' && <CheckCheck className="h-3 w-3" />}
                </>
              )}
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
