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
  const [internalCategorySlug, setInternalCategorySlug] = useState<string | null>(null);

  const fetchTopic = useCallback(async (): Promise<ForumTopic | null> => {
    if (!paramTopicSlug) {
      console.warn('[useForumTopicData] fetchTopic called without paramTopicSlug.');
      return null;
    }

    try {
      console.log('[useForumTopicData] Fetching topic by slug:', paramTopicSlug);
      
      const { data: topicData, error: topicError } = await supabase
        .from('forum_topics')
        .select(`
          *,
          category:forum_categories!inner (slug, name),
          profile:profiles!user_id ( 
            username,
            display_name,
            profile_picture,
            created_at,
            forum_post_count,
            forum_signature
          )
        `)
        .eq('slug', paramTopicSlug)
        .single();

      console.log('[useForumTopicData] Supabase response for topic query:', { topicSlug: paramTopicSlug, topicData, topicError });

      if (topicError) {
        console.error('[useForumTopicData] Topic fetch error from Supabase:', topicError);
        // Check if the error is PGRST201 - ambiguous relationship
        if (topicError.code === 'PGRST201') {
            toast({
                title: "Data Fetching Issue",
                description: "There's an issue specifying relationships in the data query. Please contact support. Details: " + topicError.message,
                variant: "destructive",
            });
        }
        throw new Error(topicError.message);
      }

      if (!topicData) {
        console.warn('[useForumTopicData] Topic not found in DB for slug:', paramTopicSlug, '(topicData is null/undefined)');
        throw new Error('Topic not found');
      }
      
      const fetchedCategorySlug = (topicData as any).category?.slug;
      if (fetchedCategorySlug) {
        setInternalCategorySlug(fetchedCategorySlug);
      } else {
        console.warn('[useForumTopicData] Topic fetched but category slug is missing from topicData.category:', topicData);
        setInternalCategorySlug(null);
      }

      console.log('[useForumTopicData] Topic fetched successfully:', (topicData as any).title);
      return topicData as ForumTopic;

    } catch (err: any) {
      console.error('[useForumTopicData] Error in fetchTopic:', err);
      setError(err.message);
      if (err.message === 'Topic not found' || (err.details && err.details.includes('0 rows'))) {
        toast({
          title: "Error loading topic",
          description: "The topic could not be found.",
          variant: "destructive"
        });
        navigate('/members/forum', { replace: true });
      } else if (err.code !== 'PGRST201') { 
         toast({
          title: "Error loading topic",
          description: err.message || "An unexpected error occurred.",
          variant: "destructive"
        });
      }
      return null;
    }
  }, [paramTopicSlug, navigate, toast]);

  const fetchPosts = useCallback(async (topicId: string, pageToFetch: number): Promise<{ posts: ForumPost[]; totalCount: number }> => {
    try {
      console.log(`[useForumTopicData] Fetching posts for topic ${topicId}, page ${pageToFetch}`);
      
      const startIndex = (pageToFetch - 1) * POSTS_PER_PAGE;
      const endIndex = startIndex + POSTS_PER_PAGE - 1;

      const { data: postsData, error: postsError, count } = await supabase
        .from('forum_posts')
        .select(`
          *,
          profile:profiles!user_id ( 
            username,
            display_name,
            profile_picture,
            created_at,
            forum_post_count,
            forum_signature
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
        if (postsError.code === 'PGRST201') {
            toast({
                title: "Data Fetching Issue (Posts)",
                description: "There's an issue specifying relationships in the post data query. Details: " + postsError.message,
                variant: "destructive",
            });
        }
        throw new Error(postsError.message);
      }

      const totalCount = count || 0;
      console.log(`[useForumTopicData] Fetched ${postsData?.length || 0} posts, total: ${totalCount}.`);
      
      if (postsData) {
        postsData.forEach((post: any, index: number) => {
          console.log(`[useForumTopicData] Post ${index} profile:`, post.profile ? 'Exists' : 'Missing', post.profile?.forum_signature ? 'Has Sig' : 'No Sig');
        });
      }

      return {
        posts: postsData as unknown as ForumPost[] || [],
        totalCount
      };

    } catch (err: any) {
      console.error('Error fetching posts:', err);
      if (err.code !== 'PGRST201') {
        toast({
          title: "Error loading posts",
          description: err.message || "An unexpected error occurred while fetching posts.",
          variant: "destructive",
        });
      }
      throw err; 
    }
  }, [toast]);

  const updateViewCount = useCallback(async (topicId: string) => {
    if (viewCountUpdatedForTopic === topicId) return;

    try {
      console.log(`[useForumTopicData] Updating view count for topic ${topicId}`);
      await supabase.rpc('increment_topic_view_count', { topic_id_param: topicId });
      setViewCountUpdatedForTopic(topicId); 
    } catch (err) {
      console.error('Error updating view count:', err);
      // Optionally, add a toast for view count update failure if desired
    }
  }, [viewCountUpdatedForTopic]);

  const fetchData = useCallback(async (pageToFetch: number = currentPageFromProp) => {
    if (!paramTopicSlug) {
      console.warn('[useForumTopicData] fetchData called without paramTopicSlug. Aborting.');
      setLoadingData(false);
      setError("Topic identifier is missing."); 
      navigate('/members/forum', { replace: true }); // Navigate away if slug is missing
      return;
    }

    console.log(`[useForumTopicData] fetchData called for topic slug: ${paramTopicSlug}, page: ${pageToFetch}`);
    setLoadingData(true);
    setError(null); 

    try {
      let currentTopic = topic;
      // Fetch topic details if slug changed, or topic is not loaded, or if topic.profile is missing (potential indicator of previous fetch issue)
      if (!currentTopic || currentTopic.slug !== paramTopicSlug || !currentTopic.profile || !currentTopic.profile.forum_signature === undefined) { // Added check for forum_signature presence
        console.log(`[useForumTopicData] Topic slug changed, not loaded, profile missing, or signature missing. Current topic slug: ${currentTopic?.slug}, New slug: ${paramTopicSlug}. Fetching topic details.`);
        const fetchedTopicDetails = await fetchTopic();
        console.log('[useForumTopicData] Result of fetchTopic in fetchData:', fetchedTopicDetails ? `Title: ${fetchedTopicDetails.title}` : 'null');
        
        if (!fetchedTopicDetails) {
          console.warn('[useForumTopicData] fetchTopic returned null in fetchData. Topic likely not found or error occurred.');
          setLoadingData(false); 
          return; 
        }
        currentTopic = fetchedTopicDetails;
        setTopic(currentTopic); 
        
        if (!viewCountUpdatedForTopic || (currentTopic && viewCountUpdatedForTopic !== currentTopic.id)) {
             setViewCountUpdatedForTopic(null); 
        }
        
        if (pageToFetch === 1 && currentTopic && currentTopic.id !== viewCountUpdatedForTopic) {
           console.log('[useForumTopicData] Attempting to update view count on initial load/page 1.');
           await updateViewCount(currentTopic.id);
        }
      } else if (pageToFetch === 1 && currentTopic && currentTopic.id !== viewCountUpdatedForTopic) {
        console.log('[useForumTopicData] Attempting to update view count on navigating to page 1 for existing topic.');
        await updateViewCount(currentTopic.id);
      }


      if (currentTopic) {
        if (!internalCategorySlug && currentTopic.category?.slug) {
            setInternalCategorySlug(currentTopic.category.slug);
            console.log(`[useForumTopicData] Derived internalCategorySlug: ${currentTopic.category.slug}`);
        } else if (internalCategorySlug && currentTopic.category?.slug && internalCategorySlug !== currentTopic.category.slug) {
            setInternalCategorySlug(currentTopic.category.slug);
            console.log(`[useForumTopicData] Updated internalCategorySlug: ${currentTopic.category.slug}`);
        }

        console.log(`[useForumTopicData] Fetching posts for topic ID: ${currentTopic.id}, page: ${pageToFetch}`);
        const { posts: newPosts, totalCount } = await fetchPosts(currentTopic.id, pageToFetch);
        
        // Check if posts data has actually changed before setting
        // This is a shallow comparison, deep comparison might be needed for complex objects
        // but for now, check if length or first/last post ID is different as a proxy
        let postsChanged = posts.length !== newPosts.length;
        if (!postsChanged && posts.length > 0 && newPosts.length > 0) {
            const oldFirstPostSignature = posts[0].profile?.forum_signature;
            const newFirstPostSignature = newPosts[0].profile?.forum_signature;
            if (oldFirstPostSignature !== newFirstPostSignature) {
                postsChanged = true;
            }
        }
        
        if (postsChanged) {
            setPosts(newPosts);
            console.log(`[useForumTopicData] Posts updated.`);
        } else {
            console.log(`[useForumTopicData] Posts data unchanged, not re-setting state.`);
        }

        setTotalPosts(totalCount);
        const calculatedTotalPages = Math.max(1, Math.ceil(totalCount / POSTS_PER_PAGE));
        setTotalPages(calculatedTotalPages);

        console.log(`[useForumTopicData] Data loaded - Topic: ${currentTopic.title}, Page: ${pageToFetch}/${calculatedTotalPages}, Posts count: ${newPosts.length}`);
      } else {
        console.warn('[useForumTopicData] currentTopic is null after attempting to fetch/load. Posts will not be fetched.');
      }
    } catch (err: any) {
      console.error('[useForumTopicData] Error in fetchData main try-catch:', err);
      if (err.code !== 'PGRST201' && err.message !== 'Topic not found') {
        toast({
            title: "Error processing topic data",
            description: err.message || "An unexpected error occurred.",
            variant: "destructive",
        });
      }
      setError(err.message || "An unexpected error occurred while fetching data.");
    } finally {
      setLoadingData(false);
      console.log(`[useForumTopicData] fetchData finally block. Loading: ${loadingData}, Topic set: ${!!topic}, Posts: ${posts.length}`);
    }
  }, [
    paramTopicSlug, 
    topic, 
    fetchTopic, 
    fetchPosts, 
    updateViewCount, 
    viewCountUpdatedForTopic, 
    currentPageFromProp, 
    internalCategorySlug, 
    toast, 
    navigate,
    posts // Replaced posts.length with full posts array for better change detection
]); 

  useEffect(() => {
    console.log(`[useForumTopicData] Effect triggered - TopicSlug: ${paramTopicSlug}, CurrentPageFromProp: ${currentPageFromProp}`);
    if (topic && paramTopicSlug && paramTopicSlug !== topic.slug) {
        console.log(`[useForumTopicData] Topic slug changed from ${topic.slug} to ${paramTopicSlug}. Resetting topic state.`);
        setTopic(null); 
        setPosts([]); 
        setTotalPosts(0);
        setTotalPages(1);
        setInternalCategorySlug(null); 
        setViewCountUpdatedForTopic(null); 
    }
    
    if (paramTopicSlug) {
        fetchData(currentPageFromProp);
    } else {
        console.warn("[useForumTopicData] Effect triggered but paramTopicSlug is undefined. Not fetching data.");
        setLoadingData(false);
        setTopic(null);
        setPosts([]);
        setError("Topic slug not available in URL.");
    }
  }, [paramTopicSlug, currentPageFromProp, fetchData, topic?.slug]); // Added topic.slug to dep array

  const refreshData = useCallback(async () => {
    console.log('[useForumTopicData] Refreshing data (full)...');
    setTopic(null); 
    setPosts([]);
    setTotalPosts(0);
    setTotalPages(1);
    setInternalCategorySlug(null);
    setViewCountUpdatedForTopic(null); 
    
    if (paramTopicSlug) {
        await fetchData(currentPageFromProp); 
    } else {
        console.warn("[useForumTopicData] refreshData called but paramTopicSlug is undefined. Not fetching.");
        setLoadingData(false);
        setError("Cannot refresh: Topic slug not available.");
    }
  }, [fetchData, currentPageFromProp, paramTopicSlug]);


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
    categorySlug: internalCategorySlug,
  };
};
