import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast'; // Added this import
import { useToast } from '@/hooks/use-toast';
import { ForumTopic, ForumPost } from '@/types/forum';

interface UseForumTopicDataReturn {
  topic: ForumTopic | null;
  posts: ForumPost[];
  loadingData: boolean;
  error: string | null;
  page: number; // This will be the currentPageFromProp
  // setPage is removed as it's handled by useForumPagination
  totalPages: number;
  totalPosts: number;
  refreshData: () => Promise<void>;
  categorySlug: string | null;
}

const POSTS_PER_PAGE = 10;

// Accept currentPageFromProp as an argument
export const useForumTopicData = (currentPageFromProp: number): UseForumTopicDataReturn => {
  const { categorySlug, topicId } = useParams<{ 
    categorySlug: string; 
    topicId: string; 
  }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State
  const [topic, setTopic] = useState<ForumTopic | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Remove internal page state: const [page, setPage] = useState(1);
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

      // Verify category matches URL
      const topicCategorySlug = (topicData.forum_categories as any)?.slug; // Type assertion for clarity
      if (topicCategorySlug !== categorySlug) {
        console.warn(`Category mismatch, redirecting from ${categorySlug} to ${topicCategorySlug} for topic ${topicId}`);
        navigate(`/members/forum/${topicCategorySlug}/${topicId}?page=${currentPageFromProp}`, { replace: true });
        return null;
      }

      console.log('[useForumTopicData] Topic fetched successfully:', topicData.title);
      // The profile data is now directly on topicData.profile, matching ForumTopic type
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
          profiles(
            id,
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
      console.log(`[useForumTopicData] Fetched ${postsData?.length || 0} posts, total: ${totalCount}`);

      return {
        posts: postsData as unknown as ForumPost[] || [],
        totalCount
      };

    } catch (err: any) {
      console.error('Error fetching posts:', err);
      throw err; // Re-throw to be caught by fetchData
    }
  }, []);

  // Update view count (only once per topic visit)
  const updateViewCount = useCallback(async (topicId: string) => {
    // Add check to prevent multiple updates for the same topic ID during component lifecycle / fast re-renders
    if (viewCountUpdatedForTopic === topicId) return;

    try {
      console.log(`[useForumTopicData] Updating view count for topic ${topicId}`);
      // Using a RPC call instead of direct sql query to avoid type errors
      await supabase.rpc('increment_topic_view_count', { topic_id_param: topicId });
      setViewCountUpdatedForTopic(topicId); // Mark as updated for this topic
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
      // Fetch topic details if it's not loaded or if the slug has changed
      if (!currentTopic || currentTopic.slug !== topicId) {
        console.log(`[useForumTopicData] Topic changed or not loaded. Current topic: ${currentTopic?.slug}, New slug: ${topicId}`);
        const fetchedTopicDetails = await fetchTopic();
        if (!fetchedTopicDetails) {
          // fetchTopic handles errors and navigation, setLoadingData(false) might be needed if it returns early.
          setLoadingData(false);
          return;
        }
        currentTopic = fetchedTopicDetails;
        setTopic(currentTopic);
        // Reset view count updated status for new topic
        setViewCountUpdatedForTopic(null); 
        // Update view count only when new topic details are fetched for the first time on page 1
        if (pageToFetch === 1 && currentTopic.id !== viewCountUpdatedForTopic) {
           updateViewCount(currentTopic.id);
        }
      } else if (pageToFetch === 1 && currentTopic.id !== viewCountUpdatedForTopic) {
        // Case: Topic already loaded, but navigating to page 1 and view count not updated for this topic ID yet
        updateViewCount(currentTopic.id);
      }


      if (currentTopic) {
        const { posts: newPosts, totalCount } = await fetchPosts(currentTopic.id, pageToFetch);
        setPosts(newPosts);
        setTotalPosts(totalCount);
        const calculatedTotalPages = Math.max(1, Math.ceil(totalCount / POSTS_PER_PAGE));
        setTotalPages(calculatedTotalPages);

        // If pageToFetch is out of bounds, the parent (useForumPagination) should handle redirecting.
        // This hook will just fetch for the requested page.
        // The parent will see totalPages and can correct if currentPageFromProp > totalPages.
        console.log(`[useForumTopicData] Data loaded - Page: ${pageToFetch}/${calculatedTotalPages}, Posts: ${newPosts.length}`);
      }
    } catch (err: any) {
      console.error('Error in fetchData:', err);
      setError(err.message);
      // toast for critical errors already in fetchTopic/fetchPosts
    } finally {
      setLoadingData(false);
    }
  }, [topicId, topic, fetchTopic, fetchPosts, updateViewCount, viewCountUpdatedForTopic, currentPageFromProp]);


  // Effect to fetch data when topicSlug or currentPageFromProp changes.
  useEffect(() => {
    console.log(`[useForumTopicData] Effect triggered - TopicId: ${topicId}, CurrentPageFromProp: ${currentPageFromProp}`);
    // Reset topic state if topicId changes, to force re-fetch of topic details
    if (topic && topicId !== topic.slug) {
        console.log(`[useForumTopicData] Topic slug changed from ${topic.slug} to ${topicId}. Resetting topic state.`);
        setTopic(null); 
        // This will cause fetchData in the next render cycle (due to topicId change)
        // to go into the `!currentTopic || currentTopic.slug !== topicId` block.
    }
    fetchData(currentPageFromProp);
  }, [topicId, currentPageFromProp, fetchData, topic]); // fetchData is stable if its deps are stable or it's memoized correctly


  // Remove the second useEffect that was also fetching posts on page change.
  // The main useEffect above, reacting to currentPageFromProp, now handles all data fetching.

  // Refresh data function
  const refreshData = useCallback(async () => {
    console.log('[useForumTopicData] Refreshing data...');
    // When refreshing, ensure we force fetch topic details too, and re-update view count if on page 1
    setTopic(null); // This will make fetchData re-fetch topic details
    setViewCountUpdatedForTopic(null); // Allow view count to be updated again
    await fetchData(currentPageFromProp);
  }, [fetchData, currentPageFromProp]);

  // This useEffect was for resetting internal page to 1 on topicId change.
  // Since page is now a prop, this specific logic is removed from here.
  // If a topic change should reset the pagination to page 1,
  // that should be handled by the component orchestrating useForumPagination and useForumTopic,
  // typically by calling setPage(1) from useForumPagination.
  // useEffect(() => {
  //   if (topicId) {
  //     console.log('[useForumTopicData] Topic changed, resetting to page 1');
  //     setPage(1); // This was for internal page state
  //   }
  // }, [topicId]);


  return {
    topic,
    posts,
    loadingData,
    error,
    page: currentPageFromProp, // Return the prop as 'page'
    // setPage: updatePage, // Removed, setPage is handled by useForumPagination
    totalPages,
    totalPosts,
    refreshData,
    categorySlug: categorySlug || null,
  };
};
