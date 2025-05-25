
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ForumTopic, ForumPost } from '@/types/forum';
import { useFetchTopicDetails } from './useFetchTopicDetails';
import { useFetchTopicPosts } from './useFetchTopicPosts';
import { useManageTopicViewCount } from './useManageTopicViewCount';

interface UseForumTopicDataReturn {
  topic: ForumTopic | null;
  posts: ForumPost[];
  setPosts: React.Dispatch<React.SetStateAction<ForumPost[]>>; // Still needed for optimistic updates
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

  const topicDetailsHook = useFetchTopicDetails();
  const postsHook = useFetchTopicPosts();
  const viewCountHook = useManageTopicViewCount();

  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // This specific category slug is derived and managed here for the final return value
  const [derivedCategorySlug, setDerivedCategorySlug] = useState<string | null>(null);

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
      let currentTopicInstance = topicDetailsHook.topic;

      // Fetch topic details if slug changed, topic not loaded, or critical profile info missing
      if (!currentTopicInstance || currentTopicInstance.slug !== paramTopicSlug || !currentTopicInstance.profile) {
        console.log(`[useForumTopicData] Topic needs fetching/re-fetching. Current slug: ${currentTopicInstance?.slug}, New: ${paramTopicSlug}`);
        currentTopicInstance = await topicDetailsHook.fetchTopicBySlug(paramTopicSlug);
        
        if (!currentTopicInstance) {
          // Error handling (toast, navigation) is inside fetchTopicBySlug
          console.warn('[useForumTopicData] fetchTopicBySlug returned null. Aborting fetchData.');
          // topicDetailsHook.topicError might be set, which can be used or an overall error set.
          setError(topicDetailsHook.topicError || "Failed to load topic.");
          return; 
        }
        
        // If topic changed, reset view count status for the new topic
        if (!viewCountHook.wasViewCountUpdatedForTopic(currentTopicInstance.id)) {
            viewCountHook.resetViewCountUpdateStatus();
        }
      }
      
      // Update view count if on page 1 and topic exists and view count not yet updated for this topic ID
      if (currentTopicInstance && currentTopicInstance.id && pageToFetch === 1 && !viewCountHook.wasViewCountUpdatedForTopic(currentTopicInstance.id)) {
         console.log('[useForumTopicData] Attempting to update view count.');
         await viewCountHook.attemptViewCountUpdate(currentTopicInstance.id);
      }

      if (currentTopicInstance) {
        // Update derivedCategorySlug based on the fetched topic's category info
        const topicCategorySlug = currentTopicInstance.category?.slug || topicDetailsHook.categorySlugFromTopic;
        if (topicCategorySlug) {
            setDerivedCategorySlug(topicCategorySlug);
            console.log(`[useForumTopicData] Derived/Updated categorySlug: ${topicCategorySlug}`);
        } else {
            setDerivedCategorySlug(null); // Explicitly null if not found
        }

        console.log(`[useForumTopicData] Fetching posts for topic ID: ${currentTopicInstance.id}, page: ${pageToFetch}`);
        await postsHook.fetchPostsPage(currentTopicInstance.id, pageToFetch, POSTS_PER_PAGE);
        if(postsHook.postsError) {
            // If fetchPostsPage sets an error, propagate it
            throw new Error(postsHook.postsError);
        }
        console.log(`[useForumTopicData] Data loaded - Topic: ${currentTopicInstance.title}, Page: ${pageToFetch}/${postsHook.totalPages}, Posts count: ${postsHook.posts.length}`);
      } else {
        console.warn('[useForumTopicData] currentTopicInstance is null after fetch attempt. Posts will not be fetched.');
        setError(topicDetailsHook.topicError || "Failed to load topic details necessary for fetching posts.");
      }
    } catch (err: any) {
      console.error('[useForumTopicData] Error in fetchData main try-catch:', err);
      // Avoid generic toast if specific one (like PGRST201) was already shown in sub-hooks
      if (err.code !== 'PGRST201' && err.message !== 'Topic not found' && !postsHook.postsError && !topicDetailsHook.topicError) {
        toast({
            title: "Error processing topic data",
            description: err.message || "An unexpected error occurred.",
            variant: "destructive",
        });
      }
      setError(err.message || "An unexpected error occurred while fetching data.");
    } finally {
      setLoadingData(false);
      console.log(`[useForumTopicData] fetchData finally block. Loading: ${loadingData}`);
    }
  }, [
    paramTopicSlug, 
    currentPageFromProp,
    topicDetailsHook, // Includes topic, fetchTopicBySlug, categorySlugFromTopic, topicError
    postsHook,      // Includes fetchPostsPage, postsError, totalPages, posts.length (implicitly via postsHook)
    viewCountHook,  // Includes attemptViewCountUpdate, wasViewCountUpdatedForTopic, resetViewCountUpdateStatus
    toast, 
    navigate
  ]); 

  useEffect(() => {
    console.log(`[useForumTopicData] Effect triggered - TopicSlug: ${paramTopicSlug}, CurrentPageFromProp: ${currentPageFromProp}`);
    
    if (paramTopicSlug) {
        // If the topic slug in the URL changes significantly from current state, reset sub-hook states before fetching
        if (topicDetailsHook.topic && paramTopicSlug !== topicDetailsHook.topic.slug) {
            console.log(`[useForumTopicData] Topic slug changed from ${topicDetailsHook.topic.slug} to ${paramTopicSlug}. Resetting states.`);
            topicDetailsHook.setTopic(null); 
            postsHook.setPosts([]); 
            postsHook.setTotalPosts(0);
            postsHook.setTotalPages(1);
            topicDetailsHook.setCategorySlugFromTopic(null);
            setDerivedCategorySlug(null);
            viewCountHook.resetViewCountUpdateStatus();
        }
        fetchData(currentPageFromProp);
    } else {
        console.warn("[useForumTopicData] Effect triggered but paramTopicSlug is undefined. Not fetching data.");
        setLoadingData(false);
        topicDetailsHook.setTopic(null);
        postsHook.setPosts([]);
        setError("Topic slug not available in URL.");
        setDerivedCategorySlug(null);
    }
  }, [paramTopicSlug, currentPageFromProp, fetchData, topicDetailsHook, postsHook, viewCountHook]); // Added sub-hook main objects as deps

  const refreshData = useCallback(async () => {
    console.log('[useForumTopicData] Refreshing data (full)...');
    topicDetailsHook.setTopic(null); 
    postsHook.setPosts([]);
    postsHook.setTotalPosts(0);
    postsHook.setTotalPages(1);
    topicDetailsHook.setCategorySlugFromTopic(null);
    setDerivedCategorySlug(null);
    viewCountHook.resetViewCountUpdateStatus(); 
    
    if (paramTopicSlug) {
        await fetchData(currentPageFromProp); 
    } else {
        console.warn("[useForumTopicData] refreshData called but paramTopicSlug is undefined. Not fetching.");
        setLoadingData(false);
        setError("Cannot refresh: Topic slug not available.");
    }
  }, [fetchData, currentPageFromProp, paramTopicSlug, topicDetailsHook, postsHook, viewCountHook]);


  return {
    topic: topicDetailsHook.topic,
    posts: postsHook.posts,
    setPosts: postsHook.setPosts, // Pass down the setter from postsHook
    loadingData: loadingData || topicDetailsHook.isLoadingTopic || postsHook.isLoadingPosts,
    error: error || topicDetailsHook.topicError || postsHook.postsError,
    page: currentPageFromProp,
    totalPages: postsHook.totalPages,
    totalPosts: postsHook.totalPosts,
    refreshData, 
    fetchData,    
    categorySlug: derivedCategorySlug, // Use the locally managed derivedCategorySlug
  };
};
