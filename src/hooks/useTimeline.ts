import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { TimelinePost, CreatePostInput } from '@/types/timeline';

export const useTimeline = () => {
  const [posts, setPosts] = useState<TimelinePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('timeline_posts')
        .select(`
          *,
          profile:profiles(username, display_name, avatar_url)
        `)
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      setPosts(data as TimelinePost[]);
    } catch (err: any) {
      console.error('Error fetching timeline posts:', err.message);
      setError('Failed to load posts. Please try again later.');
      toast({
        title: "Error loading timeline",
        description: "We couldn't load the timeline. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (postInput: CreatePostInput) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to post.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setSubmitting(true);
      
      const newPost = {
        user_id: user.id,
        ...postInput
      };
      
      const { data, error } = await supabase
        .from('timeline_posts')
        .insert(newPost)
        .select(`
          *,
          profile:profiles(username, display_name, avatar_url)
        `)
        .single();
        
      if (error) {
        throw error;
      }
      
      setPosts(prev => [data as TimelinePost, ...prev]);
      toast({
        title: "Post created",
        description: "Your post has been published successfully!"
      });
      
      return data;
    } catch (err: any) {
      console.error('Error creating post:', err.message);
      toast({
        title: "Error creating post",
        description: err.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  const deletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('timeline_posts')
        .delete()
        .eq('id', postId);
        
      if (error) {
        throw error;
      }
      
      setPosts(prev => prev.filter(post => post.id !== postId));
      toast({
        title: "Post deleted",
        description: "Your post has been removed."
      });
    } catch (err: any) {
      console.error('Error deleting post:', err.message);
      toast({
        title: "Error deleting post",
        description: err.message || "Could not delete post. Please try again.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchPosts();
    
    // Set up a realtime subscription for new posts
    const channel = supabase
      .channel('public:timeline_posts')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'timeline_posts' 
      }, (payload) => {
        // Skip if we just created this post
        if (posts.some(post => post.id === payload.new.id)) return;
        
        // Otherwise fetch the complete post with profile info
        supabase
          .from('timeline_posts')
          .select(`
            *,
            profile:profiles(username, display_name, avatar_url)
          `)
          .eq('id', payload.new.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setPosts(prev => [data as TimelinePost, ...prev]);
            }
          });
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    posts,
    loading,
    error,
    submitting,
    createPost,
    deletePost,
    refreshPosts: fetchPosts
  };
};
