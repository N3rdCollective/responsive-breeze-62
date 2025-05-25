
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ForumPost } from '@/types/forum';

export interface UseFetchTopicPostsReturn {
  posts: ForumPost[];
  isLoadingPosts: boolean;
  postsError: string | null;
  totalPages: number;
  totalPosts: number;
  fetchPostsPage: (topicId: string, pageToFetch: number, postsPerPage: number) => Promise<void>;
  setPosts: React.Dispatch<React.SetStateAction<ForumPost[]>>;
  setTotalPosts: React.Dispatch<React.SetStateAction<number>>;
  setTotalPages: React.Dispatch<React.SetStateAction<number>>;
}

export const useFetchTopicPosts = (): UseFetchTopicPostsReturn => {
  const { toast } = useToast();

  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);

  const fetchPostsPage = useCallback(async (topicId: string, pageToFetch: number, postsPerPage: number) => {
    console.log(`[useFetchTopicPosts] Fetching posts for topic ${topicId}, page ${pageToFetch}`);
    setIsLoadingPosts(true);
    setPostsError(null);

    try {
      const startIndex = (pageToFetch - 1) * postsPerPage;
      const endIndex = startIndex + postsPerPage - 1;

      const { data: postsData, error: postsFetchError, count } = await supabase
        .from('forum_posts')
        .select(`
          *,
          profile:profiles!user_id ( 
            username,
            display_name,
            profile_picture
          ),
          forum_post_reactions (
            id,
            user_id,
            reaction_type
          )
        `, { count: 'exact' })
        .eq('topic_id', topicId)
        .order('created_at', { ascending: true })
        .range(startIndex, endIndex);

      if (postsFetchError) {
        console.error('[useFetchTopicPosts] Posts fetch error:', postsFetchError);
        if (postsFetchError.code === 'PGRST201') {
            toast({
                title: "Data Fetching Issue (Posts)",
                description: "There's an issue specifying relationships in the post data query. Details: " + postsFetchError.message,
                variant: "destructive",
            });
        }
        throw new Error(postsFetchError.message);
      }

      const fetchedTotalCount = count || 0;
      console.log(`[useFetchTopicPosts] Fetched ${postsData?.length || 0} posts, total: ${fetchedTotalCount}.`);
      
      setPosts((postsData as unknown as ForumPost[]) || []);
      setTotalPosts(fetchedTotalCount);
      const calculatedTotalPages = Math.max(1, Math.ceil(fetchedTotalCount / postsPerPage));
      setTotalPages(calculatedTotalPages);

    } catch (err: any) {
      console.error('[useFetchTopicPosts] Error fetching posts:', err);
      setPostsError(err.message);
      if (err.code !== 'PGRST201') {
        toast({
          title: "Error loading posts",
          description: err.message || "An unexpected error occurred while fetching posts.",
          variant: "destructive",
        });
      }
      // Do not throw here, allow main hook to handle overall error state
    } finally {
      setIsLoadingPosts(false);
    }
  }, [toast]);

  return { posts, isLoadingPosts, postsError, totalPages, totalPosts, fetchPostsPage, setPosts, setTotalPosts, setTotalPages };
};
