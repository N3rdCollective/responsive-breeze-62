
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Message } from "@/types/messages";

interface UseMessageThreadProps {
  conversationId: string;
  userId?: string;
}

export const useMessageThread = ({ conversationId, userId }: UseMessageThreadProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [participant, setParticipant] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!conversationId || !userId) return;

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
        if (convData.participant1_id !== userId && convData.participant2_id !== userId) {
          toast({
            title: "Access denied",
            description: "You are not authorized to view this conversation",
            variant: "destructive",
          });
          navigate("/messages");
          return;
        }

        // Get participant details
        const otherParticipantId = convData.participant1_id === userId 
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
          .or(`and(sender_id.eq.${userId},recipient_id.eq.${otherParticipantId}),and(sender_id.eq.${otherParticipantId},recipient_id.eq.${userId})`)
          .order("timestamp", { ascending: true });

        if (messagesError) throw messagesError;
        
        // Cast status to ensure type compatibility
        const typedMessages = messagesData.map(msg => ({
          ...msg,
          status: msg.status as 'sent' | 'delivered' | 'seen'
        }));
        
        setMessages(typedMessages);

        // Mark received messages as 'seen'
        const unreadMessages = messagesData.filter(m => 
          m.recipient_id === userId && m.status !== 'seen'
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
          filter: `recipient_id=eq.${userId}`
        }, 
        async (payload) => {
          // Add new message to state - ensure proper typing
          const newMessage = {
            ...payload.new as any,
            status: payload.new.status as 'sent' | 'delivered' | 'seen'
          };
          
          setMessages(prevMessages => [...prevMessages, newMessage]);
          
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
              msg.id === payload.new.id ? { 
                ...msg, 
                status: payload.new.status as 'sent' | 'delivered' | 'seen' 
              } : msg
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesSubscription);
    };
  }, [conversationId, userId, navigate, toast]);

  const sendMessage = async (content: string) => {
    if (!content.trim() && !isUploading) return;
    if (!userId || !participant?.id) return;

    try {
      const messageData = {
        sender_id: userId,
        recipient_id: participant.id,
        content: content.trim(),
        status: 'sent' as const,
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

      // Add the new message to our state
      setMessages(prev => [...prev, {
        ...data,
        status: data.status as 'sent' | 'delivered' | 'seen'
      }]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const sendImage = async (file: File) => {
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
      const filePath = `message_media/${userId}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from("message_media")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("message_media")
        .getPublicUrl(filePath);

      // Send message with image
      if (!userId || !participant?.id) return;
      
      const messageData = {
        sender_id: userId,
        recipient_id: participant.id,
        content: "Shared an image",
        media_url: urlData.publicUrl,
        status: 'sent' as const,
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

      // Add the new message to our state with proper typing
      setMessages(prev => [...prev, {
        ...data,
        status: data.status as 'sent' | 'delivered' | 'seen'
      }]);
      
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
    }
  };

  return {
    isLoading,
    messages,
    participant,
    isUploading,
    sendMessage,
    sendImage
  };
};
