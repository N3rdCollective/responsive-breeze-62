import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ChatRoom, ChatMessage, ChatPresence } from '@/types/chat';
import { fetchChatRooms, fetchChatMessages, sendChatMessage } from '@/services/chatService';

export const useChat = (roomId?: string) => {
  const { user, isStaff } = useAuth();
  const { toast } = useToast();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<ChatPresence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages within the chat container
  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, []);

  // Load chat rooms
  const loadRooms = useCallback(async () => {
    try {
      const roomsData = await fetchChatRooms();
      setRooms(roomsData || []);
      
      if (roomsData && roomsData.length > 0 && !currentRoom) {
        const targetRoom = roomId ? roomsData.find(r => r.id === roomId) : roomsData[0];
        setCurrentRoom(targetRoom || roomsData[0]);
      }
    } catch (error) {
      console.error('Error loading rooms:', error);
      toast({
        title: "Error",
        description: "Failed to load chat rooms",
        variant: "destructive",
      });
    }
  }, [roomId, currentRoom, toast]);

  // Load messages for current room
  const loadMessages = useCallback(async () => {
    if (!currentRoom) return;
    
    try {
      setIsLoading(true);
      const messagesData = await fetchChatMessages(currentRoom.id);
      console.log('Loaded messages:', messagesData?.length || 0);
      setMessages(messagesData || []);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]); // Ensure messages is never undefined
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentRoom, toast, scrollToBottom]);

  // Send a message
  const sendMessage = useCallback(async (content: string) => {
    if (!currentRoom || !user || !content.trim()) return;

    setIsSending(true);
    try {
      await sendChatMessage(currentRoom.id, content);
      // Message will be added via real-time subscription
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  }, [currentRoom, user, toast]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!currentRoom || !user) return;

    console.log('Setting up real-time subscriptions for room:', currentRoom.id);

    // Subscribe to new messages
    const messagesChannel = supabase
      .channel(`chat-messages-${currentRoom.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${currentRoom.id}`
        },
        async (payload) => {
          console.log('New message received:', payload.new);
          
          // Fetch the user's profile for the new message
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, username, display_name, profile_picture')
            .eq('id', payload.new.user_id)
            .single();

          const transformedMessage = {
            id: payload.new.id,
            room_id: payload.new.room_id,
            user_id: payload.new.user_id,
            content: payload.new.content,
            created_at: payload.new.created_at,
            updated_at: payload.new.updated_at,
            is_deleted: payload.new.is_deleted,
            profile: profile || null
          } as ChatMessage;
          
          setMessages(prev => {
            const currentMessages = Array.isArray(prev) ? prev : [];
            return [...currentMessages, transformedMessage];
          });
          setTimeout(scrollToBottom, 100);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${currentRoom.id}`
        },
        (payload) => {
          console.log('Message updated:', payload.new);
          
          // If message is deleted, remove it from the list
          if (payload.new.is_deleted) {
            console.log('Message deleted, removing from list');
            setMessages(prev => {
              const currentMessages = Array.isArray(prev) ? prev : [];
              return currentMessages.filter(msg => msg.id !== payload.new.id);
            });
          } else {
            // Otherwise, update the message in place
            setMessages(prev => {
              const currentMessages = Array.isArray(prev) ? prev : [];
              return currentMessages.map(msg => 
                msg.id === payload.new.id 
                  ? { ...msg, ...payload.new } as ChatMessage
                  : msg
              );
            });
          }
        }
      )
      .subscribe();

    // Set up presence tracking
    const presenceChannel = supabase.channel(`chat-presence-${currentRoom.id}`)
      .on('presence', { event: 'sync' }, () => {
        const newState = presenceChannel.presenceState();
        const users = Object.values(newState).flat().map((presence: any) => ({
          user_id: presence.user_id || '',
          username: presence.username || 'User',
          display_name: presence.display_name,
          online_at: presence.online_at || new Date().toISOString()
        })) as ChatPresence[];
        setOnlineUsers(users || []);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            user_id: user.id,
            username: user.email?.split('@')[0] || 'User',
            display_name: user.user_metadata?.display_name,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      console.log('Cleaning up subscriptions');
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(presenceChannel);
    };
  }, [currentRoom, user, scrollToBottom]);

  // Load initial data
  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  return {
    rooms,
    messages: Array.isArray(messages) ? messages : [], // Ensure messages is always an array
    currentRoom,
    onlineUsers: Array.isArray(onlineUsers) ? onlineUsers : [], // Ensure onlineUsers is always an array
    isLoading,
    isSending,
    sendMessage,
    setCurrentRoom,
    scrollAreaRef,
    isStaff
  };
};
