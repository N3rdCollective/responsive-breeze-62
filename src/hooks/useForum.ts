import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ForumTopic, CreateTopicInput, CreatePostInput, ForumPost, ForumPostReaction } from '@/types/forum';

export const useForum = () => {
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const createTopic = async (input: CreateTopicInput) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create a topic.",
        variant: "destructive"
      });
      return null;
    }
    
    try {
      setSubmitting(true);
      
      // Generate a slug from the title
      const slug = input.title
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 60);
        
      // Create the topic
      const { data: topicData, error: topicError } = await supabase
        .from('forum_topics')
        .insert({
          category_id: input.category_id,
          user_id: user.id,
          title: input.title,
          slug: slug
        })
        .select()
        .single();
        
      if (topicError) throw topicError;
      
      if (!topicData) throw new Error("Failed to create topic");
      
      // Create the first post in the topic
      const { data: postData, error: postError } = await supabase
        .from('forum_posts')
        .insert({
          topic_id: topicData.id,
          user_id: user.id,
          content: input.content
        });
        
      if (postError) throw postError;
      
      toast({
        title: "Topic created",
        description: "Your topic has been created successfully!"
      });
      
      return topicData as ForumTopic;
    } catch (err: any) {
      console.error('Error creating topic:', err.message);
      toast({
        title: "Error creating topic",
        description: err.message || "Failed to create topic. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  const createPost = async (input: CreatePostInput): Promise<ForumPost | null> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to reply to a topic.",
        variant: "destructive"
      });
      return null;
    }
    
    try {
      setSubmitting(true);
      
      const { data, error } = await supabase
        .from('forum_posts')
        .insert({
          topic_id: input.topic_id,
          user_id: user.id,
          content: input.content
        })
        .select(`
          *,
          profile:profiles!forum_posts_user_id_fkey(username, display_name, profile_picture),
          forum_post_reactions (id, user_id, reaction_type)
        `)
        .single();
        
      if (error) throw error;
      
      toast({
        title: "Reply posted",
        description: "Your reply has been posted successfully!"
      });
      
      return data as ForumPost;
    } catch (err: any) {
      console.error('Error posting reply:', err.message);
      toast({
        title: "Error posting reply",
        description: err.message || "Failed to post your reply. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  const updatePost = async (postId: string, content: string): Promise<ForumPost | null> => {
    if (!user) {
      toast({ title: "Authentication required", variant: "destructive" });
      return null;
    }
    try {
      setSubmitting(true);
      const { data, error } = await supabase
        .from('forum_posts')
        .update({ content, is_edited: true, updated_at: new Date().toISOString() })
        .eq('id', postId)
        .eq('user_id', user.id) // Ensure user can only update their own post
        .select(`
          *,
          profile:profiles!forum_posts_user_id_fkey(username, display_name, profile_picture),
          forum_post_reactions (id, user_id, reaction_type)
        `)
        .single();
      if (error) throw error;
      toast({ title: "Post updated", description: "Your post has been updated." });
      return data as ForumPost;
    } catch (err: any) {
      console.error('Error updating post:', err.message);
      toast({ title: "Error updating post", description: err.message, variant: "destructive" });
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  const deletePost = async (postId: string): Promise<boolean> => {
    if (!user) {
      toast({ title: "Authentication required", variant: "destructive" });
      return false;
    }
    try {
      setSubmitting(true);
      const { error } = await supabase
        .from('forum_posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id); // Ensure user can only delete their own post
      if (error) throw error;
      toast({ title: "Post deleted", description: "Your post has been deleted." });
      return true;
    } catch (err: any) {
      console.error('Error deleting post:', err.message);
      toast({ title: "Error deleting post", description: err.message, variant: "destructive" });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const addReaction = async (postId: string, reactionType: 'like'): Promise<ForumPostReaction | null> => {
    if (!user) {
      toast({ title: "Authentication required", variant: "destructive" });
      return null;
    }
    try {
      // No need to set submitting here as it's usually a quick action
      const { data, error } = await supabase
        .from('forum_post_reactions')
        .insert({ post_id: postId, user_id: user.id, reaction_type: reactionType })
        .select()
        .single();
      if (error) {
        // Handle unique constraint violation (already reacted) somewhat gracefully
        if (error.code === '23505') { // Unique violation
          // Optionally, remove existing reaction if logic is "toggle"
          // For now, just inform or silently fail if it's a strict "add only if not exists"
          console.warn("User has already reacted to this post or tried to add duplicate.");
          // If this was a toggle, we'd call removeReaction here.
          // For now, if it fails, it fails. The UI should prevent this.
          return null;
        }
        throw error;
      }
      return data as ForumPostReaction;
    } catch (err: any) {
      console.error('Error adding reaction:', err.message);
      // Don't show toast for reactions usually, can be too noisy
      return null;
    }
  };

  const removeReaction = async (postId: string): Promise<boolean> => {
    if (!user) {
      toast({ title: "Authentication required", variant: "destructive" });
      return false;
    }
    try {
      const { error } = await supabase
        .from('forum_post_reactions')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);
      // If reactionType was part of the key, include it: .eq('reaction_type', reactionType)
      if (error) throw error;
      return true;
    } catch (err: any) {
      console.error('Error removing reaction:', err.message);
      return false;
    }
  };

  const incrementViewCount = async (topicId: string) => {
    try {
      // Call the new RPC function to increment the view count
      await supabase.rpc('increment_topic_view_count', {
        topic_id_param: topicId
      });
    } catch (error) {
      // Silently fail, this is not critical
      console.error('Error incrementing view count:', error);
    }
  };

  return {
    submitting,
    createTopic,
    createPost,
    updatePost,
    deletePost,
    addReaction,
    removeReaction,
    incrementViewCount
  };
};
