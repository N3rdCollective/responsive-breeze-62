
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
  
  // Get page from URL query params, fallback to initialPage
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
    const currentTopicId = routeTopicIdParam; // Use the param directly for this fetch instance
    const currentCategorySlug = routeCategorySlug;
    
    // Define which page we're fetching
    const pageToFetch = currentPageToFetch ?? page;
    console.log(`[useForumTopicData] fetchTopicData called for page: ${pageToFetch}, topic: ${currentTopicId}`);

    if (!currentTopicId || !currentCategorySlug) {
      console.log(`[useForumTopicData] Missing topic ID or category slug, stopping fetch`);
      setLoadingData(false);
      return false;
    }
    
    setLoadingData(true);

    try {
      // Only fetch topic details if we haven't already or if we're explicitly requesting a refresh
      if (!topic || currentPageToFetch !== undefined) {
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
          navigate('/members'); // Changed from '/members/forum' to '/members' to match current route
          setLoadingData(false);
          return false;
        }

        const fetchedTopicObj = { ...topicRawData } as ForumTopic;
        // Type assertion for category slug access
        const fetchedCategory = fetchedTopicObj.category as { slug: string; name: string } | undefined;

        if (fetchedCategory && fetchedCategory.slug !== currentCategorySlug) {
          // If category slug from URL doesn't match topic's actual category slug, redirect to canonical URL
          console.log(`[useForumTopicData] Category mismatch, redirecting to canonical URL`);
          navigate(`/members/forum/${fetchedCategory.slug}/${fetchedTopicObj.slug || fetchedTopicObj.id}`, { replace: true });
          setLoadingData(false);
          return false;
        }
        setTopic(fetchedTopicObj);

        // Get total post count to calculate pages
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

        // Handle postId param for direct linking to a specific post
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
              
              // Update URL and state if needed
              if (postPage !== pageToFetch) {
                setPage(postPage);
                const newSearchParams = new URLSearchParams(searchParams);
                newSearchParams.set('page', postPage.toString());
                setSearchParams(newSearchParams, { replace: true });
                setLoadingData(false);
                return true; // This will trigger a re-fetch with the new page
              }
            }
          } catch (e) {
            console.error('[useForumTopicData] Exception calling RPC:', e);
          }
          setInitialPostIdProcessed(true);
        }
      }

      // Always fetch posts for the current page
      const topicId = (topic?.id || null);
      if (!topicId) {
        console.error(`[useForumTopicData] Missing topic ID for post fetching`);
        setLoadingData(false);
        return false;
      }

      // Make sure page is within valid range
      const validatedPage = Math.min(Math.max(1, pageToFetch), totalPages);
      if (validatedPage !== pageToFetch) {
        console.log(`[useForumTopicData] Page ${pageToFetch} out of range, using ${validatedPage} instead`);
        setPage(validatedPage);
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('page', validatedPage.toString());
        setSearchParams(newSearchParams, { replace: true });
      }

      console.log(`[useForumTopicData] Fetching posts for topic ${topicId}, page ${validatedPage}`);
      const { data: postsRawData, error: postsError } = await supabase
        .from('forum_posts')
        .select(`*, profile:profiles!forum_posts_user_id_fkey(username, display_name, profile_picture), forum_post_reactions (id, user_id, reaction_type)`)
        .eq('topic_id', topicId)
        .order('created_at', { ascending: true })
        .range((validatedPage - 1) * ITEMS_PER_PAGE, validatedPage * ITEMS_PER_PAGE - 1);

      if (postsError) {
        console.error(`[useForumTopicData] Error fetching posts: ${postsError.message}`);
        throw postsError;
      }
      
      console.log(`[useForumTopicData] Fetched ${postsRawData?.length || 0} posts for page ${validatedPage}`);
      setPosts((postsRawData || []) as ForumPost[]);
      setLastFetchedPage(validatedPage);

      // Increment view count only on first load of page 1
      if (validatedPage === 1 && topicId && !viewCountIncremented) {
        console.log(`[useForumTopicData] Incrementing view count for topic ${topicId}`);
        incrementViewCount(topicId);
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
  }, [routeTopicIdParam, routeCategorySlug, navigate, toast, incrementViewCount, searchParams, page, topic, totalPages]);

  // Reset state when topic changes
  useEffect(() => {
    setInitialPostIdProcessed(false);
    setViewCountIncremented(false); 
    setLastFetchedPage(null);
  }, [routeTopicIdParam]);

  // Fetch data when auth loads, topic changes, or page changes
  useEffect(() => {
    if (!authLoading) {
      // If the page differs from lastFetchedPage, we need to fetch data
      if (lastFetchedPage === null || page !== lastFetchedPage) {
        console.log(`[useForumTopicData] Page changed or initial load, fetching data for page ${page}`);
        fetchTopicData(page);
      }
    }
  }, [authLoading, routeTopicIdParam, routeCategorySlug, page, fetchTopicData, lastFetchedPage]);

  const updatePage = (newPage: number) => {
    console.log(`[useForumTopicData] updatePage called with ${newPage}`);
    if (newPage === page) return; // Don't do anything if the page is the same
    
    // Mark that we've processed any initial postId
    setInitialPostIdProcessed(true);
    
    // Update URL with the new page
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', newPage.toString());
    
    // Use navigate to update the URL without a full page refresh
    setSearchParams(newSearchParams, { replace: true });
    
    // Update the page state - this will trigger the effect to fetch data
    setPage(newPage);
  };

  return {
    topic,
    posts,
    setPosts,
    loadingData,
    page,
    totalPages,
    setPage: updatePage, // Use the custom updatePage function
    fetchTopicData,
    refreshTopicData: () => {
      setInitialPostIdProcessed(false);
      setLastFetchedPage(null);
      fetchTopicData(page);
    },
    user,
    authLoading,
    categorySlug: routeCategorySlug,
    routeTopicId: routeTopicIdParam,
    ITEMS_PER_PAGE,
  };
};
