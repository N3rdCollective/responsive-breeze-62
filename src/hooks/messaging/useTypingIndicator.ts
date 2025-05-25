
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

const TYPING_EVENT_START = 'TYPING_START';
const TYPING_EVENT_STOP = 'TYPING_STOP';
const TYPING_INDICATOR_TIMEOUT_MS = 3000;

interface UseTypingIndicatorProps {
  conversationId: string | null;
  currentUserId: string | undefined;
  otherParticipantId: string | undefined;
  currentUser: User | null;
}

export const useTypingIndicator = ({
  conversationId,
  currentUserId,
  otherParticipantId,
  currentUser,
}: UseTypingIndicatorProps) => {
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [otherUserTypingName, setOtherUserTypingName] = useState<string | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const supabaseChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const isCurrentUserTypingRef = useRef(false); // Tracks if current user IS typing

  const sendTypingEvent = useCallback((isTyping: boolean) => {
    if (!supabaseChannelRef.current || supabaseChannelRef.current.state !== 'joined') {
      console.log("useTypingIndicator:EVENT_SEND_ABORT - Channel not ready.", { channelState: supabaseChannelRef.current?.state });
      return;
    }
    if (!currentUserId || !currentUser) {
      console.log("useTypingIndicator:EVENT_SEND_ABORT - Missing currentUserId or currentUser.", { currentUserId, hasUser: !!currentUser });
      return;
    }

    if (isTyping === isCurrentUserTypingRef.current && isTyping) {
      // console.log("useTypingIndicator:EVENT_SEND_SKIP - Already sent TYPING_START.");
      return;
    }
    if (!isTyping && !isCurrentUserTypingRef.current) {
      // console.log("useTypingIndicator:EVENT_SEND_SKIP - Already sent TYPING_STOP or wasn't typing.");
      return;
    }

    const event = isTyping ? TYPING_EVENT_START : TYPING_EVENT_STOP;
    const displayName = currentUser.user_metadata?.display_name || currentUser.user_metadata?.username || currentUser.email?.split('@')[0] || 'User';
    const payloadToSend = { userId: currentUserId, userName: displayName };
    
    console.log(`useTypingIndicator:EVENT_SEND_ATTEMPT - Sending ${event} for user ${currentUserId} (${displayName}) on channel conversation-${conversationId}`, payloadToSend);
    supabaseChannelRef.current.send({
      type: 'broadcast',
      event: event,
      payload: payloadToSend,
    }).then(status => {
        console.log(`useTypingIndicator:EVENT_SEND_STATUS - Send status for ${event}: ${status}`);
    }).catch(err => console.error(`useTypingIndicator:EVENT_SEND_ERROR - Error sending ${event} event:`, err));

    isCurrentUserTypingRef.current = isTyping;
  }, [conversationId, currentUserId, currentUser]);

  useEffect(() => {
    console.log(`useTypingIndicator: Effect running. ConversationID: ${conversationId}, CurrentUserID: ${currentUserId}, OtherParticipantID: ${otherParticipantId}`);

    // Cleanup previous channel if it exists and conversationId changes
    if (supabaseChannelRef.current && supabaseChannelRef.current.topic !== `realtime:conversation-${conversationId}`) {
        console.log(`useTypingIndicator: Removing previous channel for ${supabaseChannelRef.current.topic}`);
        supabase.removeChannel(supabaseChannelRef.current).then(status => {
            console.log(`useTypingIndicator: Previous channel removal status: ${status}`);
        });
        supabaseChannelRef.current = null;
        isCurrentUserTypingRef.current = false; // Reset typing state on channel change
    }
    
    if (!conversationId || !currentUserId || !otherParticipantId) {
      console.log("useTypingIndicator: Setup aborted. Missing IDs.");
      setIsOtherUserTyping(false);
      return;
    }

    // If channel already exists for this conversation, don't re-subscribe
    if (supabaseChannelRef.current && supabaseChannelRef.current.topic === `realtime:conversation-${conversationId}`) {
        console.log(`useTypingIndicator: Already subscribed to conversation-${conversationId}. Skipping re-subscription.`);
        return;
    }

    const handleTypingStartInternal = (payload: any) => {
      if (!payload || !payload.payload) {
        console.error("useTypingIndicator: TYPING_START with invalid payload", payload);
        return;
      }
      const { userId: typingUserId, userName: typingUserName } = payload.payload;
      // console.log(`useTypingIndicator:EVENT_RECEIVED - TYPING_START from userId: ${typingUserId}, userName: ${typingUserName}. Current otherParticipantId: ${otherParticipantId}`);
      if (typingUserId === otherParticipantId) {
        // console.log("useTypingIndicator:EVENT_MATCH - TYPING_START matches otherParticipantId.");
        setIsOtherUserTyping(true);
        setOtherUserTypingName(typingUserName || 'Someone');
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          // console.log("useTypingIndicator: Typing indicator timed out.");
          setIsOtherUserTyping(false);
        }, TYPING_INDICATOR_TIMEOUT_MS);
      }
    };

    const handleTypingStopInternal = (payload: any) => {
      if (!payload || !payload.payload) {
        console.error("useTypingIndicator: TYPING_STOP with invalid payload", payload);
        return;
      }
      const { userId: typingUserId } = payload.payload;
      // console.log(`useTypingIndicator:EVENT_RECEIVED - TYPING_STOP from userId: ${typingUserId}. Current otherParticipantId: ${otherParticipantId}`);
      if (typingUserId === otherParticipantId) {
        // console.log("useTypingIndicator:EVENT_MATCH - TYPING_STOP matches otherParticipantId.");
        setIsOtherUserTyping(false);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      }
    };
    
    const newChannel = supabase.channel(`conversation-${conversationId}`, {
      config: { broadcast: { ack: true } },
    });
    console.log(`useTypingIndicator: Creating new channel: conversation-${conversationId}`);

    newChannel
      .on('broadcast', { event: TYPING_EVENT_START }, handleTypingStartInternal)
      .on('broadcast', { event: TYPING_EVENT_STOP }, handleTypingStopInternal)
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log(`useTypingIndicator: SUBSCRIBED to broadcast events on conversation-${conversationId}`);
        } else if (err) {
            console.error(`useTypingIndicator: Broadcast subscription error for conversation-${conversationId}: ${status}`, err);
        } else {
            // console.log(`useTypingIndicator: Broadcast subscription status for conversation-${conversationId}: ${status}`);
        }
      });

    supabaseChannelRef.current = newChannel;

    return () => {
      console.log(`useTypingIndicator: Cleanup. ConversationID: ${conversationId}`);
      if (isCurrentUserTypingRef.current && currentUserId && supabaseChannelRef.current && supabaseChannelRef.current.state === 'joined') {
          console.log(`useTypingIndicator: Sending TYPING_STOP on cleanup for user ${currentUserId}`);
          // Use a local ref to the channel to avoid issues if it's cleared by another effect run
          const channelToClean = supabaseChannelRef.current;
          channelToClean.send({
              type: 'broadcast',
              event: TYPING_EVENT_STOP,
              payload: { userId: currentUserId },
          }).catch(e => console.error("useTypingIndicator: Error sending TYPING_STOP on cleanup:", e));
      }
      
      if (supabaseChannelRef.current) {
        console.log(`useTypingIndicator: Removing channel on cleanup: conversation-${conversationId}`);
        supabase.removeChannel(supabaseChannelRef.current).then(status => {
          console.log(`useTypingIndicator: Channel removal on cleanup status: ${status}`);
        });
        supabaseChannelRef.current = null; // Ensure it's cleared
      }

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      setIsOtherUserTyping(false); // Reset indicator on cleanup
      isCurrentUserTypingRef.current = false; // Reset current user typing state
    };
  }, [conversationId, currentUserId, otherParticipantId, sendTypingEvent]); // sendTypingEvent is stable due to useCallback

  const resetTypingIndicatorState = useCallback(() => {
    console.log("useTypingIndicator: resetTypingIndicatorState called");
    if (isCurrentUserTypingRef.current && currentUserId && supabaseChannelRef.current && supabaseChannelRef.current.state === 'joined') {
        sendTypingEvent(false);
    }
    setIsOtherUserTyping(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    // Do not remove the channel here, it's handled by the main useEffect cleanup or when conversationId changes.
  }, [sendTypingEvent, currentUserId]);

  return {
    isOtherUserTyping,
    otherUserTypingName,
    sendTypingEvent,
    resetTypingIndicatorState,
    isCurrentUserTyping: isCurrentUserTypingRef.current, // expose for direct check if needed
  };
};
