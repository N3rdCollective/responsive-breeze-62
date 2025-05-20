
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from "@/hooks/useAuth";
import { useToast } from '@/hooks/use-toast';
import { useForum } from "@/hooks/useForum"; // Ensure this is imported
import { ForumTopic, ForumPost, ForumPostReaction } from "@/types/forum";

const ITEMS_PER_PAGE = 10;

export const useForumTopic = () => {
  const { categorySlug, topicId: routeTopicId } = useParams<{ categorySlug: string, topicId: string }>(); // Renamed to routeTopicId
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    createPost,
    updatePost,
    deletePost,
    addReaction,
    removeReaction,
    submitting: isSubmittingCore, // Renamed to avoid conflict
    incrementViewCount 
  } = useForum();

  const [topic, setTopic] = useState<ForumTopic | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewCountIncremented, setViewCountIncremented] = useState(false);

  // State for editing/deleting posts
  const [editingPost, setEditingPost] = useState<ForumPost | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [isProcessingPostAction, setIsProcessingPostAction] = useState(false);


  useEffect(() => {
    setViewCountIncremented(false);
    setPage(1); 
  }, [routeTopicId]);

  const fetchTopicData = useCallback(async (currentPage = page) => { // Added currentPage param
    if (!routeTopicId) return;

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
      
      const fetchedTopic = { ...topicRawData } as ForumTopic;

      if (fetchedTopic.category && fetchedTopic.category.slug !== categorySlug) {
        navigate(`/members/forum/${fetchedTopic.category.slug}/${fetchedTopic.slug || fetchedTopic.id}`);
        return;
      }
      
      setTopic(fetchedTopic);
      
      const { count, error: countError } = await supabase
        .from('forum_posts')
        .select('*', { count: 'exact', head: true })
        .eq('topic_id', fetchedTopic.id); 
        
      if (countError) throw countError;
      
      const totalPostsCount = count || 0;
      const totalPageCount = Math.ceil(totalPostsCount / ITEMS_PER_PAGE);
      setTotalPages(totalPageCount || 1);
      
      // Ensure current page is valid after potential deletions
      const validCurrentPage = Math.min(currentPage, totalPageCount || 1);
      if (currentPage !== validCurrentPage && totalPostsCount > 0) {
        setPage(validCurrentPage); // This will trigger a re-fetch if page changed
        // If page didn't change but currentPage was adjusted, we need to fetch with validCurrentPage
        // This will be handled by the useEffect below that listens to 'page'
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
        .range((validCurrentPage - 1) * ITEMS_PER_PAGE, validCurrentPage * ITEMS_PER_PAGE - 1);
        
      if (postsError) throw postsError;

      setPosts((postsRawData || []) as ForumPost[]);
      
      if (currentPage === 1 && fetchedTopic.id && !viewCountIncremented) {
        try {
          await incrementViewCount(fetchedTopic.id);
          setViewCountIncremented(true);
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
  }, [routeTopicId, categorySlug, navigate, page, viewCountIncremented, user]); // Removed incrementViewCount, kept 'page'

  useEffect(() => {
    if (user || !authLoading) {
      fetchTopicData(page); // Pass current page to fetchTopicData
    }
  }, [user, authLoading, fetchTopicData, page]); // Add page to dependencies

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = replyContent;
    if (!replyContent.trim() || !tempDiv.textContent?.trim()) {
      toast({ title: "Empty reply", description: "Please enter a message for your reply.", variant: "destructive" });
      return;
    }

    if (!topic || !topic.id) return;
    if (topic.is_locked) {
      toast({ title: "Topic is locked", description: "This topic is locked and cannot be replied to.", variant: "destructive" });
      return;
    }
    setIsProcessingPostAction(true);
    const result = await createPost({ topic_id: topic.id, content: replyContent });
    setIsProcessingPostAction(false);
    
    if (result) {
      setReplyContent("");
      // Instead of complex client-side pagination update, just refetch current page or navigate to new page.
      // For simplicity, after a reply, it often makes sense to go to the last page.
      const { count } = await supabase.from('forum_posts').select('*', { count: 'exact', head: true }).eq('topic_id', topic.id);
      const newTotalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE);
      if (page === newTotalPages && posts.length < ITEMS_PER_PAGE && newTotalPages === totalPages) {
        // If on the last page and it's not full, append locally
         setPosts(prev => [...prev, result as ForumPost]);
      } else {
        setPage(newTotalPages); // This will trigger a refetch via useEffect
      }
      setTotalPages(newTotalPages);
    }
  };

  const handleOpenEditDialog = (postToEdit: ForumPost) => {
    if (topic?.is_locked) {
        toast({ title: "Topic Locked", description: "Cannot edit posts in a locked topic.", variant: "destructive" });
        return;
    }
    setEditingPost(postToEdit);
    setShowEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setShowEditDialog(false);
    setEditingPost(null);
  };

  const handleSaveEditedPost = async (newContent: string) => {
    if (!editingPost || !editingPost.id) return;
    if (topic?.is_locked) return; // Should be handled by dialog button too

    setIsProcessingPostAction(true);
    const updatedPostData = await updatePost(editingPost.id, newContent);
    setIsProcessingPostAction(false);

    if (updatedPostData) {
      setPosts(prevPosts => prevPosts.map(p => p.id === updatedPostData.id ? { ...p, ...updatedPostData, forum_post_reactions: p.forum_post_reactions } : p)); // Preserve existing reactions if not returned by update
      handleCloseEditDialog();
    }
  };
  
  const handleOpenDeleteDialog = (postIdToDelete: string) => {
    if (topic?.is_locked) {
        toast({ title: "Topic Locked", description: "Cannot delete posts in a locked topic.", variant: "destructive" });
        return;
    }
    setDeletingPostId(postIdToDelete);
    setShowDeleteConfirmDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setShowDeleteConfirmDialog(false);
    setDeletingPostId(null);
  };

  const handleConfirmDeletePost = async () => {
    if (!deletingPostId) return;
    if (topic?.is_locked) return; // Should be handled by dialog button too

    // Special check: prevent deleting the first post of a topic for now
    // This logic might need to be more complex (e.g. delete topic if last post is deleted)
    const postToDelete = posts.find(p => p.id === deletingPostId);
    const isFirstPost = posts.findIndex(p => p.id === deletingPostId) === 0 && page === 1;
    if (isFirstPost && posts.length > 1) {
         toast({ title: "Action Denied", description: "The first post of a topic cannot be deleted if other replies exist. Consider editing it or contacting a moderator to delete the entire topic.", variant: "destructive" });
         handleCloseDeleteDialog();
         return;
    }
    // If it's the first and ONLY post, deleting it effectively deletes the topic content.
    // The topic itself would remain for now. Could add logic to delete topic if last post deleted.

    setIsProcessingPostAction(true);
    const success = await deletePost(deletingPostId);
    setIsProcessingPostAction(false);

    if (success) {
      // Refetch data for current page to handle pagination and counts correctly
      fetchTopicData(page); 
      handleCloseDeleteDialog();
    }
  };

  const handleToggleReaction = async (postId: string, reactionType: 'like') => {
    if (!user) {
      toast({ title: "Login Required", description: "You need to be logged in to react.", variant: "destructive"});
      return;
    }
    if (topic?.is_locked) {
      toast({ title: "Topic Locked", description: "Cannot react to posts in a locked topic.", variant: "default" }); // Not destructive, just info
      return;
    }

    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex === -1) return;

    const currentPost = posts[postIndex];
    const existingReaction = currentPost.forum_post_reactions?.find(r => r.user_id === user.id && r.reaction_type === reactionType);

    setIsProcessingPostAction(true); // Generic loading for quick actions
    if (existingReaction) {
      const success = await removeReaction(postId); // Assuming removeReaction takes postId and userId is inferred by RLS
      if (success) {
        const updatedReactions = currentPost.forum_post_reactions?.filter(r => r.id !== existingReaction.id);
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, forum_post_reactions: updatedReactions } : p));
      }
    } else {
      const newReactionData = await addReaction(postId, reactionType);
      if (newReactionData) {
        const updatedReactions = [...(currentPost.forum_post_reactions || []), newReactionData];
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, forum_post_reactions: updatedReactions } : p));
      }
    }
    setIsProcessingPostAction(false);
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
    isSubmittingReply: isSubmittingCore || isProcessingPostAction, // Combine loading states
    handleSubmitReply,
    categorySlug,
    topicId: routeTopicId,

    // Edit/Delete post states and handlers
    editingPost,
    showEditDialog,
    deletingPostId,
    showDeleteConfirmDialog,
    isProcessingPostAction,
    handleOpenEditDialog,
    handleCloseEditDialog,
    handleSaveEditedPost,
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
    handleConfirmDeletePost,
    handleToggleReaction,
  };
};
