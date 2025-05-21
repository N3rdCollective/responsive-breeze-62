import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { ForumTopic, ForumPost } from '@/types/forum';
import { useForumTopicViews } from '../actions/useForumTopicViews';
import type { User } from '@supabase/supabase-js'; // For user type from useAuth

const ITEMS_PER_PAGE = 10;

export const useForumTopicData = (initialPage: number = 1) => {
  const { categorySlug: routeCategorySlug, topicId: routeTopicIdParam } = useParams<{ categorySlug: string, topicId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { incrementViewCount } = useForumTopicViews();

  // Parse page from URL query parameters
  const getPageFromUrl = useCallback(() => {
    const searchParams = new URLSearchParams(location.search);
    const pageParam = searchParams.get('page');
    if (pageParam) {
      const parsedPage = parseInt(pageParam, 10);
      return !isNaN(parsedPage) && parsedPage > 0 ? parsedPage : initialPage;
    }
    return initialPage;
  }, [location.search, initialPage]);

  const [topic, setTopic] = useState<ForumTopic | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [page, setPage] = useState(getPageFromUrl());
  const [totalPages, setTotalPages] = useState(1);
  const [viewCountIncremented, setViewCountIncremented] = useState(false);
  const [initialPostIdProcessed, setInitialPostIdProcessed] = useState(false);

  // Update page state when URL changes
  useEffect(() => {
    setPage(getPageFromUrl());
  }, [getPageFromUrl]);

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
        navigate('/members/forum', { replace: true });
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

      let finalPageToFetch = currentPageToFetchOverride ?? page;
      const searchParams = new URLSearchParams(location.search);
      const pageFromUrl = searchParams.get('page');
      
      // If there's a page in the URL and we're not overriding, use that
      if (pageFromUrl && !currentPageToFetchOverride) {
        const parsedPage = parseInt(pageFromUrl, 10);
        if (!isNaN(parsedPage) && parsedPage > 0) {
          finalPageToFetch = parsedPage;
        }
      }
      
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeTopicIdParam, routeCategorySlug, navigate, toast, incrementViewCount, location.search, initialPostIdProcessed, page]); // page dependency is for re-triggering on manual page set

  useEffect(() => {
    setInitialPostIdProcessed(false);
    setViewCountIncremented(false); 
  }, [routeTopicIdParam]);

  useEffect(() => {
    if (!authLoading) {
      fetchTopicData(); // Let fetchTopicData handle page from state or URL
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, routeTopicIdParam, routeCategorySlug, location.search, fetchTopicData]);

  const updatePage = (newPage: number) => {
    setInitialPostIdProcessed(true); 
    setPage(newPage);
  };

  return {
    topic,
    posts,
    setPosts, // Added
    loadingData,
    page,
    totalPages,
    setPage: updatePage,
    fetchTopicData, // Added: the function itself
    refreshTopicData: () => { // This is a wrapper for specific refresh scenario
      setInitialPostIdProcessed(false);
      fetchTopicData(); // Call with current page state or from URL
    },
    user,
    authLoading,
    categorySlug: routeCategorySlug, // Added
    routeTopicId: routeTopicIdParam, // Added
    ITEMS_PER_PAGE, // Added
  };
};
