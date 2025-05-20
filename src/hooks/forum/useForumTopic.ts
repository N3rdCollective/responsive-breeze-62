
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from "@/hooks/useAuth";
import { useToast } from '@/hooks/use-toast';
import { useForum } from "@/hooks/useForum";
import { ForumTopic, ForumPost } from "@/types/forum";

const ITEMS_PER_PAGE = 10;

export const useForumTopic = () => {
  const { categorySlug, topicId } = useParams<{ categorySlug: string, topicId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createPost, submitting: isSubmittingReply, incrementViewCount } = useForum();

  const [topic, setTopic] = useState<ForumTopic | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewCountIncremented, setViewCountIncremented] = useState(false);

  useEffect(() => {
    setViewCountIncremented(false);
    setPage(1); // Reset page to 1 when topicId changes
  }, [topicId]);

  const fetchTopicData = useCallback(async () => {
    if (!topicId) return;

    try {
      setLoadingData(true);
      const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(topicId);
      let query = supabase
        .from('forum_topics')
        .select(`
          *,
          profile:profiles!forum_topics_user_id_fkey(username, display_name, avatar_url:profile_picture),
          category:forum_categories(name, slug)
        `);

      if (isUUID) {
        query = query.eq('id', topicId);
      } else {
        query = query.eq('slug', topicId);
      }
      
      const { data: topicRawData, error: topicError } = await query.single();
        
      if (topicError) throw topicError;
      
      if (!topicRawData) {
        navigate('/members');
        toast({
          title: "Topic not found",
          description: "The forum topic you're looking for doesn't exist.",
          variant: "destructive"
        });
        return;
      }
      
      const topicData = { ...topicRawData } as ForumTopic;

      if (topicData.category && topicData.category.slug !== categorySlug) {
        navigate(`/members/forum/${topicData.category.slug}/${topicData.slug || topicData.id}`);
        return;
      }
      
      setTopic(topicData);
      
      const { count, error: countError } = await supabase
        .from('forum_posts')
        .select('*', { count: 'exact', head: true })
        .eq('topic_id', topicData.id); 
        
      if (countError) throw countError;
      
      const totalPageCount = Math.ceil((count || 0) / ITEMS_PER_PAGE);
      setTotalPages(totalPageCount || 1);
      
      const { data: postsRawData, error: postsError } = await supabase
        .from('forum_posts')
        .select(`
          *,
          profile:profiles!forum_posts_user_id_fkey(username, display_name, avatar_url:profile_picture)
        `)
        .eq('topic_id', topicData.id)
        .order('created_at', { ascending: true })
        .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);
        
      if (postsError) throw postsError;

      setPosts((postsRawData || []) as ForumPost[]);
      
      if (page === 1 && topicData.id && !viewCountIncremented) {
        try {
          console.log(`Attempting to increment view count for topic ID: ${topicData.id}`);
          await incrementViewCount(topicData.id);
          setViewCountIncremented(true);
          console.log(`Successfully incremented view count for topic ID: ${topicData.id}`);
        } catch (viewCountError: any) {
          console.error('Error incrementing view count:', viewCountError.message);
        }
      }
    } catch (error: any) {
      console.error('Error fetching topic data:', error.message);
      toast({
        title: "Error loading topic",
        description: "We couldn't load the topic data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingData(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId, categorySlug, navigate, page, viewCountIncremented, user]); // Removed incrementViewCount, toast as they are stable from their hooks

  useEffect(() => {
    if (user) { // Only fetch if user is loaded
      fetchTopicData();
    }
  }, [user, fetchTopicData]);

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) {
      toast({ title: "Empty reply", description: "Please enter a message for your reply.", variant: "destructive" });
      return;
    }
    if (!topic || !topic.id) return;
    if (topic.is_locked) {
      toast({ title: "Topic is locked", description: "This topic is locked and cannot be replied to.", variant: "destructive" });
      return;
    }

    const result = await createPost({ topic_id: topic.id, content: replyContent });
    
    if (result) {
      setReplyContent("");
      const newPost = result as ForumPost;
      
      // Calculate current total posts before adding the new one
      const currentTotalPosts = ((totalPages -1) * ITEMS_PER_PAGE) + posts.length;
      const newTotalPostsAfterReply = currentTotalPosts + 1;
      const newTotalPages = Math.ceil(newTotalPostsAfterReply / ITEMS_PER_PAGE);

      if (page === totalPages && posts.length < ITEMS_PER_PAGE) {
        setPosts(prev => [...prev, newPost]);
         // If current page was already the last page and not full, it might still be the last page
        if (totalPages !== newTotalPages) { // If a new page was created
            setTotalPages(newTotalPages);
        }
      } else {
        // If new post makes current page full or pushes to a new page
        setTotalPages(newTotalPages);
        setPage(newTotalPages); // Navigate to the new last page
        // Data will be refetched by the useEffect listening on 'page'
      }
    }
  };

  return {
    user,
    authLoading,
    topic,
    posts,
    loadingData,
    replyContent,
    setReplyContent,
    page,
    setPage,
    totalPages,
    isSubmittingReply,
    handleSubmitReply,
    categorySlug,
    topicId
  };
};
