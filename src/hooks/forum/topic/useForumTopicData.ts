import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { ForumTopic, ForumPost } from '@/types/forum';
import { useForumTopicViews } from '../actions/useForumTopicViews';

const ITEMS_PER_PAGE = 10;

export const useForumTopicData = (initialPage: number = 1) => {
  const { categorySlug: routeCategorySlug, topicId: routeTopicIdParam } = useParams<{ categorySlug: string, topicId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { incrementViewCount } = useForumTopicViews();

  const [topic, setTopic] = useState<ForumTopic | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  
  const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);
  const [page, setPage] = useState(isNaN(pageFromUrl) ? initialPage : pageFromUrl);
  
  const [totalPages, setTotalPages] = useState(1);
  const [viewCountIncremented, setViewCountIncremented] = useState(false);
  const [initialPostIdProcessed, setInitialPostIdProcessed] = useState(false);
  const [lastFetchedPage, setLastFetchedPage] = useState<number | null>(null);

  // Update page when URL query params change
  useEffect(() => {
    const pageParam = searchParams.get('page');
    if (pageParam) {
      const parsedPage = parseInt(pageParam, 10);
      if (!isNaN(parsedPage) && parsedPage !== page) {
        console.log(`[useForumTopicData] URL page changed to: ${parsedPage}, updating page state`);
        setPage(parsedPage);
      }
    } else if (page !== 1) {
      console.log(`[useForumTopicData] No page param in URL, resetting to page 1`);
      setPage(1); // Reset to page 1 if no page param
    }
  }, [searchParams, page]);

  const fetchTopicData = useCallback(async (currentPageToFetch?: number) => {
    const currentTopicId = routeTopicIdParam; 
    const currentCategorySlug = routeCategorySlug;
    
    const pageToFetch = currentPageToFetch ?? page;
    console.log(`[useForumTopicData] fetchTopicData called for page: ${pageToFetch}, topic: ${currentTopicId}`);

    if (!currentTopicId || !currentCategorySlug) {
      console.log(`[useForumTopicData] Missing topic ID or category slug, stopping fetch`);
      setLoadingData(false);
      return false;
    }
    
    // setLoadingData(true); // Moved down to prevent flicker if already loading

    try {
      // Only fetch topic details if we haven't already or if we're explicitly requesting a refresh
      // For real-time updates, we might want to re-evaluate if topic details (like last_post_at) need refreshing too.
      // For now, this logic remains, but a real-time new post will trigger this for the current page.
      if (!topic || currentPageToFetch !== undefined || posts.length === 0) { // Ensure topic is fetched if posts are empty (e.g. initial load with real-time)
        if(!loadingData) setLoadingData(true); // Set loading true only if not already loading

        const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(currentTopicId);
        let topicQuery = supabase
          .from('forum_topics')
          .select(`
            *, 
            profile:profiles!forum_topics_user_id_fkey(username, display_name, profile_picture), 
            category:forum_categories(name, slug)
          `);
        topicQuery = isUUID ? topicQuery.eq('id', currentTopicId) : topicQuery.eq('slug', currentTopicId);
        
        console.log(`[useForumTopicData] Fetching topic details for: ${currentTopicId}`);
        const { data: topicRawData, error: topicError } = await topicQuery.single();

        if (topicError || !topicRawData) {
          console.error(`[useForumTopicData] Error fetching topic: ${topicError?.message}`);
          toast({ title: 'Error', description: 'Topic not found or error fetching topic.', variant: 'destructive' });
          navigate('/members');
          setLoadingData(false);
          return false;
        }

        const fetchedTopicObj = { ...topicRawData } as ForumTopic;
        const fetchedCategory = fetchedTopicObj.category as { slug: string; name: string } | undefined;

        if (fetchedCategory && fetchedCategory.slug !== currentCategorySlug) {
          console.log(`[useForumTopicData] Category mismatch, redirecting to canonical URL`);
          navigate(`/members/forum/${fetchedCategory.slug}/${fetchedTopicObj.slug || fetchedTopicObj.id}`, { replace: true });
          setLoadingData(false);
          return false;
        }
        setTopic(fetchedTopicObj);

        const { count, error: countError } = await supabase
          .from('forum_posts')
          .select('*', { count: 'exact', head: true })
          .eq('topic_id', fetchedTopicObj.id);

        if (countError) {
          console.error(`[useForumTopicData] Error counting posts: ${countError.message}`);
          throw countError;
        }
        
        const totalPostsCount = count || 0;
        const calculatedTotalPages = Math.ceil(totalPostsCount / ITEMS_PER_PAGE) || 1;
        console.log(`[useForumTopicData] Total posts: ${totalPostsCount}, total pages: ${calculatedTotalPages}`);
        setTotalPages(calculatedTotalPages);

        const postIdFromQuery = searchParams.get('postId');
        if (postIdFromQuery && fetchedTopicObj.id && !initialPostIdProcessed) {
          console.log(`[useForumTopicData] Found postId=${postIdFromQuery} in query. Attempting to calculate page.`);
          try {
            const { data: postPageInfo, error: rpcError } = await supabase.rpc('get_post_page_and_index', {
              p_topic_id: fetchedTopicObj.id,
              p_post_id: postIdFromQuery,
              p_items_per_page: ITEMS_PER_PAGE
            });

            if (rpcError) {
              console.error('[useForumTopicData] Error calling get_post_page_and_index RPC:', rpcError);
            } else if (postPageInfo && postPageInfo.length > 0 && postPageInfo[0].page_number) {
              const postPage = postPageInfo[0].page_number;
              console.log(`[useForumTopicData] Calculated page ${postPage} for postId ${postIdFromQuery}.`);
              
              if (postPage !== pageToFetch) {
                setPage(postPage);
                const newSearchParams = new URLSearchParams(searchParams);
                newSearchParams.set('page', postPage.toString());
                setSearchParams(newSearchParams, { replace: true });
                // setLoadingData(false); // Data will be fetched by the page change effect
                return true; 
              }
            }
          } catch (e) {
            console.error('[useForumTopicData] Exception calling RPC:', e);
          }
          setInitialPostIdProcessed(true);
        }
      } else {
         // If topic is already set, ensure loading is false if we aren't fetching posts
         // This branch is hit if topic exists AND currentPageToFetch is undefined
         // and posts are not empty.
         // We still need to fetch posts for the current page if it changed.
      }

      const currentTopicIdForPosts = (topic?.id || (topicRawData as ForumTopic)?.id); // Use newly fetched topic ID if available
      if (!currentTopicIdForPosts) {
        console.error(`[useForumTopicData] Missing topic ID for post fetching`);
        setLoadingData(false);
        return false;
      }
      
      // If loadingData is false and we are about to fetch posts, set it to true.
      if (!loadingData) setLoadingData(true);

      // Make sure page is within valid range
      const currentTotalPages = totalPages > 0 ? totalPages : 1; // Use 1 if totalPages is 0 initially
      const validatedPage = Math.min(Math.max(1, pageToFetch), currentTotalPages);
      if (validatedPage !== pageToFetch && pageToFetch <= currentTotalPages) { // Only update if page was out of bounds but valid within currentTotalPages
        console.log(`[useForumTopicData] Page ${pageToFetch} out of range [1-${currentTotalPages}], using ${validatedPage} instead`);
        setPage(validatedPage);
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('page', validatedPage.toString());
        setSearchParams(newSearchParams, { replace: true });
        // Data will be re-fetched due to page state change effect
        setLoadingData(false); // Release loading lock, page change will re-trigger
        return true; 
      }

      console.log(`[useForumTopicData] Fetching posts for topic ${currentTopicIdForPosts}, page ${validatedPage}`);
      const { data: postsRawData, error: postsError } = await supabase
        .from('forum_posts')
        .select(`*, profile:profiles!forum_posts_user_id_fkey(username, display_name, profile_picture), forum_post_reactions (id, user_id, reaction_type)`)
        .eq('topic_id', currentTopicIdForPosts)
        .order('created_at', { ascending: true })
        .range((validatedPage - 1) * ITEMS_PER_PAGE, validatedPage * ITEMS_PER_PAGE - 1);

      if (postsError) {
        console.error(`[useForumTopicData] Error fetching posts: ${postsError.message}`);
        throw postsError;
      }
      
      console.log(`[useForumTopicData] Fetched ${postsRawData?.length || 0} posts for page ${validatedPage}`);
      setPosts((postsRawData || []) as ForumPost[]);
      setLastFetchedPage(validatedPage);

      if (validatedPage === 1 && currentTopicIdForPosts && !viewCountIncremented) {
        console.log(`[useForumTopicData] Incrementing view count for topic ${currentTopicIdForPosts}`);
        incrementViewCount(currentTopicIdForPosts);
        setViewCountIncremented(true);
      }
      
      setLoadingData(false);
      return true;

    } catch (error: any) {
      console.error("Error fetching topic data:", error);
      toast({ title: 'Error', description: error.message || 'Could not load topic data.', variant: 'destructive' });
      setLoadingData(false);
      return false;
    }
  }, [routeTopicIdParam, routeCategorySlug, navigate, toast, incrementViewCount, searchParams, page, topic, totalPages, initialPostIdProcessed, posts.length]); // Added posts.length

  // Reset state when topic changes
  useEffect(() => {
    setInitialPostIdProcessed(false);
    setViewCountIncremented(false); 
    setLastFetchedPage(null);
  }, [routeTopicIdParam]);

  // Fetch data when auth loads, topic changes, or page changes
  useEffect(() => {
    if (!authLoading) {
      if (lastFetchedPage === null || page !== lastFetchedPage || (topic && posts.length === 0 && !loadingData) ) {
        console.log(`[useForumTopicData] Page changed, initial load, or posts empty after load. Fetching data for page ${page}. Topic ID: ${topic?.id}`);
        fetchTopicData(page);
      }
    }
  }, [authLoading, routeTopicIdParam, routeCategorySlug, page, fetchTopicData, lastFetchedPage, topic, posts.length, loadingData]);


  // Real-time subscription for new posts
  useEffect(() => {
    if (!topic?.id) return;

    console.log(`[useForumTopicData] Subscribing to real-time posts for topic: ${topic.id}`);

    const channel = supabase
      .channel(`forum-topic-${topic.id}`)
      .on<ForumPost>(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'forum_posts',
          filter: `topic_id=eq.${topic.id}` 
        },
        (payload) => {
          console.log('[useForumTopicData] Real-time: New post received!', payload.new);
          // Potentially check if the new post is by the current user to avoid double-adding if UI updates optimistically
          // For simplicity, just refetch the current page's data.
          // This will also update totalPages if a new page is created.
          toast({
            title: "New Post Added",
            description: "The topic has been updated with a new post.",
          });
          fetchTopicData(page); // Re-fetch current page
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log(`[useForumTopicData] Successfully subscribed to topic ${topic.id}`);
        }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error(`[useForumTopicData] Subscription error for topic ${topic.id}:`, status, err);
          toast({
            title: "Real-time Error",
            description: "Could not connect to real-time updates. Please refresh.",
            variant: "destructive"
          });
        }
      });

    return () => {
      console.log(`[useForumTopicData] Unsubscribing from real-time posts for topic: ${topic.id}`);
      supabase.removeChannel(channel);
    };
  }, [topic?.id, fetchTopicData, page, toast]); // Added fetchTopicData, page, toast

  const updatePage = (newPage: number) => {
    console.log(`[useForumTopicData] updatePage called with ${newPage}`);
    if (newPage === page) return; 
    
    setInitialPostIdProcessed(true);
    
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', newPage.toString());
    
    setSearchParams(newSearchParams, { replace: true });
    setPage(newPage);
  };

  return {
    topic,
    posts,
    setPosts,
    loadingData,
    page,
    totalPages,
    setPage: updatePage, 
    fetchTopicData, // This is the useCallback version
    refreshTopicData: () => {
      console.log(`[useForumTopicData] refreshTopicData called for page ${page}`);
      setInitialPostIdProcessed(false); // Reset this so postId param can be processed again if present
      setLastFetchedPage(null); // Force re-fetch
      fetchTopicData(page); // Use the memoized fetchTopicData
    },
    user,
    authLoading,
    categorySlug: routeCategorySlug,
    routeTopicId: routeTopicIdParam,
    ITEMS_PER_PAGE,
  };
};
