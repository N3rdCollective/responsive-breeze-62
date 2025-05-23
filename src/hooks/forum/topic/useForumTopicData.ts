import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ForumTopic, ForumPost } from '@/types/forum';

interface UseForumTopicDataReturn {
  topic: ForumTopic | null;
  posts: ForumPost[];
  setPosts: React.Dispatch<React.SetStateAction<ForumPost[]>>;
  loadingData: boolean;
  error: string | null;
  page: number; 
  totalPages: number;
  totalPosts: number;
  refreshData: () => Promise<void>;
  categorySlug: string | null;
}

const POSTS_PER_PAGE = 10;

export const useForumTopicData = (currentPageFromProp: number): UseForumTopicDataReturn => {
  const { categorySlug, topicId } = useParams<{ 
    categorySlug: string; 
    topicId: string; 
  }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [topic, setTopic] = useState<ForumTopic | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [viewCountUpdatedForTopic, setViewCountUpdatedForTopic] = useState<string | null>(null);

  // Fetch topic data (only when topic changes)
  const fetchTopic = useCallback(async (): Promise<ForumTopic | null> => {
    if (!topicId) return null;

    try {
      console.log('[useForumTopicData] Fetching topic:', topicId);
      
      const { data: topicData, error: topicError } = await supabase
        .from('forum_topics')
        .select(`
          *,
          forum_categories!inner(slug),
          profile:profiles!forum_topics_user_id_fkey( 
            username,
            display_name,
            profile_picture
          )
        `)
        .eq('slug', topicId)
        .single();

      if (topicError) {
        console.error('Topic fetch error:', topicError);
        throw new Error(topicError.message);
      }

      if (!topicData) {
        throw new Error('Topic not found');
      }

      const topicCategorySlug = (topicData.forum_categories as any)?.slug; 
      if (topicCategorySlug !== categorySlug) {
        console.warn(`Category mismatch, redirecting from ${categorySlug} to ${topicCategorySlug} for topic ${topicId}`);
        navigate(`/members/forum/${topicCategorySlug}/${topicId}?page=${currentPageFromProp}`, { replace: true });
        return null;
      }

      console.log('[useForumTopicData] Topic fetched successfully:', topicData.title);
      return topicData as unknown as ForumTopic;

    } catch (err: any) {
      console.error('Error fetching topic:', err);
      setError(err.message);
      toast({
        title: "Error loading topic",
        description: err.message,
        variant: "destructive"
      });
      if (err.message === 'Topic not found') {
        navigate('/members/forum', { replace: true });
      }
      return null;
    }
  }, [topicId, categorySlug, navigate, currentPageFromProp, toast]);

  // Fetch posts for current page
  const fetchPosts = useCallback(async (topicId: string, pageToFetch: number): Promise<{ posts: ForumPost[]; totalCount: number }> => {
    try {
      console.log(`[useForumTopicData] Fetching posts for topic ${topicId}, page ${pageToFetch}`);
      
      const startIndex = (pageToFetch - 1) * POSTS_PER_PAGE;
      const endIndex = startIndex + POSTS_PER_PAGE - 1;

      const { data: postsData, error: postsError, count } = await supabase
        .from('forum_posts')
        .select(`
          *,
          profile:profiles(
            username,
            display_name,
            profile_picture
          )
        `, { count: 'exact' })
        .eq('topic_id', topicId)
        .order('created_at', { ascending: true })
        .range(startIndex, endIndex);

      if (postsError) {
        console.error('Posts fetch error:', postsError);
        throw new Error(postsError.message);
      }

      const totalCount = count || 0;
      console.log(`[useForumTopicData] Fetched ${postsData?.length || 0} posts, total: ${totalCount}. Posts data:`, postsData);

      return {
        posts: postsData as unknown as ForumPost[] || [],
        totalCount
      };

    } catch (err: any) {
      console.error('Error fetching posts:', err);
      throw err; 
    }
  }, []);

  // Update view count (only once per topic visit)
  const updateViewCount = useCallback(async (topicId: string) => {
    if (viewCountUpdatedForTopic === topicId) return;

    try {
      console.log(`[useForumTopicData] Updating view count for topic ${topicId}`);
      await supabase.rpc('increment_topic_view_count', { topic_id_param: topicId });
      setViewCountUpdatedForTopic(topicId); 
    } catch (err) {
      console.error('Error updating view count:', err);
    }
  }, [viewCountUpdatedForTopic]);

  // Main data fetching function
  // Uses currentPageFromProp (passed as pageToFetch)
  const fetchData = useCallback(async (pageToFetch: number = currentPageFromProp) => {
    if (!topicId) {
      setLoadingData(false);
      return;
    }

    console.log(`[useForumTopicData] fetchData called for topic: ${topicId}, page: ${pageToFetch}`);
    setLoadingData(true);
    setError(null);

    try {
      let currentTopic = topic;
      if (!currentTopic || currentTopic.slug !== topicId) {
        console.log(`[useForumTopicData] Topic changed or not loaded. Current topic: ${currentTopic?.slug}, New slug: ${topicId}`);
        const fetchedTopicDetails = await fetchTopic();
        if (!fetchedTopicDetails) {
          setLoadingData(false);
          return;
        }
        currentTopic = fetchedTopicDetails;
        setTopic(currentTopic);
        setViewCountUpdatedForTopic(null); 
        if (pageToFetch === 1 && currentTopic.id !== viewCountUpdatedForTopic) {
           updateViewCount(currentTopic.id);
        }
      } else if (pageToFetch === 1 && currentTopic.id !== viewCountUpdatedForTopic) {
        updateViewCount(currentTopic.id);
      }


      if (currentTopic) {
        const { posts: newPosts, totalCount } = await fetchPosts(currentTopic.id, pageToFetch);
        setPosts(newPosts);
        setTotalPosts(totalCount);
        const calculatedTotalPages = Math.max(1, Math.ceil(totalCount / POSTS_PER_PAGE));
        setTotalPages(calculatedTotalPages);

        console.log(`[useForumTopicData] Data loaded - Page: ${pageToFetch}/${calculatedTotalPages}, Posts: ${newPosts.length}`);
      }
    } catch (err: any) {
      console.error('Error in fetchData:', err);
      setError(err.message);
    } finally {
      setLoadingData(false);
    }
  }, [topicId, topic, fetchTopic, fetchPosts, updateViewCount, viewCountUpdatedForTopic, currentPageFromProp]);

  // Effect to fetch data when topicSlug or currentPageFromProp changes.
  useEffect(() => {
    console.log(`[useForumTopicData] Effect triggered - TopicId: ${topicId}, CurrentPageFromProp: ${currentPageFromProp}`);
    if (topic && topicId !== topic.slug) {
        console.log(`[useForumTopicData] Topic slug changed from ${topic.slug} to ${topicId}. Resetting topic state.`);
        setTopic(null); 
    }
    fetchData(currentPageFromProp);
  }, [topicId, currentPageFromProp, fetchData, topic]); 


  // Refresh data function
  const refreshData = useCallback(async () => {
    console.log('[useForumTopicData] Refreshing data...');
    setTopic(null); 
    setViewCountUpdatedForTopic(null); 
    await fetchData(currentPageFromProp);
  }, [fetchData, currentPageFromProp]);

  return {
    topic,
    posts,
    setPosts,
    loadingData,
    error,
    page: currentPageFromProp, 
    totalPages,
    totalPosts,
    refreshData,
    categorySlug: categorySlug || null,
  };
};
