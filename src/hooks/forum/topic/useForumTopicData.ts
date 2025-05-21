
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { ForumTopic, ForumPost } from '@/types/forum';
import { useForumTopicViews } from '../actions/useForumTopicViews';

const ITEMS_PER_PAGE = 10;

export const useForumTopicData = (initialPage: number = 1) => {
  const { categorySlug, topicId: routeTopicId } = useParams<{ categorySlug: string, topicId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { incrementViewCount } = useForumTopicViews();

  const [topic, setTopic] = useState<ForumTopic | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [viewCountIncremented, setViewCountIncremented] = useState(false);
  const [initialPostIdProcessed, setInitialPostIdProcessed] = useState(false);

  const fetchTopicData = useCallback(async (currentPageToFetch: number) => {
    if (!routeTopicId || !categorySlug) {
      setLoadingData(false);
      return false;
    }
    setLoadingData(true);

    try {
      const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(routeTopicId);
      let topicQuery = supabase
        .from('forum_topics')
        .select(`
          *, 
          profile:profiles!forum_topics_user_id_fkey(username, display_name, profile_picture), 
          category:forum_categories(name, slug)
        `);
      topicQuery = isUUID ? topicQuery.eq('id', routeTopicId) : topicQuery.eq('slug', routeTopicId);
      
      const { data: topicRawData, error: topicError } = await topicQuery.single();

      if (topicError || !topicRawData) {
        toast({ title: 'Error', description: 'Topic not found or error fetching topic.', variant: 'destructive' });
        navigate('/members/forum', { replace: true });
        setLoadingData(false);
        return false;
      }

      const fetchedTopicObj = { ...topicRawData } as ForumTopic;
      if (fetchedTopicObj.category && (fetchedTopicObj.category as any).slug !== categorySlug) {
        navigate(`/members/forum/${(fetchedTopicObj.category as any).slug}/${fetchedTopicObj.slug || fetchedTopicObj.id}`, { replace: true });
        setLoadingData(false);
        return false;
      }
      setTopic(fetchedTopicObj);

      let finalPageToFetch = currentPageToFetch;
      const searchParams = new URLSearchParams(location.search);
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
        setInitialPostIdProcessed(true); // Mark as processed for this topic load/postId
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
      // Update internal page state only if it's different, or if postId logic changed it
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
  }, [routeTopicId, categorySlug, navigate, toast, incrementViewCount, location.search, initialPostIdProcessed]); // Removed 'page' and 'viewCountIncremented' to let them be managed internally or by their own setters

  useEffect(() => {
    // Reset processing flag when topic changes
    setInitialPostIdProcessed(false);
    setViewCountIncremented(false); 
    // Do not reset page to 1 here, let fetchTopicData determine based on postId or current page.
  }, [routeTopicId]);

  useEffect(() => {
    if (!authLoading) { // Ensure auth state is resolved
        // Page state is passed to fetchTopicData now
        fetchTopicData(page);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, routeTopicId, categorySlug, page, fetchTopicData]); // `page` is a trigger for re-fetch (pagination)

  // Function to allow external components (like pagination) to change the page
  const updatePage = (newPage: number) => {
    setInitialPostIdProcessed(true); // If paginating manually, assume postId processing is done/irrelevant for this action
    setPage(newPage);
  };

  return {
    topic,
    posts,
    loadingData,
    page,
    totalPages,
    setPage: updatePage, // Expose the controlled way to set page
    refreshTopicData: () => {
      setInitialPostIdProcessed(false); // Allow postId reprocessing on manual refresh if query params are still there
      fetchTopicData(page);
    },
    user,
    authLoading,
  };
};
