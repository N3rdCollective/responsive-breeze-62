
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook for handling user messaging operations
 */
export const useUserMessages = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Send message to user - memoized to prevent recreation
  const sendUserMessage = useCallback(async (userId: string, subject: string, content: string): Promise<boolean> => {
    setLoading(true);
    try {
      console.log(`Sending message to user ${userId}: Subject: "${subject}"`);
      
      // Get current staff member
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !currentUser) {
        throw new Error('Not authenticated as staff member');
      }

      // Get staff details
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('id')
        .eq('id', currentUser.id)
        .single();

      if (staffError || !staffData) {
        throw new Error('Staff member not found');
      }

      // Insert the message
      const { error: insertError } = await supabase
        .from('user_messages')
        .insert({
          recipient_id: userId,
          sender_id: staffData.id,
          subject: subject,
          message: content,
          message_type: 'admin',
          is_read: false
        });

      if (insertError) {
        console.error("Error inserting user message:", insertError);
        throw insertError;
      }

      console.log("User message sent successfully");
      
      toast({
        title: "Message Sent",
        description: "Administrative message has been sent to the user."
      });
      
      return true;
    } catch (err: any) {
      console.error('Error in sendUserMessage:', err);
      toast({
        title: "Error sending message",
        description: `Could not send message. ${err.message}`,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    sendUserMessage,
    loading
  };
};
