
import { useStaffAuth } from "@/hooks/useStaffAuth";
import { useMessageThread } from "@/hooks/useMessageThread";
import MessageHeader from "./MessageHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

interface ThreadProps {
  conversationId: string;
}

const MessageThread = ({ conversationId }: ThreadProps) => {
  const { user } = useStaffAuth();
  const { 
    isLoading, 
    messages, 
    participant, 
    isUploading, 
    sendMessage, 
    sendImage 
  } = useMessageThread({ 
    conversationId, 
    userId: user?.id 
  });

  return (
    <div className="h-full flex flex-col">
      <MessageHeader participant={participant} isLoading={isLoading} />
      <MessageList messages={messages} userId={user?.id} isLoading={isLoading} />
      <MessageInput 
        onSendMessage={sendMessage} 
        onSendImage={sendImage} 
        isUploading={isUploading} 
      />
    </div>
  );
};

export default MessageThread;
