import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ForumTopic, ForumPost } from '@/types/forum';

interface UseForumTopicDataReturn {
  topic: ForumTopic | null;
  posts: ForumPost[];
  setPosts: React.Dispatch<React.SetStateAction<ForumPost[]>>;
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
  // Changed to expect topicSlug from route parameters. categorySlug is NOT part of /forum/topic/:topicSlug route.
  const { topicSlug: paramTopicSlug } = useParams<{ topicSlug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [topic, setTopic] = useState<ForumTopic | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [viewCountUpdatedForTopic, setViewCountUpdatedForTopic] = useState<string | null>(null);
  const [internalCategorySlug, setInternalCategorySlug] = useState<string | null>(null); // For derived category slug

  // Fetch topic data (only when topic changes)
  const fetchTopic = useCallback(async (): Promise<ForumTopic | null> => {
    if (!paramTopicSlug) return null; // Use paramTopicSlug

    try {
      console.log('[useForumTopicData] Fetching topic by slug:', paramTopicSlug);
      
      const { data: topicData, error: topicError } = await supabase
        .from('forum_topics')
        .select(`
          *,
          category:forum_categories!inner (slug, name),
          profile:profiles (username, display_name, profile_picture)
        `)
        .eq('slug', paramTopicSlug) // Query by slug using paramTopicSlug
        .single();

      if (topicError) {
        console.error('Topic fetch error:', topicError);
        throw new Error(topicError.message);
      }

      if (!topicData) {
        throw new Error('Topic not found');
      }
      
      // Access category slug via topicData.category which matches the ForumTopic type
      const fetchedCategorySlug = topicData.category?.slug;
      if (fetchedCategorySlug) {
        setInternalCategorySlug(fetchedCategorySlug);
      } else {
        console.warn('Topic fetched but category slug is missing from topicData.category:', topicData);
        setInternalCategorySlug(null);
      }

      console.log('[useForumTopicData] Topic fetched successfully:', topicData.title);
      return topicData as ForumTopic; // Direct cast, as query shape now matches ForumTopic

    } catch (err: any) {
      console.error('Error fetching topic:', err);
      setError(err.message);
      toast({
        title: "Error loading topic",
        description: err.message,
        variant: "destructive"
      });
      if (err.message === 'Topic not found') {
        // Consider navigating to a generic forum page or a 404 page for topics
        navigate('/members/forum', { replace: true }); 
      }
      return null;
    }
  }, [paramTopicSlug, navigate, toast]); // Removed currentPageFromProp as it's not directly used for slug based fetch logic here

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
          profile:profiles(
            username,
            display_name,
            profile_picture
          ),
          forum_post_reactions (
            id,
            user_id,
            reaction_type
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
      console.log(`[useForumTopicData] Fetched ${postsData?.length || 0} posts, total: ${totalCount}. Posts data:`, postsData);
      
      // Log profile data for each post
      if (postsData) {
        postsData.forEach((post: any, index: number) => {
          console.log(`[useForumTopicData] Post ${index} profile:`, post.profile);
        });
      }

      return {
        posts: postsData as unknown as ForumPost[] || [],
        totalCount
      };

    } catch (err: any) {
      console.error('Error fetching posts:', err);
      throw err; 
    }
  }, []);

  // Update view count (only once per topic visit)
  const updateViewCount = useCallback(async (topicId: string) => { // topicId here is the actual UUID
    if (viewCountUpdatedForTopic === topicId) return;

    try {
      console.log(`[useForumTopicData] Updating view count for topic ${topicId}`);
      await supabase.rpc('increment_topic_view_count', { topic_id_param: topicId });
      setViewCountUpdatedForTopic(topicId); 
    } catch (err) {
      console.error('Error updating view count:', err);
    }
  }, [viewCountUpdatedForTopic]);

  // Main data fetching function
  const fetchData = useCallback(async (pageToFetch: number = currentPageFromProp) => {
    if (!paramTopicSlug) { // Use paramTopicSlug
      setLoadingData(false);
      return;
    }

    console.log(`[useForumTopicData] fetchData called for topic slug: ${paramTopicSlug}, page: ${pageToFetch}`);
    setLoadingData(true);
    setError(null);

    try {
      let currentTopic = topic;
      // Check if topic needs to be refetched (e.g., slug changed or topic not loaded)
      if (!currentTopic || currentTopic.slug !== paramTopicSlug) {
        console.log(`[useForumTopicData] Topic slug changed or not loaded. Current topic slug: ${currentTopic?.slug}, New slug: ${paramTopicSlug}`);
        const fetchedTopicDetails = await fetchTopic();
        if (!fetchedTopicDetails) {
          setLoadingData(false);
          return; 
        }
        currentTopic = fetchedTopicDetails;
        setTopic(currentTopic); 
        // Reset view count updated flag only if the topic *ID* (actual UUID) changes or first load for this slug
        if (!viewCountUpdatedForTopic || (currentTopic && viewCountUpdatedForTopic !== currentTopic.id)) {
             setViewCountUpdatedForTopic(null);
        }
        // Increment view count if it's the first page and view count hasn't been updated for this topic's ID yet
        if (pageToFetch === 1 && currentTopic && currentTopic.id !== viewCountUpdatedForTopic) {
           updateViewCount(currentTopic.id);
        }
      } else if (pageToFetch === 1 && currentTopic && currentTopic.id !== viewCountUpdatedForTopic) {
        // Also increment if already on topic but navigating to page 1 and not updated
        updateViewCount(currentTopic.id);
      }


      if (currentTopic) {
        // Ensure internalCategorySlug is set if topic was already loaded but category slug might not have been derived.
        if (!internalCategorySlug && currentTopic.category?.slug) {
            setInternalCategorySlug(currentTopic.category.slug);
        }
        const { posts: newPosts, totalCount } = await fetchPosts(currentTopic.id, pageToFetch); // fetchPosts uses topic UUID
        setPosts(newPosts);
        setTotalPosts(totalCount);
        const calculatedTotalPages = Math.max(1, Math.ceil(totalCount / POSTS_PER_PAGE));
        setTotalPages(calculatedTotalPages);

        console.log(`[useForumTopicData] Data loaded - Page: ${pageToFetch}/${calculatedTotalPages}, Posts: ${newPosts.length}`);
      }
    } catch (err: any) {
      console.error('Error in fetchData:', err);
      setError(err.message);
    } finally {
      setLoadingData(false);
    }
  }, [paramTopicSlug, topic, fetchTopic, fetchPosts, updateViewCount, viewCountUpdatedForTopic, currentPageFromProp, internalCategorySlug]);

  // Effect to fetch data when paramTopicSlug or currentPageFromProp changes.
  useEffect(() => {
    console.log(`[useForumTopicData] Effect triggered - TopicSlug: ${paramTopicSlug}, CurrentPageFromProp: ${currentPageFromProp}`);
    // If the slug from the URL changes, reset the topic state to force a refetch.
    if (topic && paramTopicSlug !== topic.slug) {
        console.log(`[useForumTopicData] Topic slug changed from ${topic.slug} to ${paramTopicSlug}. Resetting topic state.`);
        setTopic(null); 
        setInternalCategorySlug(null); // Reset derived category slug too
    }
    fetchData(currentPageFromProp);
  }, [paramTopicSlug, currentPageFromProp, fetchData]); // Removed topic from dependencies to avoid loop, slug change handles reset.

  // Refresh data function (full refresh, resets topic)
  const refreshData = useCallback(async () => {
    console.log('[useForumTopicData] Refreshing data (full)...');
    setTopic(null);
    setInternalCategorySlug(null); // Reset derived category slug
    setViewCountUpdatedForTopic(null); // Allow view count to be incremented again on refresh
    await fetchData(currentPageFromProp); 
  }, [fetchData, currentPageFromProp]);

  return {
    topic,
    posts,
    setPosts,
    loadingData,
    error,
    page: currentPageFromProp,
    totalPages,
    totalPosts,
    refreshData, 
    fetchData,    
    categorySlug: internalCategorySlug, // Return the derived category slug
  };
};
