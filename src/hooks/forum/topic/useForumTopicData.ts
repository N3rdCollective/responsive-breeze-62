
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

  // Update page when URL query params change
  useEffect(() => {
    const pageParam = searchParams.get('page');
    if (pageParam) {
      const parsedPage = parseInt(pageParam, 10);
      if (!isNaN(parsedPage) && parsedPage !== page) {
        setPage(parsedPage);
      }
    } else if (page !== 1) {
      setPage(1); // Reset to page 1 if no page param
    }
  }, [searchParams, page]);

  const fetchTopicData = useCallback(async (currentPageToFetchOverride?: number) => {
    const currentTopicId = routeTopicIdParam; // Use the param directly for this fetch instance
    const currentCategorySlug = routeCategorySlug;

    if (!currentTopicId || !currentCategorySlug) {
      setLoadingData(false);
      return false;
    }
    setLoadingData(true);

    try {
      const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(currentTopicId);
      let topicQuery = supabase
        .from('forum_topics')
        .select(`
          *, 
          profile:profiles!forum_topics_user_id_fkey(username, display_name, profile_picture), 
          category:forum_categories(name, slug)
        `);
      topicQuery = isUUID ? topicQuery.eq('id', currentTopicId) : topicQuery.eq('slug', currentTopicId);
      
      const { data: topicRawData, error: topicError } = await topicQuery.single();

      if (topicError || !topicRawData) {
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
        navigate(`/members/forum/${fetchedCategory.slug}/${fetchedTopicObj.slug || fetchedTopicObj.id}`, { replace: true });
        setLoadingData(false);
        return false;
      }
      setTopic(fetchedTopicObj);

      // Prioritize explicit page override, then URL query param, then current state
      let finalPageToFetch = currentPageToFetchOverride ?? pageFromUrl ?? page;
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
            finalPageToFetch = postPageInfo[0].page_number;
            console.log(`[useForumTopicData] Calculated page ${finalPageToFetch} for postId ${postIdFromQuery}.`);
          } else {
            console.warn(`[useForumTopicData] Could not calculate page for postId ${postIdFromQuery}. Using page ${finalPageToFetch}. RPC response:`, postPageInfo);
          }
        } catch (e) {
          console.error('[useForumTopicData] Exception calling RPC:', e);
        }
        setInitialPostIdProcessed(true);
      }
      
      const { count, error: countError } = await supabase
        .from('forum_posts')
        .select('*', { count: 'exact', head: true })
        .eq('topic_id', fetchedTopicObj.id);

      if (countError) throw countError;
      
      const totalPostsCount = count || 0;
      const calculatedTotalPages = Math.ceil(totalPostsCount / ITEMS_PER_PAGE) || 1;
      setTotalPages(calculatedTotalPages);

      finalPageToFetch = Math.min(Math.max(1, finalPageToFetch), calculatedTotalPages);
      if (page !== finalPageToFetch) {
          setPage(finalPageToFetch);
      }
      
      const { data: postsRawData, error: postsError } = await supabase
        .from('forum_posts')
        .select(`*, profile:profiles!forum_posts_user_id_fkey(username, display_name, profile_picture), forum_post_reactions (id, user_id, reaction_type)`)
        .eq('topic_id', fetchedTopicObj.id)
        .order('created_at', { ascending: true })
        .range((finalPageToFetch - 1) * ITEMS_PER_PAGE, finalPageToFetch * ITEMS_PER_PAGE - 1);

      if (postsError) throw postsError;
      setPosts((postsRawData || []) as ForumPost[]);

      if (finalPageToFetch === 1 && fetchedTopicObj.id && !viewCountIncremented) {
        incrementViewCount(fetchedTopicObj.id);
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
  }, [routeTopicIdParam, routeCategorySlug, navigate, toast, incrementViewCount, searchParams, page, pageFromUrl]);

  useEffect(() => {
    setInitialPostIdProcessed(false);
    setViewCountIncremented(false); 
  }, [routeTopicIdParam]);

  useEffect(() => {
    if (!authLoading) {
        fetchTopicData(); // Will use page from URL or state
    }
  }, [authLoading, routeTopicIdParam, routeCategorySlug, page, fetchTopicData]);

  const updatePage = (newPage: number) => {
    setInitialPostIdProcessed(true); 
    // Page state will be updated via the URL change effect
    
    // Update URL with the new page
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', newPage.toString());
    
    // Use navigate to update the URL without a full page refresh
    navigate(`${location.pathname}?${newSearchParams.toString()}`, { replace: true });
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
      fetchTopicData();
    },
    user,
    authLoading,
    categorySlug: routeCategorySlug,
    routeTopicId: routeTopicIdParam,
    ITEMS_PER_PAGE,
  };
};
