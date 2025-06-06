import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ForumTopic, ForumPost } from '@/types/forum';
import { POSTS_PER_PAGE } from '@/config/forumConfig';
import { fetchTopicDetails } from './data/fetchTopicDetails';
import { fetchTopicPosts } from './data/fetchTopicPosts';
import { updateTopicViewCount as executeUpdateTopicViewCount } from './data/updateTopicViewCount'; // Renamed import to avoid conflict with potential local var

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

  const fetchData = useCallback(async (pageToFetch: number = currentPageFromProp) => {
    if (!paramTopicSlug) {
      console.warn('[useForumTopicData] fetchData called without paramTopicSlug. Aborting.');
      setLoadingData(false);
      setError("Topic identifier is missing."); 
      navigate('/members/forum', { replace: true });
      return;
    }

    console.log(`[useForumTopicData] fetchData called for topic slug: ${paramTopicSlug}, page: ${pageToFetch}`);
    setLoadingData(true);
    setError(null); 

    try {
      let currentTopic = topic;
      let fetchedCategorySlugForTopic: string | null = internalCategorySlug;

      if (!currentTopic || currentTopic.slug !== paramTopicSlug || !currentTopic.profile || currentTopic.profile.forum_signature === undefined) {
        console.log(`[useForumTopicData] Topic slug changed or not fully loaded. Current topic slug: ${currentTopic?.slug}, New slug: ${paramTopicSlug}. Fetching topic details.`);
        
        const topicDetailsResult = await fetchTopicDetails(paramTopicSlug, supabase, toast, navigate);
        const fetchedTopic = topicDetailsResult.topic;
        fetchedCategorySlugForTopic = topicDetailsResult.categorySlug;

        console.log('[useForumTopicData] Result of fetchTopicDetails in fetchData:', fetchedTopic ? `Title: ${fetchedTopic.title}` : 'null');
        
        if (!fetchedTopic) {
          console.warn('[useForumTopicData] fetchTopicDetails returned null in fetchData. Topic likely not found or error occurred during fetch.');
          // Error handling (toast, navigation) is done within fetchTopicDetails
          setLoadingData(false); 
          return; 
        }
        currentTopic = fetchedTopic;
        setTopic(currentTopic);
        setInternalCategorySlug(fetchedCategorySlugForTopic);
        
        // Reset view count updated status if topic changes
        if (!viewCountUpdatedForTopic || (currentTopic && viewCountUpdatedForTopic !== currentTopic.id)) {
             setViewCountUpdatedForTopic(null); 
        }
        
        // Update view count if it's the first page and view count hasn't been updated for this topic
        if (pageToFetch === 1 && currentTopic && currentTopic.id !== viewCountUpdatedForTopic) {
           console.log('[useForumTopicData] Attempting to update view count on initial load/page 1.');
           await executeUpdateTopicViewCount(currentTopic.id, supabase);
           setViewCountUpdatedForTopic(currentTopic.id); // Mark as updated
        }
      } else if (pageToFetch === 1 && currentTopic && currentTopic.id !== viewCountUpdatedForTopic) {
        // This case handles navigating back to page 1 for an already loaded topic whose view count wasn't updated yet (e.g., direct navigation to page > 1 then back to 1)
        console.log('[useForumTopicData] Attempting to update view count on navigating to page 1 for existing topic.');
        await executeUpdateTopicViewCount(currentTopic.id, supabase);
        setViewCountUpdatedForTopic(currentTopic.id); // Mark as updated
      }


      if (currentTopic) {
        // Ensure internalCategorySlug is set if derived from topic
        if (!internalCategorySlug && currentTopic.category?.slug) {
            setInternalCategorySlug(currentTopic.category.slug);
            console.log(`[useForumTopicData] Derived internalCategorySlug from currentTopic: ${currentTopic.category.slug}`);
        } else if (fetchedCategorySlugForTopic && internalCategorySlug !== fetchedCategorySlugForTopic) {
            // If fetchTopicDetails provided a new slug (e.g. topic changed)
            setInternalCategorySlug(fetchedCategorySlugForTopic);
            console.log(`[useForumTopicData] Updated internalCategorySlug from fetchTopicDetails: ${fetchedCategorySlugForTopic}`);
        }

        console.log(`[useForumTopicData] Fetching posts for topic ID: ${currentTopic.id}, page: ${pageToFetch}`);
        const { posts: newPosts, totalCount } = await fetchTopicPosts(currentTopic.id, pageToFetch, supabase, toast);
        
        let postsChanged = posts.length !== newPosts.length;
        if (!postsChanged && posts.length > 0 && newPosts.length > 0) {
            const oldFirstPostSignature = posts[0].profile?.forum_signature;
            const newFirstPostSignature = newPosts[0].profile?.forum_signature;
            if (oldFirstPostSignature !== newFirstPostSignature || posts[0].id !== newPosts[0].id) { // Added ID check
                postsChanged = true;
            }
        } else if (posts.length === 0 && newPosts.length > 0) { // If posts were empty and now aren't
            postsChanged = true;
        }
        
        if (postsChanged) {
            setPosts(newPosts);
            console.log(`[useForumTopicData] Posts updated.`);
        } else {
            console.log(`[useForumTopicData] Posts data unchanged, not re-setting state.`);
        }

        setTotalPosts(totalCount);
        const calculatedTotalPages = Math.max(1, Math.ceil(totalCount / POSTS_PER_PAGE));
        setTotalPages(calculatedTotalPages);

        console.log(`[useForumTopicData] Data loaded - Topic: ${currentTopic.title}, Page: ${pageToFetch}/${calculatedTotalPages}, Posts count: ${newPosts.length}`);
      } else {
        console.warn('[useForumTopicData] currentTopic is null after attempting to fetch/load. Posts will not be fetched.');
         // An error likely occurred in fetchTopicDetails and was handled there (toast/navigation)
      }
    } catch (err: any) {
      // Catch errors re-thrown by fetchTopicDetails or fetchTopicPosts
      console.error('[useForumTopicData] Error in fetchData main try-catch:', err);
      // Avoid redundant toasts if already shown by sub-functions
      if (err.message !== 'Topic not found' && err.code !== 'PGRST201' && !err.toastShown) {
        toast({
            title: "Error processing topic data",
            description: err.message || "An unexpected error occurred.",
            variant: "destructive",
        });
      }
      setError(err.message || "An unexpected error occurred while fetching data.");
    } finally {
      setLoadingData(false);
      // console.log(`[useForumTopicData] fetchData finally block. Loading: ${loadingData}, Topic set: ${!!topic}, Posts: ${posts.length}`); // loadingData here would be stale
    }
  }, [
    paramTopicSlug, 
    topic, // Current topic state
    viewCountUpdatedForTopic, 
    currentPageFromProp, 
    internalCategorySlug, 
    toast, 
    navigate,
    posts // Current posts state
    // supabase client is stable and doesn't need to be in deps
  ]); 

  useEffect(() => {
    console.log(`[useForumTopicData] Effect triggered - TopicSlug: ${paramTopicSlug}, CurrentPageFromProp: ${currentPageFromProp}`);
    if (topic && paramTopicSlug && paramTopicSlug !== topic.slug) {
        console.log(`[useForumTopicData] Topic slug changed from ${topic.slug} to ${paramTopicSlug}. Resetting topic state for new fetch.`);
        setTopic(null); 
        setPosts([]); 
        setTotalPosts(0);
        setTotalPages(1);
        setInternalCategorySlug(null); 
        setViewCountUpdatedForTopic(null); 
        // fetchData will be called due to paramTopicSlug change
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramTopicSlug, currentPageFromProp, topic?.slug]); // fetchData is memoized, adding it would cause infinite loops if not careful. Rely on its own dependencies. Added topic.slug to re-trigger if only slug changes.

  const refreshData = useCallback(async () => {
    console.log('[useForumTopicData] Refreshing data (full)...');
    // Reset local state before fetching anew
    setTopic(null); 
    setPosts([]);
    setTotalPosts(0);
    setTotalPages(1);
    setInternalCategorySlug(null);
    setViewCountUpdatedForTopic(null); // Force view count update on refresh if applicable
    
    if (paramTopicSlug) {
        await fetchData(currentPageFromProp); 
    } else {
        console.warn("[useForumTopicData] refreshData called but paramTopicSlug is undefined. Not fetching.");
        setLoadingData(false);
        setError("Cannot refresh: Topic slug not available.");
    }
  }, [fetchData, currentPageFromProp, paramTopicSlug]); // fetchData will be stable due to its own useCallback


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
