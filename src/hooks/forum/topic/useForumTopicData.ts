
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ForumTopic as GlobalForumTopic, ForumPost as GlobalForumPost } from '@/types/forum';
import { useAuth } from '@/hooks/useAuth';
import { useForumTopicViews } from '../actions/useForumTopicViews';

interface ForumTopic extends GlobalForumTopic {}
interface ForumPost extends GlobalForumPost {}

const POSTS_PER_PAGE = 10;

export const useForumTopicData = () => {
  const { categorySlug, topicId: topicSlugFromParams } = useParams<{ categorySlug: string, topicId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { incrementViewCount } = useForumTopicViews();

  const [topic, setTopic] = useState<ForumTopic | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);
  const [page, setPage] = useState(isNaN(pageFromUrl) ? 1 : pageFromUrl);
  
  const [totalPages, setTotalPages] = useState(1);
  const [viewCountIncremented, setViewCountIncremented] = useState(false);

  const fetchTopicData = useCallback(async (currentPageToFetch: number = page, forceRefreshTopicDetails: boolean = false): Promise<boolean> => {
    if (!topicSlugFromParams || !categorySlug) {
      setLoadingData(false);
      return false;
    }
    
    console.log(`[useForumTopicData] Fetching data for topic: ${topicSlugFromParams}, page: ${currentPageToFetch}, forceRefreshTopic: ${forceRefreshTopicDetails}`);
    
    try {
      setLoadingData(true);
      setError(null);

      let topicDataToUse: ForumTopic | null = topic;

      // Fetch topic data only if not already fetched or if it's a forced refresh
      if (!topicDataToUse || forceRefreshTopicDetails) {
        console.log(`[useForumTopicData] ${forceRefreshTopicDetails ? 'Force refreshing' : 'Fetching'} topic details for ${topicSlugFromParams}`);
        const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(topicSlugFromParams);
        let topicQuery = supabase
          .from('forum_topics')
          .select(`
            *, 
            profile:profiles!forum_topics_user_id_fkey(username, display_name, profile_picture), 
            category:forum_categories(name, slug)
          `);
        topicQuery = isUUID ? topicQuery.eq('id', topicSlugFromParams) : topicQuery.eq('slug', topicSlugFromParams);
        
        const { data: fetchedTopicData, error: fetchedTopicError } = await topicQuery.single();

        if (fetchedTopicError) {
          console.error('[useForumTopicData] Error fetching topic:', fetchedTopicError.message);
          throw new Error(fetchedTopicError.message);
        }

        if (!fetchedTopicData) {
          console.error('[useForumTopicData] Topic not found');
          throw new Error('Topic not found');
        }
        topicDataToUse = fetchedTopicData as ForumTopic;
        setTopic(topicDataToUse);
        if (forceRefreshTopicDetails) { // If forcing topic refresh, also reset view count increment status
            setViewCountIncremented(false);
        }
      }
      
      if (!topicDataToUse?.id) {
        console.error('[useForumTopicData] Topic ID missing for post fetch.');
        setLoadingData(false);
        // If topicDataToUse became null or ID is missing after initial check
        if (!topic) { // If 'topic' state is also null, means it was never found or an issue occurred
            throw new Error('Topic data is unavailable.');
        }
        // If topic state exists but topicDataToUse.id is somehow null (shouldn't happen if topic is set)
        // we rely on topic state for the ID to proceed with post fetching if possible,
        // though this indicates an inconsistent state.
        // For robustness, we'll rely on topicDataToUse.id check, and if it fails here, we throw.
        // This will be caught and return false.
        throw new Error('Critical error: Topic ID became unavailable during fetch operation.');
      }

      // Category slug check and potential redirect
      const fetchedCategory = topicDataToUse.category as { slug: string; name: string } | undefined;
      if (fetchedCategory && fetchedCategory.slug !== categorySlug) {
          console.log(`[useForumTopicData] Category mismatch, redirecting. Expected ${categorySlug}, got ${fetchedCategory.slug}`);
          navigate(`/members/forum/${fetchedCategory.slug}/${topicDataToUse.slug || topicDataToUse.id}?page=${currentPageToFetch}`, { replace: true });
          setLoadingData(false);
          return false; // Indicates an action was taken that prevents normal data flow
      }

      // Increment view count only on first load of page 1 for the topic or if topic details were forced refreshed
      if (currentPageToFetch === 1 && topicDataToUse.id && !viewCountIncremented) {
        console.log(`[useForumTopicData] Incrementing view count for topic ${topicDataToUse.id}`);
        // Assuming incrementViewCount is async and we should await it.
        // If it's not, the await won't harm.
        await incrementViewCount(topicDataToUse.id); 
        setViewCountIncremented(true);
      }
      
      // Fetch posts count for this topic
      const { count, error: countError } = await supabase
        .from('forum_posts')
        .select('*', { count: 'exact', head: true })
        .eq('topic_id', topicDataToUse.id);

      if (countError) {
        console.error('[useForumTopicData] Error counting posts:', countError.message);
        throw new Error(countError.message);
      }
      
      const totalPostCount = count || 0;
      const calculatedTotalPages = Math.ceil(totalPostCount / POSTS_PER_PAGE) || 1;
      setTotalPages(calculatedTotalPages);

      let actualPageToFetch = currentPageToFetch;
      if (currentPageToFetch > calculatedTotalPages && calculatedTotalPages > 0) {
        console.log(`[useForumTopicData] Page ${currentPageToFetch} out of bounds. Setting to ${calculatedTotalPages}.`);
        actualPageToFetch = calculatedTotalPages;
        setPage(actualPageToFetch);
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('page', actualPageToFetch.toString());
        setSearchParams(newSearchParams, { replace: true });
      }

      console.log(`[useForumTopicData] Fetching posts for topic ${topicDataToUse.id}, page ${actualPageToFetch}`);
      const { data: postsRawData, error: postsError } = await supabase
        .from('forum_posts')
        .select('*, profile:profiles!forum_posts_user_id_fkey(username, display_name, profile_picture), forum_post_reactions (id, user_id, reaction_type)')
        .eq('topic_id', topicDataToUse.id)
        .order('created_at', { ascending: true })
        .range((actualPageToFetch - 1) * POSTS_PER_PAGE, actualPageToFetch * POSTS_PER_PAGE - 1);

      if (postsError) {
        console.error('[useForumTopicData] Error fetching posts:', postsError.message);
        throw new Error(postsError.message);
      }

      setPosts((postsRawData as ForumPost[]) || []);
      setLoadingData(false);
      return true; // Success
      
    } catch (err: any) {
      console.error('[useForumTopicData] Error in fetchTopicData:', err);
      setError(err.message);
      toast({
        title: "Error loading topic",
        description: err.message,
        variant: "destructive"
      });
      if (err.message === 'Topic not found' || err.message === 'Topic data is unavailable.') {
        navigate('/members');
      }
      setLoadingData(false);
      return false; // Failure
    }
  }, [
    topicSlugFromParams, 
    categorySlug, 
    page, // page state
    topic, // topic state
    viewCountIncremented, 
    incrementViewCount, 
    navigate, 
    searchParams, 
    setSearchParams,
    // No need to add setPage, setLoadingData, setError, setTopic, setPosts, setTotalPages here
    // as they are setters from useState and their identity is stable.
  ]);

  useEffect(() => {
    if (!authLoading) {
      const pageParam = searchParams.get('page');
      const initialPage = pageParam ? parseInt(pageParam, 10) : 1;
      const validatedInitialPage = isNaN(initialPage) ? 1 : initialPage;

      // Determine if topic details need reset
      const topicSlugChanged = topic && (topic.slug !== topicSlugFromParams && topic.id !== topicSlugFromParams);

      if (topicSlugChanged) {
        console.log("[useForumTopicData] Topic slug changed, resetting topic state and fetching.");
        setTopic(null);
        setPosts([]);
        setViewCountIncremented(false); // Reset view count status for new topic
        setPage(validatedInitialPage); // Reset page to what's in URL or 1
        fetchTopicData(validatedInitialPage, true); // Fetch with new page and force refresh topic details
      } else {
        // Fetch data for current page (which might have been updated by URL effect)
        // or initial page if it's the first load.
        // The 'page' state itself is updated by another useEffect listening to searchParams.
        // So, we can rely on the current 'page' state here unless it's an initial load scenario
        // where 'page' might not yet reflect the URL.
        // Using `validatedInitialPage` ensures we fetch for the page from URL on initial effect runs.
        // Subsequent runs triggered by 'page' state change will use the updated 'page'.
         fetchTopicData(page); // Pass current page state
      }
    }
  }, [topicSlugFromParams, categorySlug, page, authLoading, fetchTopicData]); // Removed topic from deps to avoid re-fetch loops when topic is set by fetchTopicData itself

  useEffect(() => {
    const pageParam = searchParams.get('page');
    const parsedPage = pageParam ? parseInt(pageParam, 10) : 1;
    const validatedPage = isNaN(parsedPage) ? 1 : parsedPage;

    if (validatedPage !== page) {
      console.log(`[useForumTopicData] URL page changed to: ${validatedPage}, updating page state`);
      setPage(validatedPage);
      // Data fetching will be triggered by the useEffect above that depends on 'page' state.
    }
  }, [searchParams]); // Removed page from dependencies to avoid loop, setPage will trigger other effect

  // Real-time subscription for new posts
  useEffect(() => {
    if (!topic?.id) return;

    console.log(`[useForumTopicData] Subscribing to real-time posts for topic: ${topic.id}`);

    const channel = supabase
      .channel(`forum-topic-${topic.id}`)
      .on<GlobalForumPost>(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'forum_posts',
          filter: `topic_id=eq.${topic.id}` 
        },
        (payload) => {
          console.log('[useForumTopicData] Real-time: New post received!', payload.new);
          toast({
            title: "New Post Added",
            description: "The topic has been updated with a new post.",
          });
          // Re-fetch current page data to get the new post and update total pages.
          // We pass true to force a refresh of topic details as well, in case reply counts changed.
          fetchTopicData(page, true); 
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log(`[useForumTopicData] Successfully subscribed to topic ${topic.id}`);
        }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || err) {
          console.error(`[useForumTopicData] Subscription error for topic ${topic.id}:`, status, err);
        }
      });

    return () => {
      console.log(`[useForumTopicData] Unsubscribing from real-time posts for topic: ${topic.id}`);
      supabase.removeChannel(channel).catch(err => console.error("Error removing channel", err));
    };
  }, [topic?.id, fetchTopicData, page]);


  const updatePage = (newPage: number) => {
    if (newPage === page) return;
    // setPage(newPage); // Page state will be updated by the useEffect watching searchParams
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', newPage.toString());
    setSearchParams(newSearchParams, { replace: true });
    // Data fetching is triggered by the page state change via useEffect.
  };
  
  const refreshTopicData = useCallback(async (): Promise<boolean> => {
    console.log(`[useForumTopicData] refreshTopicData called for page ${page}, topic: ${topicSlugFromParams}`);
    // setTopic(null); // Setting topic to null here causes a flicker. fetchTopicData will handle fetching it.
    // setViewCountIncremented(false); // View count reset is handled by forceRefreshTopicDetails in fetchTopicData
    return fetchTopicData(page, true); // Force re-fetch of topic details and posts for current page
  }, [fetchTopicData, page, topicSlugFromParams]);

  return {
    topic,
    posts,
    setPosts,
    loadingData,
    error,
    page,
    setPage: updatePage,
    totalPages,
    fetchTopicData, // Exposing the raw fetch function
    refreshTopicData,
    user, // from useAuth
    authLoading, // from useAuth
    categorySlug,
    routeTopicId: topicSlugFromParams,
    ITEMS_PER_PAGE: POSTS_PER_PAGE,
  };
};
