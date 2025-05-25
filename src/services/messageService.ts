
import { supabase } from '@/integrations/supabase/client';
import { DirectMessage } from '@/types/messaging';
import { toast } from '@/hooks/use-toast';

export const fetchMessagesFromSupabase = async (conversationId: string): Promise<DirectMessage[]> => {
  if (!conversationId) return [];

  const { data, error } = await supabase
    .from('messages')
    .select(`
      id,
      conversation_id,
      sender_id,
      recipient_id,
      content,
      timestamp, 
      is_deleted,
      media_url,
      profile:profiles!messages_sender_id_fkey (id, username, display_name, profile_picture)
    `)
    .eq('conversation_id', conversationId)
    .order('timestamp', { ascending: true });

  if (error) {
    console.error('Error fetching messages (messageService):', error);
    if (error instanceof Error) throw error;
    throw new Error(typeof error === 'string' ? error : 'Failed to fetch messages');
  }
  if (!Array.isArray(data)) {
    console.warn('fetchMessagesFromSupabase: data is not an array', data);
    return [];
  }
  return data.map(msg => ({
    ...msg,
    media_url: msg.media_url || null,
    profile: msg.profile ? {
      id: msg.profile.id,
      username: msg.profile.username,
      display_name: msg.profile.display_name,
      avatar_url: msg.profile.profile_picture
    } : null
  })) as DirectMessage[];
};

export const sendMessageToSupabase = async (newMessage: {
  conversation_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  media_file?: File | null;
}): Promise<DirectMessage> => {
  const funcStartTime = Date.now();
  console.log(`messageService: sendMessageToSupabase called at ${new Date(funcStartTime).toISOString()}`);

  let uploadedMediaUrl: string | null = null;

  if (newMessage.media_file) {
    const file = newMessage.media_file;
    const filePath = `public/${newMessage.conversation_id}/${newMessage.sender_id}_${Date.now()}_${file.name}`;
    
    console.log(`messageService: Attempting to upload media file: ${filePath}`);
    const { error: uploadError } = await supabase.storage
      .from('message_media')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading media file (messageService):', uploadError);
      toast({ title: "Error Uploading File", description: uploadError.message, variant: "destructive" });
      throw uploadError;
    }

    const { data: publicUrlData } = supabase.storage
      .from('message_media')
      .getPublicUrl(filePath);
    
    uploadedMediaUrl = publicUrlData.publicUrl;
    console.log(`messageService: Media file uploaded, public URL: ${uploadedMediaUrl}`);
  }

  const messageToInsert = {
    conversation_id: newMessage.conversation_id,
    sender_id: newMessage.sender_id,
    recipient_id: newMessage.recipient_id,
    content: newMessage.content,
    timestamp: new Date().toISOString(),
    media_url: uploadedMediaUrl,
  };

  let insertStartTime = Date.now();
  console.log(`messageService: Attempting to insert message at ${new Date(insertStartTime).toISOString()}`);
  const { data, error } = await supabase
    .from('messages')
    .insert(messageToInsert)
    .select(`
      id,
      conversation_id,
      sender_id,
      recipient_id,
      content,
      timestamp,
      is_deleted,
      media_url,
      profile:profiles!messages_sender_id_fkey (id, username, display_name, profile_picture)
    `)
    .single();
  const insertEndTime = Date.now();
  console.log(`messageService: Message insert operation took ${insertEndTime - insertStartTime}ms.`);

  if (error) {
    console.error('Error sending message (inserting from messageService):', error);
    toast({ title: "Error Sending Message", description: error.message, variant: "destructive" });
    if (error instanceof Error) throw error;
    throw new Error(typeof error === 'string' ? error : 'Failed to send message (insert)');
  }
   if (!data) {
    console.error('Error sending message (messageService): No data returned after insert.');
    toast({ title: "Error Sending Message", description: "Could not confirm message sent.", variant: "destructive" });
    throw new Error('No data returned after sending message');
  }
  
  const updateConvStartTime = Date.now();
  console.log(`messageService: Attempting to update conversation timestamp at ${new Date(updateConvStartTime).toISOString()}`);
  const { error: convUpdateError } = await supabase
    .from('conversations')
    .update({ last_message_timestamp: new Date().toISOString() })
    .eq('id', newMessage.conversation_id);
  const updateConvEndTime = Date.now();
  console.log(`messageService: Conversation update operation took ${updateConvEndTime - updateConvStartTime}ms.`);
    
  if (convUpdateError) {
    console.error('Error updating conversation timestamp (messageService):', convUpdateError);
    toast({ title: "Warning", description: "Message sent, but failed to update conversation metadata.", variant: "default" });
  }
  
  const funcEndTime = Date.now();
  console.log(`messageService: sendMessageToSupabase finished at ${new Date(funcEndTime).toISOString()}. Total time: ${funcEndTime - funcStartTime}ms`);
  return { 
    ...data,
    media_url: data.media_url || null,
    profile: data.profile ? {
      id: data.profile.id,
      username: data.profile.username,
      display_name: data.profile.display_name,
      avatar_url: data.profile.profile_picture
    } : null 
  } as DirectMessage;
};

