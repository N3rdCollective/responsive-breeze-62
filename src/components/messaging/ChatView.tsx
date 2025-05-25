import React, { useState, useEffect, useRef } from 'react';
import { useMessages } from '@/hooks/useMessages';
import MessageItem from './MessageItem';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, MessageCircle, AlertTriangle, Paperclip, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client'; // Import Supabase client

interface ChatViewProps {
  conversationId: string;
  otherParticipantId: string;
  // It would be good to pass otherParticipantName here if available from parent
  // For now, we'll try to derive it or use a generic name.
}

const TYPING_EVENT_START = 'TYPING_START';
const TYPING_EVENT_STOP = 'TYPING_STOP';
const TYPING_INDICATOR_TIMEOUT_MS = 3000; // 3 seconds

const ChatView: React.FC<ChatViewProps> = ({ conversationId, otherParticipantId }) => {
  const { user } = useAuth();
  const currentUserId = user?.id;
  const { messages, isLoading, isError, sendMessage, isSending } = useMessages(conversationId);
  const [newMessageContent, setNewMessageContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [otherUserTypingName, setOtherUserTypingName] = useState<string | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const supabaseChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const isCurrentUserTypingRef = useRef(false); // Tracks if current user is marked as typing

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Effect for handling typing indicators and Supabase channel
  useEffect(() => {
    // Cleanup previous channel instance when dependencies change or component unmounts
    if (supabaseChannelRef.current) {
      supabase.removeChannel(supabaseChannelRef.current);
      supabaseChannelRef.current = null; // Important to nullify
    }

    // If essential data isn't available, don't set up a new channel
    if (!conversationId || !currentUserId || !otherParticipantId) {
      setIsOtherUserTyping(false); // Reset typing state
      return; // Exit early
    }

    // Define handlers within the effect to capture current 'otherParticipantId'
    // These handlers are redefined on each effect run if their dependencies change,
    // ensuring they use the latest values.
    const handleTypingStartInternal = (payload: any) => {
      const { userId: typingUserId, userName: typingUserName } = payload.payload;
      if (typingUserId === otherParticipantId) { // Uses up-to-date otherParticipantId
        setIsOtherUserTyping(true);
        setOtherUserTypingName(typingUserName || 'Someone');
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setIsOtherUserTyping(false);
        }, TYPING_INDICATOR_TIMEOUT_MS);
      }
    };

    const handleTypingStopInternal = (payload: any) => {
      const { userId: typingUserId } = payload.payload;
      if (typingUserId === otherParticipantId) { // Uses up-to-date otherParticipantId
        setIsOtherUserTyping(false);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      }
    };
    
    // Create a new channel instance for this effect run
    const newChannel = supabase.channel(`conversation-${conversationId}`, {
      config: {
        broadcast: { ack: true }, // ack can be useful for knowing if send was received by server
      },
    });

    newChannel
      .on('broadcast', { event: TYPING_EVENT_START }, handleTypingStartInternal)
      .on('broadcast', { event: TYPING_EVENT_STOP }, handleTypingStopInternal)
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`ChatView: Subscribed to broadcast events on conversation-${conversationId}`);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.error(`ChatView: Broadcast subscription error for conversation-${conversationId}: ${status}`);
        }
      });

    supabaseChannelRef.current = newChannel; // Store the new channel instance

    // Return a cleanup function
    return () => {
      // Send a stop typing event if the user was typing when component unmounts or conversation changes
      if (isCurrentUserTypingRef.current && currentUserId && supabaseChannelRef.current) {
          // Use the channel instance from THIS effect run
          supabaseChannelRef.current.send({
              type: 'broadcast',
              event: TYPING_EVENT_STOP,
              payload: { userId: currentUserId },
          });
          isCurrentUserTypingRef.current = false;
      }
      
      // Remove the channel instance created in THIS effect run
      if (supabaseChannelRef.current) {
        supabase.removeChannel(supabaseChannelRef.current);
        supabaseChannelRef.current = null; // Nullify after removal
      }

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      setIsOtherUserTyping(false); // Reset on unmount/change
    };
  }, [conversationId, currentUserId, otherParticipantId]); // Effect dependencies

  useEffect(() => {
    // Reset file selection and typing status when conversation changes
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
    setNewMessageContent(''); // Clear input field
    if (isCurrentUserTypingRef.current && currentUserId && supabaseChannelRef.current) {
        sendTypingEvent(false); // send stop if was typing
    }
    setIsOtherUserTyping(false); // Reset other user typing indicator

  }, [conversationId]); // currentUserId not needed here as sendTypingEvent checks it

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl); // Clean up
  }, [selectedFile]);

  const sendTypingEvent = (isTyping: boolean) => {
    if (!supabaseChannelRef.current || !currentUserId || !user) return;
    
    // Only send if state actually changes
    if (isTyping === isCurrentUserTypingRef.current && isTyping) return; // Already sent start
    if (!isTyping && !isCurrentUserTypingRef.current) return; // Already sent stop or wasn't typing

    const event = isTyping ? TYPING_EVENT_START : TYPING_EVENT_STOP;
    const displayName = user.user_metadata?.display_name || user.user_metadata?.username || user.email?.split('@')[0] || 'User';
    
    supabaseChannelRef.current.send({
      type: 'broadcast',
      event: event,
      payload: { userId: currentUserId, userName: displayName },
    }).catch(err => console.error("Error sending typing event:", err));

    isCurrentUserTypingRef.current = isTyping;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newContent = e.target.value;
    setNewMessageContent(newContent);

    if (newContent.trim() && !isCurrentUserTypingRef.current) {
      sendTypingEvent(true);
    } else if (!newContent.trim() && isCurrentUserTypingRef.current) {
      sendTypingEvent(false);
    }
  };
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ title: "File too large", description: "Please select an image smaller than 5MB.", variant: "destructive" });
        if(event.target) event.target.value = ""; 
        return;
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast({ title: "Invalid file type", description: "Please select a JPG, PNG, GIF, or WEBP image.", variant: "destructive" });
        if(event.target) event.target.value = "";
        return;
      }
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; 
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const sendStartTime = Date.now();
    console.log(`ChatView: handleSendMessage called at ${new Date(sendStartTime).toISOString()}`);

    const contentToSend = newMessageContent.trim();
    if ((contentToSend === '' && !selectedFile) || !currentUserId || !otherParticipantId) {
      console.error("ChatView: Cannot send message. Missing data.", {
        content: contentToSend || (selectedFile ? "[FileSelected]" : "Empty"),
        selectedFile: selectedFile ? selectedFile.name : "None",
        currentUserId: currentUserId || "Missing currentUserId",
        otherParticipantId: otherParticipantId || "Missing otherParticipantId",
        conversationId: conversationId || "Missing conversationId"
      });
      toast({
        title: "Cannot Send Message",
        description: "Message content or file is required, or conversation info is missing.",
        variant: "destructive",
      });
      return;
    }
    
    const finalContent = contentToSend === '' && selectedFile ? "[Image]" : contentToSend;

    console.log("ChatView: Attempting to send message with:", {
      content: finalContent,
      fileName: selectedFile?.name,
      otherParticipantId: otherParticipantId,
      conversationId: conversationId,
      currentUserId: currentUserId,
    });

    sendMessage(
      { content: finalContent, media_file: selectedFile, otherParticipantId: otherParticipantId },
      {
        onSuccess: () => {
          const successTime = Date.now();
          console.log(`ChatView: Message sent successfully (mutation onSuccess) at ${new Date(successTime).toISOString()}. Total time: ${successTime - sendStartTime}ms`);
          setNewMessageContent('');
          setSelectedFile(null);
          setPreviewUrl(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          if (isCurrentUserTypingRef.current) { // Send stop typing after message sent
            sendTypingEvent(false);
          }
        },
        onError: (error) => {
          const errorTime = Date.now();
          console.error(`ChatView: Error sending message (mutation onError) at ${new Date(errorTime).toISOString()}. Total time: ${errorTime - sendStartTime}ms. Error:`, error);
          toast({ 
            title: "Message Failed", 
            description: error.message || "Could not send message. Please try again.", 
            variant: "destructive" 
          });
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
      
      {isOtherUserTyping && (
        <div className="px-4 pb-1 text-xs text-muted-foreground italic h-4">
          {otherUserTypingName || 'Someone'} is typing...
        </div>
      )}
      {!isOtherUserTyping && <div className="h-4 px-4 pb-1"></div>} {/* Placeholder to prevent layout jump */}

      <div className="p-4 border-t dark:border-gray-700/50 bg-background">
        {previewUrl && selectedFile && (
          <div className="mb-2 p-2 border rounded-md relative max-w-xs">
            <img src={previewUrl} alt="Preview" className="max-h-40 rounded-md" />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 bg-black/50 hover:bg-black/70 text-white rounded-full"
              onClick={removeSelectedFile}
            >
              <XCircle size={16} />
              <span className="sr-only">Remove image</span>
            </Button>
            <p className="text-xs text-muted-foreground truncate mt-1">{selectedFile.name}</p>
          </div>
        )}
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileSelect}
            ref={fileInputRef}
            className="hidden"
            disabled={isSending || !conversationId}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending || !conversationId}
            aria-label="Attach file"
          >
            <Paperclip size={18} />
          </Button>
          <Input
            type="text"
            placeholder="Type a message..."
            value={newMessageContent}
            onChange={handleInputChange} // Changed to custom handler
            className="flex-1"
            disabled={isSending || !conversationId}
          />
          <Button type="submit" disabled={(!newMessageContent.trim() && !selectedFile) || isSending || !otherParticipantId || !conversationId}>
            {isSending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-current"></div>
            ) : (
              <Send size={18} />
            )}
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatView;
