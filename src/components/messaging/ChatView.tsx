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
import { supabase } from '@/integrations/supabase/client';

interface ChatViewProps {
  conversationId: string;
  otherParticipantId: string;
}

const TYPING_EVENT_START = 'TYPING_START';
const TYPING_EVENT_STOP = 'TYPING_STOP';
const TYPING_INDICATOR_TIMEOUT_MS = 3000;

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
  const isCurrentUserTypingRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    console.log(`ChatView: Typing indicator useEffect running. ConversationID: ${conversationId}, CurrentUserID: ${currentUserId}, OtherParticipantID: ${otherParticipantId}`);

    if (supabaseChannelRef.current) {
      console.log(`ChatView: Removing previous channel for conversation-${supabaseChannelRef.current.topic.split('-')[1]}`);
      supabase.removeChannel(supabaseChannelRef.current).then(status => {
        console.log(`ChatView: Previous channel removal status: ${status}`);
      });
      supabaseChannelRef.current = null;
    }

    if (!conversationId || !currentUserId || !otherParticipantId) {
      console.log("ChatView: Typing indicator setup aborted. Missing conversationId, currentUserId, or otherParticipantId.");
      setIsOtherUserTyping(false);
      return;
    }

    const handleTypingStartInternal = (payload: any) => {
      // Ensure payload and payload.payload exist
      if (!payload || !payload.payload) {
        console.error("ChatView: Received TYPING_START with invalid payload structure", payload);
        return;
      }
      const { userId: typingUserId, userName: typingUserName } = payload.payload;
      console.log(`ChatView:EVENT_RECEIVED - TYPING_START from userId: ${typingUserId}, userName: ${typingUserName}. Current otherParticipantId: ${otherParticipantId}`);
      if (typingUserId === otherParticipantId) {
        console.log("ChatView:EVENT_MATCH - TYPING_START matches otherParticipantId. Setting isOtherUserTyping to true.");
        setIsOtherUserTyping(true);
        setOtherUserTypingName(typingUserName || 'Someone');
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          console.log("ChatView: Typing indicator timed out. Setting isOtherUserTyping to false.");
          setIsOtherUserTyping(false);
        }, TYPING_INDICATOR_TIMEOUT_MS);
      } else {
        console.log(`ChatView:EVENT_NO_MATCH - TYPING_START from ${typingUserId} does NOT match otherParticipantId ${otherParticipantId}.`);
      }
    };

    const handleTypingStopInternal = (payload: any) => {
      if (!payload || !payload.payload) {
        console.error("ChatView: Received TYPING_STOP with invalid payload structure", payload);
        return;
      }
      const { userId: typingUserId } = payload.payload;
      console.log(`ChatView:EVENT_RECEIVED - TYPING_STOP from userId: ${typingUserId}. Current otherParticipantId: ${otherParticipantId}`);
      if (typingUserId === otherParticipantId) {
        console.log("ChatView:EVENT_MATCH - TYPING_STOP matches otherParticipantId. Setting isOtherUserTyping to false.");
        setIsOtherUserTyping(false);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      } else {
        console.log(`ChatView:EVENT_NO_MATCH - TYPING_STOP from ${typingUserId} does NOT match otherParticipantId ${otherParticipantId}.`);
      }
    };
    
    const newChannel = supabase.channel(`conversation-${conversationId}`, {
      config: {
        broadcast: { ack: true },
      },
    });
    console.log(`ChatView: Creating new channel: conversation-${conversationId}`);

    newChannel
      .on('broadcast', { event: TYPING_EVENT_START }, handleTypingStartInternal)
      .on('broadcast', { event: TYPING_EVENT_STOP }, handleTypingStopInternal)
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log(`ChatView: Successfully SUBSCRIBED to broadcast events on conversation-${conversationId}`);
        } else if (err) {
            console.error(`ChatView: Broadcast subscription error for conversation-${conversationId}: ${status}`, err);
        } else {
            console.log(`ChatView: Broadcast subscription status for conversation-${conversationId}: ${status}`);
        }
      });

    supabaseChannelRef.current = newChannel;

    return () => {
      console.log(`ChatView: Cleanup for typing indicator. ConversationID: ${conversationId}, CurrentUserID: ${currentUserId}`);
      if (isCurrentUserTypingRef.current && currentUserId && supabaseChannelRef.current && supabaseChannelRef.current.state === 'joined') {
          console.log(`ChatView: Sending TYPING_STOP on cleanup for user ${currentUserId}`);
          supabaseChannelRef.current.send({
              type: 'broadcast',
              event: TYPING_EVENT_STOP,
              payload: { userId: currentUserId },
          }).catch(e => console.error("ChatView: Error sending TYPING_STOP on cleanup:", e));
          isCurrentUserTypingRef.current = false;
      }
      
      if (supabaseChannelRef.current) {
        console.log(`ChatView: Removing channel on cleanup: conversation-${conversationId}`);
        supabase.removeChannel(supabaseChannelRef.current).then(status => {
          console.log(`ChatView: Channel removal on cleanup status: ${status}`);
        });
        supabaseChannelRef.current = null;
      }

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      setIsOtherUserTyping(false);
    };
  }, [conversationId, currentUserId, otherParticipantId]);

  useEffect(() => {
    console.log(`ChatView: Conversation changed to ${conversationId}. Resetting file/input/typing states.`);
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
    setNewMessageContent(''); 
    if (isCurrentUserTypingRef.current && currentUserId && supabaseChannelRef.current && supabaseChannelRef.current.state === 'joined') {
        sendTypingEvent(false); 
    }
    setIsOtherUserTyping(false); 

  }, [conversationId]); 

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
    if (!supabaseChannelRef.current || supabaseChannelRef.current.state !== 'joined') {
      console.log("ChatView:EVENT_SEND_ABORT - sendTypingEvent - Channel not ready or doesn't exist.", { channelState: supabaseChannelRef.current?.state });
      return;
    }
    if (!currentUserId || !user) {
        console.log("ChatView:EVENT_SEND_ABORT - sendTypingEvent - Missing currentUserId or user.", { currentUserId, hasUser: !!user });
        return;
    }
    
    if (isTyping === isCurrentUserTypingRef.current && isTyping) {
        console.log("ChatView:EVENT_SEND_SKIP - sendTypingEvent - Already sent TYPING_START.");
        return; 
    }
    if (!isTyping && !isCurrentUserTypingRef.current) {
        console.log("ChatView:EVENT_SEND_SKIP - sendTypingEvent - Already sent TYPING_STOP or wasn't typing.");
        return;
    }

    const event = isTyping ? TYPING_EVENT_START : TYPING_EVENT_STOP;
    const displayName = user.user_metadata?.display_name || user.user_metadata?.username || user.email?.split('@')[0] || 'User';
    const payloadToSend = { userId: currentUserId, userName: displayName };
    
    console.log(`ChatView:EVENT_SEND_ATTEMPT - Attempting to send ${event} for user ${currentUserId} (${displayName}) on channel conversation-${conversationId}`, payloadToSend);
    supabaseChannelRef.current.send({
      type: 'broadcast',
      event: event,
      payload: payloadToSend,
    }).then(status => {
        console.log(`ChatView:EVENT_SEND_STATUS - Send status for ${event}: ${status}`);
    }).catch(err => console.error(`ChatView:EVENT_SEND_ERROR - Error sending ${event} event:`, err));

    isCurrentUserTypingRef.current = isTyping;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newContent = e.target.value;
    setNewMessageContent(newContent);
    console.log(`ChatView: Input changed. New content: "${newContent}". Current typing state: ${isCurrentUserTypingRef.current}`);
    if (newContent.trim() && !isCurrentUserTypingRef.current) {
      console.log("ChatView: Input has content, was not typing. Sending TYPING_START.");
      sendTypingEvent(true);
    } else if (!newContent.trim() && isCurrentUserTypingRef.current) {
      console.log("ChatView: Input is empty, was typing. Sending TYPING_STOP.");
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
          if (isCurrentUserTypingRef.current) { 
            console.log("ChatView: Message sent, was typing. Sending TYPING_STOP.");
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
            onChange={handleInputChange}
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
