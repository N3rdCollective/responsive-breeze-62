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
          profile:profiles!user_id ( 
            username,
            display_name,
            profile_picture
          )
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
                description: "There's an issue specifying relationships in the data query. Please contact support. Details: " + topicError.message,
                variant: "destructive",
            });
        }
        throw new Error(topicError.message);
      }

      if (!topicData) {
        console.warn('[useForumTopicData] Topic not found in DB for slug:', paramTopicSlug, '(topicData is null/undefined)');
        throw new Error('Topic not found');
      }
      
      const fetchedCategorySlug = (topicData as any).category?.slug;
      if (fetchedCategorySlug) {
        setInternalCategorySlug(fetchedCategorySlug);
      } else {
        console.warn('[useForumTopicData] Topic fetched but category slug is missing from topicData.category:', topicData);
        setInternalCategorySlug(null);
      }

      console.log('[useForumTopicData] Topic fetched successfully:', (topicData as any).title);
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
      } else if (err.code !== 'PGRST201') { 
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

      // Note: If a similar ambiguity error occurs for posts, this select might also need adjustment
      // from profile:profiles!forum_posts_user_id_fkey to profile:profiles!user_id
      const { data: postsData, error: postsError, count } = await supabase
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

      if (postsError) {
        console.error('Posts fetch error:', postsError);
        // Add specific check for PGRST201 for posts if it becomes an issue
        if (postsError.code === 'PGRST201') {
            toast({
                title: "Data Fetching Issue (Posts)",
                description: "There's an issue specifying relationships in the post data query. Details: " + postsError.message,
                variant: "destructive",
            });
        }
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
      if (err.code !== 'PGRST201') {
        toast({
          title: "Error loading posts",
          description: err.message || "An unexpected error occurred while fetching posts.",
          variant: "destructive",
        });
      }
      throw err; 
    }
  }, [toast]); // Added toast to dependency array

  const updateViewCount = useCallback(async (topicId: string) => {
    if (viewCountUpdatedForTopic === topicId) return;

    try {
      console.log(`[useForumTopicData] Updating view count for topic ${topicId}`);
      await supabase.rpc('increment_topic_view_count', { topic_id_param: topicId });
      setViewCountUpdatedForTopic(topicId); 
    } catch (err) {
      console.error('Error updating view count:', err);
      // Optionally, add a toast for view count update failure if desired
    }
  }, [viewCountUpdatedForTopic]);

  const fetchData = useCallback(async (pageToFetch: number = currentPageFromProp) => {
    if (!paramTopicSlug) {
      console.warn('[useForumTopicData] fetchData called without paramTopicSlug. Aborting.');
      setLoadingData(false);
      setError("Topic identifier is missing."); 
      navigate('/members/forum', { replace: true }); // Navigate away if slug is missing
      return;
    }

    console.log(`[useForumTopicData] fetchData called for topic slug: ${paramTopicSlug}, page: ${pageToFetch}`);
    setLoadingData(true);
    setError(null); 

    try {
      let currentTopic = topic;
      // Fetch topic details if slug changed, or topic is not loaded, or if topic.profile is missing (potential indicator of previous fetch issue)
      if (!currentTopic || currentTopic.slug !== paramTopicSlug || !currentTopic.profile) {
        console.log(`[useForumTopicData] Topic slug changed, not loaded, or profile missing. Current topic slug: ${currentTopic?.slug}, New slug: ${paramTopicSlug}. Fetching topic details.`);
        const fetchedTopicDetails = await fetchTopic();
        console.log('[useForumTopicData] Result of fetchTopic in fetchData:', fetchedTopicDetails ? `Title: ${fetchedTopicDetails.title}` : 'null');
        
        if (!fetchedTopicDetails) {
          console.warn('[useForumTopicData] fetchTopic returned null in fetchData. Topic likely not found or error occurred.');
          // Error handling for topic not found is now inside fetchTopic, including navigation.
          // If fetchTopic returns null, it means it already handled the error toast and navigation if necessary.
          setLoadingData(false); 
          return; 
        }
        currentTopic = fetchedTopicDetails;
        setTopic(currentTopic); 
        
        // Reset view count tracking if topic ID changes
        if (!viewCountUpdatedForTopic || (currentTopic && viewCountUpdatedForTopic !== currentTopic.id)) {
             setViewCountUpdatedForTopic(null); 
        }
        
        // Update view count if on page 1 and topic exists and view count not yet updated for this topic ID
        if (pageToFetch === 1 && currentTopic && currentTopic.id !== viewCountUpdatedForTopic) {
           console.log('[useForumTopicData] Attempting to update view count on initial load/page 1.');
           await updateViewCount(currentTopic.id); // Ensure await here
        }
      } else if (pageToFetch === 1 && currentTopic && currentTopic.id !== viewCountUpdatedForTopic) {
        // This case handles navigating back to page 1 for an already loaded topic
        console.log('[useForumTopicData] Attempting to update view count on navigating to page 1 for existing topic.');
        await updateViewCount(currentTopic.id); // Ensure await here
      }


      if (currentTopic) {
        // Ensure category slug is set if available from the current topic
        if (!internalCategorySlug && currentTopic.category?.slug) {
            setInternalCategorySlug(currentTopic.category.slug);
            console.log(`[useForumTopicData] Derived internalCategorySlug: ${currentTopic.category.slug}`);
        } else if (internalCategorySlug && currentTopic.category?.slug && internalCategorySlug !== currentTopic.category.slug) {
            // If category slug somehow changes for the same topic, update it
            setInternalCategorySlug(currentTopic.category.slug);
            console.log(`[useForumTopicData] Updated internalCategorySlug: ${currentTopic.category.slug}`);
        }

        console.log(`[useForumTopicData] Fetching posts for topic ID: ${currentTopic.id}, page: ${pageToFetch}`);
        const { posts: newPosts, totalCount } = await fetchPosts(currentTopic.id, pageToFetch);
        setPosts(newPosts);
        setTotalPosts(totalCount);
        const calculatedTotalPages = Math.max(1, Math.ceil(totalCount / POSTS_PER_PAGE));
        setTotalPages(calculatedTotalPages);

        console.log(`[useForumTopicData] Data loaded - Topic: ${currentTopic.title}, Page: ${pageToFetch}/${calculatedTotalPages}, Posts count: ${newPosts.length}`);
      } else {
        // This else block might be redundant if fetchTopic correctly navigates on "not found"
        console.warn('[useForumTopicData] currentTopic is null after attempting to fetch/load. Posts will not be fetched.');
        // setError("Failed to load topic details."); // Already handled in fetchTopic
        // setLoadingData(false); // Already handled in fetchTopic or finally block
      }
    } catch (err: any) {
      console.error('[useForumTopicData] Error in fetchData main try-catch:', err);
      // Avoid generic toast if specific one (like PGRST201) was already shown in fetchTopic/fetchPosts
      if (err.code !== 'PGRST201' && err.message !== 'Topic not found') {
        toast({
            title: "Error processing topic data",
            description: err.message || "An unexpected error occurred.",
            variant: "destructive",
        });
      }
      setError(err.message || "An unexpected error occurred while fetching data.");
    } finally {
      setLoadingData(false);
      console.log(`[useForumTopicData] fetchData finally block. Loading: ${loadingData}, Topic set: ${!!topic}, Posts: ${posts.length}`);
    }
  }, [
    paramTopicSlug, 
    topic, // current topic state
    fetchTopic, 
    fetchPosts, 
    updateViewCount, 
    viewCountUpdatedForTopic, 
    currentPageFromProp, 
    internalCategorySlug, 
    toast, 
    navigate,
    posts.length // Added posts.length to ensure re-evaluation if posts change externally (though less likely for this hook)
]); 

  useEffect(() => {
    console.log(`[useForumTopicData] Effect triggered - TopicSlug: ${paramTopicSlug}, CurrentPageFromProp: ${currentPageFromProp}`);
    // If the topic slug in the URL changes, reset the current topic state to force a re-fetch by fetchData
    if (topic && paramTopicSlug && paramTopicSlug !== topic.slug) {
        console.log(`[useForumTopicData] Topic slug changed from ${topic.slug} to ${paramTopicSlug}. Resetting topic state.`);
        setTopic(null); 
        setPosts([]); // Clear posts when topic changes
        setTotalPosts(0);
        setTotalPages(1);
        setInternalCategorySlug(null); 
        setViewCountUpdatedForTopic(null); // Reset view count tracking
    }
    
    if (paramTopicSlug) {
        // fetchData will handle fetching both topic (if needed) and posts
        fetchData(currentPageFromProp);
    } else {
        // Handle case where there's no topic slug in the URL (e.g., navigating to a base forum page)
        console.warn("[useForumTopicData] Effect triggered but paramTopicSlug is undefined. Not fetching data.");
        setLoadingData(false);
        setTopic(null);
        setPosts([]);
        setError("Topic slug not available in URL.");
        // Optionally navigate away if a topic slug is always expected on this page
        // navigate('/members/forum', { replace: true }); 
    }
    // fetchData is already memoized with its dependencies, including currentPageFromProp.
    // Adding topic.slug to dependencies of this useEffect could cause re-runs if topic state itself changes,
    // which is already handled by the slug comparison.
  }, [paramTopicSlug, currentPageFromProp, fetchData]); 

  const refreshData = useCallback(async () => {
    console.log('[useForumTopicData] Refreshing data (full)...');
    // Reset states to ensure fresh data load
    setTopic(null); 
    setPosts([]);
    setTotalPosts(0);
    setTotalPages(1);
    setInternalCategorySlug(null);
    setViewCountUpdatedForTopic(null); 
    
    if (paramTopicSlug) {
        // fetchData will get the current page from currentPageFromProp
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
