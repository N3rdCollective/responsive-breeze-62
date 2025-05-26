
import { useNavigate } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import { useConversations } from '@/hooks/useConversations';
import { useToast } from '@/hooks/use-toast';

interface UseDirectMessagingHandlerProps {
  currentUser: User | null;
}

export const useDirectMessagingHandler = ({ currentUser }: UseDirectMessagingHandlerProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { startOrCreateConversation } = useConversations();

  const handleStartDirectMessage = async (targetUserId: string) => {
    if (!currentUser) {
      toast({ title: "Authentication required", description: "Please log in to send messages.", variant: "destructive" });
      navigate('/auth');
      return;
    }
    if (currentUser.id === targetUserId) {
      toast({ title: "Info", description: "You cannot start a conversation with yourself.", variant: "default" });
      return;
    }
    try {
      const conversationId = await startOrCreateConversation(targetUserId);
      if (conversationId) {
        navigate('/messages', { state: { selectConversationWithUser: targetUserId, conversationId: conversationId } });
      } else {
        toast({ title: "Error", description: "Could not start or find conversation.", variant: "destructive" });
      }
    } catch (error: any) {
      console.error("Failed to start direct message:", error);
      toast({ title: "Error", description: error.message || "Failed to start conversation.", variant: "destructive" });
    }
  };

  return { handleStartDirectMessage };
};
