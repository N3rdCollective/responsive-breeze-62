
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Load chat rooms
  const loadRooms = useCallback(async () => {
    try {
      const roomsData = await fetchChatRooms();
      setRooms(roomsData);
      
      if (roomsData.length > 0 && !currentRoom) {
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
      setMessages(messagesData);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error loading messages:', error);
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
          
          // Fetch the complete message with profile data
          const { data } = await supabase
            .from('chat_messages')
            .select(`
              *,
              profile:profiles!chat_messages_user_id_fkey (
                id,
                username,
                display_name,
                profile_picture
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setMessages(prev => [...prev, data as ChatMessage]);
            setTimeout(scrollToBottom, 100);
          }
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
          setMessages(prev => 
            prev.map(msg => 
              msg.id === payload.new.id 
                ? { ...msg, ...payload.new } as ChatMessage
                : msg
            )
          );
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
        setOnlineUsers(users);
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
    messages,
    currentRoom,
    onlineUsers,
    isLoading,
    isSending,
    sendMessage,
    setCurrentRoom,
    messagesEndRef,
    isStaff
  };
};
