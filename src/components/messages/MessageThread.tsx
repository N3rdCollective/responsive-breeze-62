
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, CheckCheck, Image, Send, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  timestamp: string;
  media_url: string | null;
  status: 'sent' | 'delivered' | 'seen';
}

interface ThreadProps {
  conversationId: string;
}

const MessageThread = ({ conversationId }: ThreadProps) => {
  const { user } = useStaffAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [participant, setParticipant] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!conversationId || !user?.id) return;

    const fetchConversationDetails = async () => {
      try {
        setIsLoading(true);
        
        // Get conversation details
        const { data: convData, error: convError } = await supabase
          .from("conversations")
          .select("*")
          .eq("id", conversationId)
          .single();

        if (convError) throw convError;

        // Verify user is part of this conversation
        if (convData.participant1_id !== user.id && convData.participant2_id !== user.id) {
          toast({
            title: "Access denied",
            description: "You are not authorized to view this conversation",
            variant: "destructive",
          });
          navigate("/messages");
          return;
        }

        // Get participant details
        const otherParticipantId = convData.participant1_id === user.id 
          ? convData.participant2_id 
          : convData.participant1_id;

        const { data: participantData, error: participantError } = await supabase
          .from("staff")
          .select("*")
          .eq("id", otherParticipantId)
          .single();

        if (participantError) throw participantError;
        setParticipant(participantData);

        // Get messages
        const { data: messagesData, error: messagesError } = await supabase
          .from("messages")
          .select("*")
          .or(`and(sender_id.eq.${user.id},recipient_id.eq.${otherParticipantId}),and(sender_id.eq.${otherParticipantId},recipient_id.eq.${user.id})`)
          .order("timestamp", { ascending: true });

        if (messagesError) throw messagesError;
        setMessages(messagesData);

        // Mark received messages as 'seen'
        const unreadMessages = messagesData.filter(m => 
          m.recipient_id === user.id && m.status !== 'seen'
        );

        if (unreadMessages.length > 0) {
          for (const msg of unreadMessages) {
            await supabase
              .from("messages")
              .update({ status: 'seen' })
              .eq("id", msg.id);
          }
        }
      } catch (error) {
        console.error("Error fetching conversation:", error);
        toast({
          title: "Error",
          description: "Failed to load conversation",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversationDetails();

    // Set up real-time subscription for messages
    const messagesSubscription = supabase
      .channel(`messages-${conversationId}`)
      .on("postgres_changes", 
        { 
          event: "INSERT", 
          schema: "public", 
          table: "messages",
          filter: `recipient_id=eq.${user.id}`
        }, 
        async (payload) => {
          // Add new message to state
          setMessages(prevMessages => [...prevMessages, payload.new as Message]);
          
          // Mark as seen
          await supabase
            .from("messages")
            .update({ status: 'seen' })
            .eq("id", payload.new.id);
        }
      )
      .on("postgres_changes", 
        { 
          event: "UPDATE", 
          schema: "public", 
          table: "messages"
        },
        (payload) => {
          // Update message status
          setMessages(prevMessages => 
            prevMessages.map(msg => 
              msg.id === payload.new.id ? { ...msg, status: payload.new.status } : msg
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesSubscription);
    };
  }, [conversationId, user?.id, navigate, toast]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() && !isUploading) return;
    if (!user?.id || !participant?.id) return;

    try {
      const messageData = {
        sender_id: user.id,
        recipient_id: participant.id,
        content: newMessage.trim(),
        status: 'sent',
      };

      const { data, error } = await supabase
        .from("messages")
        .insert(messageData)
        .select()
        .single();

      if (error) throw error;

      // Update conversation's last_message_timestamp
      await supabase
        .from("conversations")
        .update({ last_message_timestamp: new Date().toISOString() })
        .eq("id", conversationId);

      setNewMessage("");
      setMessages(prev => [...prev, data]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      
      // Upload image to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `message_media/${user?.id}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from("message_media")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("message_media")
        .getPublicUrl(filePath);

      // Send message with image
      if (!user?.id || !participant?.id) return;
      
      const messageData = {
        sender_id: user.id,
        recipient_id: participant.id,
        content: newMessage.trim() || "Shared an image",
        media_url: urlData.publicUrl,
        status: 'sent',
      };

      const { data, error } = await supabase
        .from("messages")
        .insert(messageData)
        .select()
        .single();

      if (error) throw error;

      // Update conversation's last_message_timestamp
      await supabase
        .from("conversations")
        .update({ last_message_timestamp: new Date().toISOString() })
        .eq("id", conversationId);

      setNewMessage("");
      setMessages(prev => [...prev, data]);
      
      toast({
        title: "Success",
        description: "Image sent successfully",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col p-4">
        <div className="border-b pb-4 mb-4 flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="flex-1 space-y-4">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className={`flex ${i % 2 ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] ${i % 2 ? "bg-primary text-primary-foreground" : "bg-muted"} p-3 rounded-lg`}>
                <Skeleton className={`h-4 w-${Math.floor(Math.random() * 20) + 10}`} />
                <Skeleton className={`h-4 w-${Math.floor(Math.random() * 30) + 5} mt-1`} />
              </div>
            </div>
          ))}
        </div>
        <Skeleton className="h-12 w-full mt-4" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b dark:border-gray-700 p-4 flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={participant?.profile_picture || ""} />
          <AvatarFallback>
            {participant?.display_name
              ? participant.display_name.substring(0, 2).toUpperCase()
              : participant?.email.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium">
            {participant?.display_name || participant?.email}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {participant?.last_active 
              ? `Last active ${formatDistanceToNow(new Date(participant.last_active), { addSuffix: true })}` 
              : ""}
          </p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div 
            key={message.id}
            className={`flex ${message.sender_id === user?.id ? "justify-end" : "justify-start"}`}
          >
            <div 
              className={`max-w-[80%] p-3 rounded-lg ${
                message.sender_id === user?.id 
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
                message.sender_id === user?.id 
                  ? "text-primary-foreground/70" 
                  : "text-gray-500 dark:text-gray-400"
              }`}>
                <span>{formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}</span>
                {message.sender_id === user?.id && (
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
      <div className="p-4 border-t dark:border-gray-700">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImageUpload}
        />
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            title="Send image"
          >
            <Image className="h-5 w-5" />
          </Button>
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isUploading}
            className="flex-1"
          />
          <Button
            size="icon"
            onClick={sendMessage}
            disabled={(!newMessage.trim() && !isUploading) || isUploading}
            title="Send message"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessageThread;
