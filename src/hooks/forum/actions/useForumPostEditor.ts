
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ForumPost } from '@/types/forum';

export const useForumPostEditor = () => {
  const [submittingUpdate, setSubmittingUpdate] = useState(false);
  const [submittingDelete, setSubmittingDelete] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const updatePost = async (postId: string, content: string): Promise<ForumPost | null> => {
    if (!user) {
      toast({ title: "Authentication required", variant: "destructive" });
      return null;
    }
    try {
      setSubmittingUpdate(true);
      const { data, error } = await supabase
        .from('forum_posts')
        .update({ content, is_edited: true, updated_at: new Date().toISOString() })
        .eq('id', postId)
        .eq('user_id', user.id)
        .select(`
          *,
          profile:profiles!forum_posts_user_id_fkey(username, display_name, profile_picture),
          forum_post_reactions (id, user_id, reaction_type)
        `)
        .single();
      if (error) throw error;
      if (!data) throw new Error("Failed to update post, no data returned.");
      toast({ title: "Post updated", description: "Your post has been updated." });
      return data as ForumPost;
    } catch (err: any) {
      console.error('Error updating post:', err.message);
      toast({ title: "Error updating post", description: err.message, variant: "destructive" });
      return null;
    } finally {
      setSubmittingUpdate(false);
    }
  };

  const deletePost = async (postId: string): Promise<boolean> => {
    if (!user) {
      toast({ title: "Authentication required", variant: "destructive" });
      return false;
    }
    try {
      setSubmittingDelete(true);
      // Potential: Before deleting post, check if it's the last post in a topic.
      // If so, and if business logic dictates, delete the topic or update its last_post_at.
      // For now, simple deletion.
      const { error } = await supabase
        .from('forum_posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id);
      if (error) throw error;
      toast({ title: "Post deleted", description: "Your post has been deleted." });
      return true;
    } catch (err: any) {
      console.error('Error deleting post:', err.message);
      toast({ title: "Error deleting post", description: err.message, variant: "destructive" });
      return false;
    } finally {
      setSubmittingDelete(false);
    }
  };
  
  return { 
    updatePost, 
    submittingUpdate, 
    deletePost, 
    submittingDelete 
  };
};
