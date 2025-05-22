
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'; // Added useNavigate, useSearchParams for consistency with potential future needs, though not used in provided snippet.
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast'; // Corrected path
import { ForumTopic as GlobalForumTopic, ForumPost as GlobalForumPost } from '@/types/forum'; // Using global types for better consistency
import { useAuth } from '@/hooks/useAuth'; // Added back as user context is often useful
import { useForumTopicViews } from '../actions/useForumTopicViews'; // Added back for view counting

// Define local interfaces based on provided code, but prefer global ones if they match
interface ForumTopic extends GlobalForumTopic {}
interface ForumPost extends GlobalForumPost {}

const POSTS_PER_PAGE = 10; // Moved to make it a constant for the hook

export const useForumTopicData = () => {
  const { categorySlug, topicId: topicSlugFromParams } = useParams<{ categorySlug: string, topicId: string }>(); // Adjusted to use existing param names
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { incrementViewCount } = useForumTopicViews();


  const [topic, setTopic] = useState<ForumTopic | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loadingData, setLoadingData] = useState(true); // Renamed from loading to loadingData for clarity
  const [error, setError] = useState<string | null>(null);
  
  const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);
  const [page, setPage] = useState(isNaN(pageFromUrl) ? 1 : pageFromUrl);
  
  const [totalPages, setTotalPages] = useState(1);
  const [viewCountIncremented, setViewCountIncremented] = useState(false);


  const fetchTopicData = useCallback(async (currentPageToFetch: number = page) => {
    if (!topicSlugFromParams || !categorySlug) { // Use consistent param names
      setLoadingData(false);
      return;
    }
    
    console.log(`[useForumTopicData - Provided Code] Fetching data for topic: ${topicSlugFromParams}, page: ${currentPageToFetch}`);
    
    try {
      setLoadingData(true);
      setError(null);

      let topicData: ForumTopic | null = null;
      let topicErrorObj = null;

      // Fetch topic data only if not already fetched or if it's a forced refresh
      if (!topic) {
        const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(topicSlugFromParams);
        let topicQuery = supabase
          .from('forum_topics')
          .select(`
            *, 
            profile:profiles!forum_topics_user_id_fkey(username, display_name, profile_picture), 
            category:forum_categories(name, slug)
          `);
        topicQuery = isUUID ? topicQuery.eq('id', topicSlugFromParams) : topicQuery.eq('slug', topicSlugFromParams);
        
        const { data: fetchedTopicRawData, error: fetchedTopicError } = await topicQuery.single();

        if (fetchedTopicError) {
          console.error('[useForumTopicData - Provided Code] Error fetching topic:', fetchedTopicError.message);
          throw new Error(fetchedTopicError.message);
        }

        if (!fetchedTopicRawData) {
          console.error('[useForumTopicData - Provided Code] Topic not found');
          throw new Error('Topic not found');
        }
        topicData = fetchedTopicRawData as ForumTopic;
        setTopic(topicData);

        // Category slug check and potential redirect
        const fetchedCategory = topicData.category as { slug: string; name: string } | undefined;
        if (fetchedCategory && fetchedCategory.slug !== categorySlug) {
            console.log(`[useForumTopicData - Provided Code] Category mismatch, redirecting. Expected ${categorySlug}, got ${fetchedCategory.slug}`);
            navigate(`/members/forum/${fetchedCategory.slug}/${topicData.slug || topicData.id}?page=${currentPageToFetch}`, { replace: true });
            setLoadingData(false);
            return;
        }

        // Increment view count only on first load of page 1 for the topic
        if (currentPageToFetch === 1 && topicData.id && !viewCountIncremented) {
          console.log(`[useForumTopicData - Provided Code] Incrementing view count for topic ${topicData.id}`);
          incrementViewCount(topicData.id);
          setViewCountIncremented(true);
        }
      } else {
        topicData = topic; // Use existing topic data if already loaded
      }
      
      if (!topicData?.id) {
        // This case should ideally be caught by the topic not found error earlier
        // but as a safeguard if topic becomes null unexpectedly.
        console.error('[useForumTopicData - Provided Code] Topic ID missing for post fetch.');
        setLoadingData(false);
        return;
      }

      // Fetch posts count for this topic
      const { count, error: countError } = await supabase
        .from('forum_posts')
        .select('*', { count: 'exact', head: true })
        .eq('topic_id', topicData.id);

      if (countError) {
        console.error('[useForumTopicData - Provided Code] Error counting posts:', countError.message);
        throw new Error(countError.message);
      }
      
      const totalPostCount = count || 0;
      const calculatedTotalPages = Math.ceil(totalPostCount / POSTS_PER_PAGE) || 1;
      setTotalPages(calculatedTotalPages);

      // Adjust page if out of bounds
      let actualPageToFetch = currentPageToFetch;
      if (currentPageToFetch > calculatedTotalPages && calculatedTotalPages > 0) {
        console.log(`[useForumTopicData - Provided Code] Page ${currentPageToFetch} out of bounds. Setting to ${calculatedTotalPages}.`);
        actualPageToFetch = calculatedTotalPages;
        setPage(actualPageToFetch); // Update state
        // Update URL
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('page', actualPageToFetch.toString());
        setSearchParams(newSearchParams, { replace: true });
      }


      // Fetch posts for this topic with pagination
      console.log(`[useForumTopicData - Provided Code] Fetching posts for topic ${topicData.id}, page ${actualPageToFetch}`);
      const { data: postsRawData, error: postsError } = await supabase
        .from('forum_posts')
        .select('*, profile:profiles!forum_posts_user_id_fkey(username, display_name, profile_picture), forum_post_reactions (id, user_id, reaction_type)')
        .eq('topic_id', topicData.id)
        .order('created_at', { ascending: true })
        .range((actualPageToFetch - 1) * POSTS_PER_PAGE, actualPageToFetch * POSTS_PER_PAGE - 1);

      if (postsError) {
        console.error('[useForumTopicData - Provided Code] Error fetching posts:', postsError.message);
        throw new Error(postsError.message);
      }

      setPosts((postsRawData as ForumPost[]) || []);
      
    } catch (err: any) {
      console.error('[useForumTopicData - Provided Code] Error in fetchTopicData:', err);
      setError(err.message);
      toast({
        title: "Error loading topic",
        description: err.message,
        variant: "destructive"
      });
      if (err.message === 'Topic not found') {
        navigate('/members'); // Or a 404 page
      }
    } finally {
      setLoadingData(false);
    }
  }, [topicSlugFromParams, categorySlug, page, topic, viewCountIncremented, incrementViewCount, navigate, searchParams, setSearchParams]);

  // Effect to fetch data when slug or page changes, or when auth is loaded
  useEffect(() => {
    if (!authLoading) {
      // Reset topic and view count status if the topic slug changes
      if (topic && (topic.slug !== topicSlugFromParams && topic.id !== topicSlugFromParams)) {
        console.log("[useForumTopicData - Provided Code] Topic slug changed, resetting topic state.");
        setTopic(null);
        setPosts([]);
        setViewCountIncremented(false);
        // Page will be reset by URL effect if needed, or use initialPage if not in URL
        const pageParam = searchParams.get('page');
        const initialPage = pageParam ? parseInt(pageParam, 10) : 1;
        setPage(isNaN(initialPage) ? 1 : initialPage);
        fetchTopicData(isNaN(initialPage) ? 1 : initialPage); 
      } else {
        fetchTopicData(page);
      }
    }
  }, [topicSlugFromParams, categorySlug, page, authLoading, fetchTopicData, topic]); // Added topic to deps

  // Update page when URL query params change
  useEffect(() => {
    const pageParam = searchParams.get('page');
    if (pageParam) {
      const parsedPage = parseInt(pageParam, 10);
      if (!isNaN(parsedPage) && parsedPage !== page) {
        console.log(`[useForumTopicData - Provided Code] URL page changed to: ${parsedPage}, updating page state`);
        setPage(parsedPage);
      }
    } else if (page !== 1) { // If no page param and current page is not 1, reset to 1
        console.log(`[useForumTopicData - Provided Code] No page param in URL, current page is ${page}. Resetting to 1.`);
        setPage(1);
        // No need to update searchParams here, as this reflects the default state for no param
    }
  }, [searchParams]);


  // Real-time subscription for new posts (re-adding the logic, adapted to this hook's structure)
  useEffect(() => {
    if (!topic?.id) return;

    console.log(`[useForumTopicData - Provided Code] Subscribing to real-time posts for topic: ${topic.id}`);

    const channel = supabase
      .channel(`forum-topic-${topic.id}`)
      .on<GlobalForumPost>( // Use GlobalForumPost for payload type
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'forum_posts',
          filter: `topic_id=eq.${topic.id}` 
        },
        (payload) => {
          console.log('[useForumTopicData - Provided Code] Real-time: New post received!', payload.new);
          toast({
            title: "New Post Added",
            description: "The topic has been updated with a new post.",
          });
          fetchTopicData(page); // Re-fetch current page data to get the new post and update total pages
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log(`[useForumTopicData - Provided Code] Successfully subscribed to topic ${topic.id}`);
        }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error(`[useForumTopicData - Provided Code] Subscription error for topic ${topic.id}:`, status, err);
        }
      });

    return () => {
      console.log(`[useForumTopicData - Provided Code] Unsubscribing from real-time posts for topic: ${topic.id}`);
      supabase.removeChannel(channel);
    };
  }, [topic?.id, fetchTopicData, page]); // Dependencies for subscription


  const updatePage = (newPage: number) => {
    if (newPage === page) return;
    setPage(newPage);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', newPage.toString());
    setSearchParams(newSearchParams, { replace: true });
  };
  
  // Exposed refresh function
  const refreshTopicData = useCallback(() => {
    console.log(`[useForumTopicData - Provided Code] refreshTopicData called for page ${page}, topic: ${topicSlugFromParams}`);
    setTopic(null); // Force re-fetch of topic details as well
    setViewCountIncremented(false); // Allow view count to be incremented again if conditions met
    fetchTopicData(page);
  }, [fetchTopicData, page, topicSlugFromParams]);

  return {
    topic,
    posts,
    setPosts, // Added for external manipulation if needed by consuming components
    loadingData,
    error, // Exposing error state
    page,
    setPage: updatePage,
    totalPages,
    fetchTopicData, // Exposing the raw fetch function
    refreshTopicData,
    user,
    authLoading,
    categorySlug, // Exposing categorySlug
    routeTopicId: topicSlugFromParams, // Exposing routeTopicId (which is slug or ID)
    ITEMS_PER_PAGE: POSTS_PER_PAGE, // Exposing items per page
  };
};
