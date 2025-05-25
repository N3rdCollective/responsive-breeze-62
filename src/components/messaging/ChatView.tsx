
import React, { useState, useEffect, useCallback } from 'react';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useFileHandler } from '@/hooks/messaging/useFileHandler';
import { useTypingIndicator } from '@/hooks/messaging/useTypingIndicator';
import MessageList from './ChatView/MessageList';
import MessageInputBar from './ChatView/MessageInputBar';
import TypingIndicatorDisplay from './ChatView/TypingIndicatorDisplay';
import { AlertTriangle } from 'lucide-react';

interface ChatViewProps {
  conversationId: string;
  otherParticipantId: string;
}

const ChatView: React.FC<ChatViewProps> = ({ conversationId, otherParticipantId }) => {
  const { user } = useAuth();
  const currentUserId = user?.id;
  const { toast } = useToast();

  const { messages, isLoading: messagesLoading, isError: messagesError, sendMessage, isSending } = useMessages(conversationId);
  
  const [currentMessageInput, setCurrentMessageInput] = useState('');

  const { 
    selectedFile, 
    previewUrl, 
    fileInputRef, 
    handleFileSelect, 
    removeSelectedFile,
    resetFileState 
  } = useFileHandler();
  
  const { 
    isOtherUserTyping, 
    otherUserTypingName, 
    sendTypingEvent,
    resetTypingIndicatorState,
  } = useTypingIndicator({
    conversationId,
    currentUserId,
    otherParticipantId,
    currentUser: user,
  });

  useEffect(() => {
    if (!conversationId) return;
    const inputTrimmed = currentMessageInput.trim();
    if (inputTrimmed) {
      sendTypingEvent(true);
    } else {
      // Also send stop if there's no text and previously might have been typing
      // The hook's internal isCurrentUserTypingRef handles not sending redundant TYPING_STOP
      sendTypingEvent(false);
    }
  }, [currentMessageInput, sendTypingEvent, conversationId]);

  useEffect(() => {
    console.log(`ChatView: Conversation changed to ${conversationId}. Resetting input states.`);
    setCurrentMessageInput(''); 
    resetFileState(); 
    resetTypingIndicatorState();
  }, [conversationId, resetFileState, resetTypingIndicatorState]); // Added resetTypingIndicatorState

  const handleSendMessageWrapper = useCallback(async (content: string) => {
    const sendStartTime = Date.now();
    // console.log(`ChatView: handleSendMessage called at ${new Date(sendStartTime).toISOString()}`);

    const contentToSend = content.trim(); // Input value from MessageInputBar
    // selectedFile is from useFileHandler in ChatView
    if ((contentToSend === '' && !selectedFile) || !currentUserId || !otherParticipantId) {
      console.error("ChatView: Cannot send message. Missing data (handleSendMessageWrapper).");
      toast({
        title: "Cannot Send Message",
        description: "Message content or file is required, or conversation info is missing.",
        variant: "destructive",
      });
      return;
    }
    
    const finalContent = contentToSend === '' && selectedFile ? "[Image]" : contentToSend;

    // console.log("ChatView: Attempting to send message with (handleSendMessageWrapper):", {
    //   content: finalContent,
    //   fileName: selectedFile?.name,
    // });

    sendMessage(
      { content: finalContent, media_file: selectedFile, otherParticipantId: otherParticipantId },
      {
        onSuccess: () => {
          // console.log(`ChatView: Message sent successfully (mutation onSuccess).`);
          setCurrentMessageInput(''); 
          resetFileState(); 
          // Typing event stop is handled by currentMessageInput change effect
        },
        onError: (error) => {
          console.error(`ChatView: Error sending message (mutation onError). Error:`, error);
          toast({ 
            title: "Message Failed", 
            description: error.message || "Could not send message. Please try again.", 
            variant: "destructive" 
          });
        },
      }
    );
  }, [currentUserId, otherParticipantId, conversationId, sendMessage, toast, resetFileState, selectedFile]);


  if (!conversationId) {
     return (
      <div className="flex flex-col h-full items-center justify-center text-muted-foreground p-4">
        <AlertTriangle size={48} className="mb-4" />
        <p className="text-lg">No conversation selected.</p>
        <p className="text-sm">Please select a conversation to start chatting.</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      <MessageList
        messages={messages}
        isLoading={messagesLoading}
        isError={messagesError}
        currentUserId={currentUserId}
        conversationId={conversationId}
      />
      
      <TypingIndicatorDisplay
        isTyping={isOtherUserTyping}
        userName={otherUserTypingName}
      />

      <MessageInputBar
        onSendMessage={handleSendMessageWrapper}
        isSending={isSending}
        conversationId={conversationId}
        otherParticipantId={otherParticipantId}
        inputValue={currentMessageInput}
        onInputValueChange={setCurrentMessageInput}
        selectedFile={selectedFile}
        previewUrl={previewUrl}
        fileInputRef={fileInputRef}
        onFileSelect={handleFileSelect}
        onRemoveFile={removeSelectedFile}
      />
    </div>
  );
};

export default ChatView;
