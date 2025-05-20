
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from "@/hooks/useAuth";
import { useToast } from '@/hooks/use-toast';
import { useForumTopicViews } from "../actions/useForumTopicViews";
import { ForumTopic, ForumPost } from "@/types/forum";

const ITEMS_PER_PAGE = 10;

export const useForumTopicData = (initialPage: number = 1) => {
  const { categorySlug, topicId: routeTopicId } = useParams<{ categorySlug: string, topicId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { incrementViewCount } = useForumTopicViews();

  const [topic, setTopic] = useState<ForumTopic | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [viewCountIncremented, setViewCountIncremented] = useState(false);

  useEffect(() => {
    // Reset view count increment status and page when topicId changes
    setViewCountIncremented(false);
    setPage(1); // Reset to page 1 when topic changes
  }, [routeTopicId]);

  const fetchTopicData = useCallback(async (currentPageToFetch = page) => {
    if (!routeTopicId) return false;

    try {
      setLoadingData(true);
      const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(routeTopicId);
      let topicQuery = supabase
        .from('forum_topics')
        .select(`
          *,
          profile:profiles!forum_topics_user_id_fkey(username, display_name, profile_picture), 
          category:forum_categories(name, slug)
        `);

      if (isUUID) {
        topicQuery = topicQuery.eq('id', routeTopicId);
      } else {
        topicQuery = topicQuery.eq('slug', routeTopicId);
      }
      
      const { data: topicRawData, error: topicError } = await topicQuery.single();
        
      if (topicError || !topicRawData) {
        if (topicError) console.error("Error fetching topic: ", topicError.message);
        navigate('/members/forum', { replace: true });
        toast({
          title: "Topic not found",
          description: "The forum topic you're looking for doesn't exist or could not be loaded.",
          variant: "destructive"
        });
        setLoadingData(false);
        return false;
      }
      
      const fetchedTopic = { ...topicRawData } as ForumTopic;

      if (fetchedTopic.category && fetchedTopic.category.slug !== categorySlug) {
        navigate(`/members/forum/${fetchedTopic.category.slug}/${fetchedTopic.slug || fetchedTopic.id}`, { replace: true });
        setLoadingData(false);
        return false;
      }
      
      setTopic(fetchedTopic);
      
      const { count, error: countError } = await supabase
        .from('forum_posts')
        .select('*', { count: 'exact', head: true })
        .eq('topic_id', fetchedTopic.id); 
        
      if (countError) throw countError;
      
      const totalPostsCount = count || 0;
      const totalPageCount = Math.ceil(totalPostsCount / ITEMS_PER_PAGE) || 1;
      setTotalPages(totalPageCount);
      
      const validCurrentPage = Math.min(currentPageToFetch, totalPageCount);
      if (currentPageToFetch !== validCurrentPage && totalPostsCount > 0) {
        setPage(validCurrentPage); // Update internal page state if fetched page was out of bounds
        currentPageToFetch = validCurrentPage; // Use valid page for fetching
      } else if (currentPageToFetch !== page) {
        setPage(currentPageToFetch); // Sync internal page state if different
      }
      
      const { data: postsRawData, error: postsError } = await supabase
        .from('forum_posts')
        .select(`
          *,
          profile:profiles!forum_posts_user_id_fkey(username, display_name, profile_picture),
          forum_post_reactions (id, user_id, reaction_type)
        `)
        .eq('topic_id', fetchedTopic.id)
        .order('created_at', { ascending: true })
        .range((currentPageToFetch - 1) * ITEMS_PER_PAGE, currentPageToFetch * ITEMS_PER_PAGE - 1);
        
      if (postsError) throw postsError;

      setPosts((postsRawData || []) as ForumPost[]);
      
      if (currentPageToFetch === 1 && fetchedTopic.id && !viewCountIncremented) {
        incrementViewCount(fetchedTopic.id);
        setViewCountIncremented(true);
      }
      return true; // Successfully fetched data
    } catch (error: any) {
      console.error('Error fetching topic data:', error.message);
      toast({
        title: "Error loading topic data",
        description: "We couldn't load the topic and post data. Please try again.",
        variant: "destructive"
      });
      setTopic(null); // Clear topic on error
      setPosts([]);   // Clear posts on error
      return false; // Fetch failed
    } finally {
      setLoadingData(false);
    }
  }, [routeTopicId, categorySlug, navigate, toast, incrementViewCount, viewCountIncremented, page]); // page is a dep for currentPageToFetch default

  useEffect(() => {
    if ((user || !authLoading) && routeTopicId) { // Ensure routeTopicId is present before fetching
      fetchTopicData(page);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, routeTopicId, page]); // fetchTopicData is not added here to avoid re-runs due to its own definition changing, page is the trigger for data refresh on page change

  return {
    topic,
    posts,
    setPosts, // Expose setPosts for optimistic updates if needed by other hooks
    loadingData,
    page,
    setPage, // Expose setPage for pagination component
    totalPages,
    fetchTopicData, // Expose fetchTopicData for other hooks to trigger refresh
    categorySlug, // Pass through for convenience
    routeTopicId, // Pass through for convenience
    ITEMS_PER_PAGE
  };
};
