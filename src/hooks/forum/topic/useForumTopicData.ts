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
  fetchData: (pageToFetch?: number) => Promise<void>; 
  categorySlug: string | null;
}

const POSTS_PER_PAGE = 10;

export const useForumTopicData = (currentPageFromProp: number): UseForumTopicDataReturn => {
  const { topicSlug: paramTopicSlug } = useParams<{ topicSlug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [topic, setTopic] = useState<ForumTopic | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [viewCountUpdatedForTopic, setViewCountUpdatedForTopic] = useState<string | null>(null);
  const [internalCategorySlug, setInternalCategorySlug] = useState<string | null>(null);

  const fetchTopic = useCallback(async (): Promise<ForumTopic | null> => {
    if (!paramTopicSlug) {
      console.warn('[useForumTopicData] fetchTopic called without paramTopicSlug.');
      return null;
    }

    try {
      console.log('[useForumTopicData] Fetching topic by slug:', paramTopicSlug);
      
      const { data: topicData, error: topicError } = await supabase
        .from('forum_topics')
        .select(`
          *,
          category:forum_categories!inner (slug, name),
          profile:profiles!forum_topics_user_id_fkey (username, display_name, profile_picture)
        `)
        .eq('slug', paramTopicSlug)
        .single();

      console.log('[useForumTopicData] Supabase response for topic query:', { topicSlug: paramTopicSlug, topicData, topicError });

      if (topicError) {
        console.error('[useForumTopicData] Topic fetch error from Supabase:', topicError);
        // Check if the error is PGRST201 - ambiguous relationship
        if (topicError.code === 'PGRST201') {
            toast({
                title: "Data Fetching Issue",
                description: "There's an issue specifying relationships in the data query. Please contact support.",
                variant: "destructive",
            });
        }
        throw new Error(topicError.message);
      }

      if (!topicData) {
        console.warn('[useForumTopicData] Topic not found in DB for slug:', paramTopicSlug, '(topicData is null/undefined)');
        throw new Error('Topic not found');
      }
      
      const fetchedCategorySlug = (topicData as any).category?.slug; // Type assertion for safety
      if (fetchedCategorySlug) {
        setInternalCategorySlug(fetchedCategorySlug);
      } else {
        console.warn('[useForumTopicData] Topic fetched but category slug is missing from topicData.category:', topicData);
        setInternalCategorySlug(null);
      }

      console.log('[useForumTopicData] Topic fetched successfully:', (topicData as any).title); // Type assertion
      return topicData as ForumTopic;

    } catch (err: any) {
      console.error('[useForumTopicData] Error in fetchTopic:', err);
      setError(err.message);
      if (err.message === 'Topic not found' || (err.details && err.details.includes('0 rows'))) {
        toast({
          title: "Error loading topic",
          description: "The topic could not be found.",
          variant: "destructive"
        });
        navigate('/members/forum', { replace: true });
      } else if (err.code !== 'PGRST201') { // Don't show generic toast if already handled PGRST201
         toast({
          title: "Error loading topic",
          description: err.message || "An unexpected error occurred.",
          variant: "destructive"
        });
      }
      return null;
    }
  }, [paramTopicSlug, navigate, toast]);

  const fetchPosts = useCallback(async (topicId: string, pageToFetch: number): Promise<{ posts: ForumPost[]; totalCount: number }> => {
    try {
      console.log(`[useForumTopicData] Fetching posts for topic ${topicId}, page ${pageToFetch}`);
      
      const startIndex = (pageToFetch - 1) * POSTS_PER_PAGE;
      const endIndex = startIndex + POSTS_PER_PAGE - 1;

      const { data: postsData, error: postsError, count } = await supabase
        .from('forum_posts')
        .select(`
          *,
          profile:profiles!forum_posts_user_id_fkey (
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

      if (postsError) {
        console.error('Posts fetch error:', postsError);
        throw new Error(postsError.message);
      }

      const totalCount = count || 0;
      console.log(`[useForumTopicData] Fetched ${postsData?.length || 0} posts, total: ${totalCount}.`);
      
      if (postsData) {
        postsData.forEach((post: any, index: number) => {
          console.log(`[useForumTopicData] Post ${index} profile:`, post.profile ? 'Exists' : 'Missing');
        });
      }

      return {
        posts: postsData as unknown as ForumPost[] || [],
        totalCount
      };

    } catch (err: any) {
      console.error('Error fetching posts:', err);
      throw err; 
    }
  }, []);

  const updateViewCount = useCallback(async (topicId: string) => { // topicId here is the actual UUID
    if (viewCountUpdatedForTopic === topicId) return;

    try {
      console.log(`[useForumTopicData] Updating view count for topic ${topicId}`);
      await supabase.rpc('increment_topic_view_count', { topic_id_param: topicId });
      setViewCountUpdatedForTopic(topicId); 
    } catch (err) {
      console.error('Error updating view count:', err);
    }
  }, [viewCountUpdatedForTopic]);

  const fetchData = useCallback(async (pageToFetch: number = currentPageFromProp) => {
    if (!paramTopicSlug) {
      console.warn('[useForumTopicData] fetchData called without paramTopicSlug. Aborting.');
      setLoadingData(false);
      setError("Topic identifier is missing."); 
      return;
    }

    console.log(`[useForumTopicData] fetchData called for topic slug: ${paramTopicSlug}, page: ${pageToFetch}`);
    setLoadingData(true);
    setError(null); 

    try {
      let currentTopic = topic;
      if (!currentTopic || currentTopic.slug !== paramTopicSlug) {
        console.log(`[useForumTopicData] Topic slug changed or not loaded. Current topic slug: ${currentTopic?.slug}, New slug: ${paramTopicSlug}. Fetching topic details.`);
        const fetchedTopicDetails = await fetchTopic();
        console.log('[useForumTopicData] Result of fetchTopic in fetchData:', fetchedTopicDetails ? `Title: ${fetchedTopicDetails.title}` : 'null');
        
        if (!fetchedTopicDetails) {
          console.warn('[useForumTopicData] fetchTopic returned null in fetchData. Topic likely not found or error occurred.');
          setLoadingData(false);
          return; 
        }
        currentTopic = fetchedTopicDetails;
        setTopic(currentTopic); 
        
        if (!viewCountUpdatedForTopic || (currentTopic && viewCountUpdatedForTopic !== currentTopic.id)) {
             setViewCountUpdatedForTopic(null); 
        }
        
        if (pageToFetch === 1 && currentTopic && currentTopic.id !== viewCountUpdatedForTopic) {
           console.log('[useForumTopicData] Attempting to update view count on initial load/page 1.');
           updateViewCount(currentTopic.id);
        }
      } else if (pageToFetch === 1 && currentTopic && currentTopic.id !== viewCountUpdatedForTopic) {
        console.log('[useForumTopicData] Attempting to update view count on navigating to page 1 for existing topic.');
        updateViewCount(currentTopic.id);
      }


      if (currentTopic) {
        if (!internalCategorySlug && currentTopic.category?.slug) {
            setInternalCategorySlug(currentTopic.category.slug);
            console.log(`[useForumTopicData] Derived internalCategorySlug: ${currentTopic.category.slug}`);
        }
        console.log(`[useForumTopicData] Fetching posts for topic ID: ${currentTopic.id}, page: ${pageToFetch}`);
        const { posts: newPosts, totalCount } = await fetchPosts(currentTopic.id, pageToFetch);
        setPosts(newPosts);
        setTotalPosts(totalCount);
        const calculatedTotalPages = Math.max(1, Math.ceil(totalCount / POSTS_PER_PAGE));
        setTotalPages(calculatedTotalPages);

        console.log(`[useForumTopicData] Data loaded - Topic: ${currentTopic.title}, Page: ${pageToFetch}/${calculatedTotalPages}, Posts count: ${newPosts.length}`);
      } else {
        console.warn('[useForumTopicData] currentTopic is null after attempting to fetch/load. Posts will not be fetched.');
        setLoadingData(false);
      }
    } catch (err: any) {
      console.error('[useForumTopicData] Error in fetchData main try-catch:', err);
      setError(err.message || "An unexpected error occurred while fetching data.");
    } finally {
      setLoadingData(false);
      console.log(`[useForumTopicData] fetchData finally block. Loading: ${loadingData}, Topic set: ${!!topic}`);
    }
  }, [paramTopicSlug, topic, fetchTopic, fetchPosts, updateViewCount, viewCountUpdatedForTopic, currentPageFromProp, internalCategorySlug, toast, navigate]); 

  useEffect(() => {
    console.log(`[useForumTopicData] Effect triggered - TopicSlug: ${paramTopicSlug}, CurrentPageFromProp: ${currentPageFromProp}`);
    if (topic && paramTopicSlug && paramTopicSlug !== topic.slug) {
        console.log(`[useForumTopicData] Topic slug changed from ${topic.slug} to ${paramTopicSlug}. Resetting topic state.`);
        setTopic(null); 
        setInternalCategorySlug(null); 
    }
    if (paramTopicSlug) {
        fetchData(currentPageFromProp);
    } else {
        console.warn("[useForumTopicData] Effect triggered but paramTopicSlug is undefined. Not fetching data.");
        setLoadingData(false);
        setTopic(null);
        setPosts([]);
        setError("Topic slug not available in URL.");
    }
  }, [paramTopicSlug, currentPageFromProp, fetchData]); 

  const refreshData = useCallback(async () => {
    console.log('[useForumTopicData] Refreshing data (full)...');
    setTopic(null); 
    setInternalCategorySlug(null);
    setViewCountUpdatedForTopic(null); 
    if (paramTopicSlug) {
        await fetchData(currentPageFromProp); 
    } else {
        console.warn("[useForumTopicData] refreshData called but paramTopicSlug is undefined. Not fetching.");
        setLoadingData(false);
        setError("Cannot refresh: Topic slug not available.");
    }
  }, [fetchData, currentPageFromProp, paramTopicSlug]);

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
    fetchData,    
    categorySlug: internalCategorySlug,
  };
};
