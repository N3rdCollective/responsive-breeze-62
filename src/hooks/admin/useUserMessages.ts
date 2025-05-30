
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook for sending messages to users
 */
export const useUserMessages = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const sendUserMessage = async (userId: string, subject: string, message: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        toast({ 
          title: "Authentication Error", 
          description: "You must be logged in to send messages.", 
          variant: "destructive" 
        });
        return false;
      }

      console.log(`Sending message to user ${userId} from ${currentUser.id}`);
      
      const { error: insertError } = await supabase
        .from('user_messages')
        .insert({
          recipient_id: userId,
          sender_id: currentUser.id, 
          subject,
          message,
          message_type: 'admin'
        });

      if (insertError) {
        console.error("Error sending user message:", insertError);
        throw insertError;
      }

      toast({
        title: "Message Sent",
        description: "Your message has been sent to the user.",
      });
      return true;
    } catch (err: any) {
      console.error('Error in sendUserMessage:', err);
      toast({
        title: "Error Sending Message",
        description: `Could not send message. ${err.message}`,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    sendUserMessage,
    loading
  };
};
