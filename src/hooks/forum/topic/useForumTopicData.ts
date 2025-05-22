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

// The hook now accepts the current page as a parameter
export const useForumTopicData = (currentPage: number) => {
  const { categorySlug, topicId: topicSlugFromParams } = useParams<{ categorySlug: string, topicId: string }>();
  // Remove searchParams for page handling here, it's managed by useForumPagination
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { incrementViewCount } = useForumTopicViews();

  const [topic, setTopic] = useState<ForumTopic | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Remove internal page state and related useEffect that syncs from searchParams
  // const [page, setPage] = useState(isNaN(pageFromUrl) ? 1 : pageFromUrl);
  
  const [totalPages, setTotalPages] = useState(1);
  const [viewCountIncremented, setViewCountIncremented] = useState(false);

  const fetchTopicData = useCallback(async (pageToFetch: number = currentPage, forceRefreshTopicDetails: boolean = false): Promise<boolean> => {
    if (!topicSlugFromParams || !categorySlug) {
      setLoadingData(false);
      return false;
    }
    
    // Use pageToFetch (which defaults to currentPage prop)
    console.log(`[useForumTopicData] Fetching data for topic: ${topicSlugFromParams}, page: ${pageToFetch}, forceRefreshTopic: ${forceRefreshTopicDetails}`);
    
    try {
      setLoadingData(true);
      setError(null);

      let topicDataToUse: ForumTopic | null = topic;

      if (!topicDataToUse || forceRefreshTopicDetails) {
        // ... keep existing code (topic fetching logic)
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
        if (forceRefreshTopicDetails) { 
            setViewCountIncremented(false);
        }
      }
      
      if (!topicDataToUse?.id) {
        // ... keep existing code (error handling for missing topic ID)
        console.error('[useForumTopicData] Topic ID missing for post fetch.');
        setLoadingData(false);
        if (!topic) { 
            throw new Error('Topic data is unavailable.');
        }
        throw new Error('Critical error: Topic ID became unavailable during fetch operation.');
      }

      const fetchedCategory = topicDataToUse.category as { slug: string; name: string } | undefined;
      if (fetchedCategory && fetchedCategory.slug !== categorySlug) {
          // Use pageToFetch for redirect
          console.log(`[useForumTopicData] Category mismatch, redirecting. Expected ${categorySlug}, got ${fetchedCategory.slug}`);
          navigate(`/members/forum/${fetchedCategory.slug}/${topicDataToUse.slug || topicDataToUse.id}?page=${pageToFetch}`, { replace: true });
          setLoadingData(false);
          return false;
      }

      if (pageToFetch === 1 && topicDataToUse.id && !viewCountIncremented) {
        // ... keep existing code (increment view count logic)
        console.log(`[useForumTopicData] Incrementing view count for topic ${topicDataToUse.id}`);
        await incrementViewCount(topicDataToUse.id); 
        setViewCountIncremented(true);
      }
      
      const { count, error: countError } = await supabase
        .from('forum_posts')
        .select('*', { count: 'exact', head: true })
        .eq('topic_id', topicDataToUse.id);

      if (countError) {
        // ... keep existing code (error handling for post count)
        console.error('[useForumTopicData] Error counting posts:', countError.message);
        throw new Error(countError.message);
      }
      
      const totalPostCount = count || 0;
      const calculatedTotalPages = Math.ceil(totalPostCount / POSTS_PER_PAGE) || 1;
      setTotalPages(calculatedTotalPages);

      let actualPageToFetch = pageToFetch;
      if (pageToFetch > calculatedTotalPages && calculatedTotalPages > 0) {
        console.log(`[useForumTopicData] Page ${pageToFetch} out of bounds. Setting to ${calculatedTotalPages}.`);
        actualPageToFetch = calculatedTotalPages;
        // Parent component (via useForumPagination) should handle URL update if this happens.
        // This hook shouldn't directly manipulate URL for page correction anymore.
        // It might be better to let parent redirect or handle this.
        // For now, we fetch the last valid page. The URL will eventually sync via useForumPagination if parent calls its setPage.
      }

      console.log(`[useForumTopicData] Fetching posts for topic ${topicDataToUse.id}, page ${actualPageToFetch}`);
      const { data: postsRawData, error: postsError } = await supabase
        .from('forum_posts')
        .select('*, profile:profiles!forum_posts_user_id_fkey(username, display_name, profile_picture), forum_post_reactions (id, user_id, reaction_type)')
        .eq('topic_id', topicDataToUse.id)
        .order('created_at', { ascending: true })
        .range((actualPageToFetch - 1) * POSTS_PER_PAGE, actualPageToFetch * POSTS_PER_PAGE - 1);

      if (postsError) {
        // ... keep existing code (error handling for post fetch)
        console.error('[useForumTopicData] Error fetching posts:', postsError.message);
        throw new Error(postsError.message);
      }

      setPosts((postsRawData as ForumPost[]) || []);
      setLoadingData(false);
      return true;
      
    } catch (err: any) {
      // ... keep existing code (general error handling)
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
      return false;
    }
  }, [
    topicSlugFromParams, 
    categorySlug, 
    currentPage, // Use currentPage prop instead of internal page state
    topic, 
    viewCountIncremented, 
    incrementViewCount, 
    navigate, 
    // Removed searchParams, setSearchParams
  ]);

  useEffect(() => {
    if (!authLoading) {
      const topicSlugChanged = topic && (topic.slug !== topicSlugFromParams && topic.id !== topicSlugFromParams);

      if (topicSlugChanged) {
        console.log("[useForumTopicData] Topic slug changed, resetting topic state and fetching.");
        setTopic(null);
        setPosts([]);
        setViewCountIncremented(false);
        // Fetch with currentPage prop and force refresh topic details
        fetchTopicData(currentPage, true); 
      } else {
         fetchTopicData(currentPage); // Pass currentPage prop
      }
    }
  }, [topicSlugFromParams, categorySlug, currentPage, authLoading, fetchTopicData, topic?.id, topic?.slug]);
  // Removed topic from deps in previous version, re-added relevant parts (topic.id, topic.slug) for topicSlugChanged logic.

  // Removed useEffect that synced internal page state from searchParams.
  // This is now handled by useForumPagination.

  // Real-time subscription for new posts
  useEffect(() => {
    // ... keep existing code (real-time subscription logic)
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
          // Use currentPage prop for re-fetch
          fetchTopicData(currentPage, true); 
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
  }, [topic?.id, fetchTopicData, currentPage]); // Use currentPage prop


  // Removed updatePage function. Page updates are handled by useForumPagination.
  
  const refreshTopicData = useCallback(async (): Promise<boolean> => {
    console.log(`[useForumTopicData] refreshTopicData called for page ${currentPage}, topic: ${topicSlugFromParams}`);
    // Use currentPage prop for re-fetch
    return fetchTopicData(currentPage, true);
  }, [fetchTopicData, currentPage, topicSlugFromParams]);

  return {
    topic,
    posts,
    setPosts,
    loadingData,
    error,
    // page is no longer returned by this hook, it comes from useForumPagination
    // setPage is no longer returned by this hook
    totalPages,
    fetchTopicData, 
    refreshTopicData,
    user, 
    authLoading, 
    categorySlug,
    routeTopicId: topicSlugFromParams,
    ITEMS_PER_PAGE: POSTS_PER_PAGE,
  };
};
