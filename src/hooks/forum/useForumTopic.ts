
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

import { useForumTopicData } from "./topic/useForumTopicData";
import { useForumReplyHandler } from "./topic/useForumReplyHandler";
import { useForumPostManagement } from "./topic/useForumPostManagement";
import { useForumReactionHandler } from "./topic/useForumReactionHandler";
import { ForumPost } from "@/types/forum";

interface UseForumTopicProps {
  page: number;
  setPage: (page: number) => void;
}

export const useForumTopic = ({ page, setPage }: UseForumTopicProps) => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  // Changed to expect topicSlug from route parameters
  const { topicSlug: routeTopicSlugFromParams } = useParams<{ topicSlug: string }>();

  // Pass page to useForumTopicData, which now also uses topicSlug from useParams
  const forumTopicData = useForumTopicData(page); 

  const {
    topic,
    posts,
    setPosts,
    loadingData,
    totalPages,
    refreshData, 
    fetchData,    
    categorySlug, // This is now derived within useForumTopicData
  } = forumTopicData;

  const ITEMS_PER_PAGE = 10;

  const {
    replyContent,
    setReplyContent,
    handleSubmitReply,
    isSubmittingReply,
  } = useForumReplyHandler({
    topic,
    user,
    fetchTopicData: fetchData,
    currentPage: page,
    totalPages,
    postsOnCurrentPage: posts.length,
    itemsPerPage: ITEMS_PER_PAGE,
  });

  const {
    editingPost,
    showEditDialog,
    deletingPostId,
    showDeleteConfirmDialog,
    handleOpenEditDialog,
    handleCloseEditDialog,
    handleSaveEditedPost,
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
    handleConfirmDeletePost,
    submittingUpdatePost,
    submittingDeletePost,
  } = useForumPostManagement({
    topic,
    posts,
    setPosts: setPosts as React.Dispatch<React.SetStateAction<ForumPost[]>>,
    currentPage: page,
    fetchTopicData: fetchData, 
  });

  const {
    handleToggleReaction,
    submittingReaction,
  } = useForumReactionHandler({
    topic,
    user,
    posts,
    setPosts: setPosts as React.Dispatch<React.SetStateAction<ForumPost[]>>,
  });

  useEffect(() => {
    // Use routeTopicSlugFromParams to check if a topic is being requested
    if (!authLoading && !user && routeTopicSlugFromParams) {
      navigate("/auth", { replace: true });
    }
  }, [user, authLoading, navigate, routeTopicSlugFromParams]);

  const isProcessingPostAction = submittingUpdatePost || submittingDeletePost || submittingReaction;

  return {
    user,
    authLoading,
    topic,
    posts,
    setPosts, 
    loadingData,
    replyContent,
    setReplyContent,
    page,
    setPage,
    totalPages,
    isSubmittingReply,
    handleSubmitReply,
    categorySlug, // This comes from forumTopicData, derived from the topic
    topicId: topic?.id || null, // Keep original topic ID if needed elsewhere

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
    refreshTopicData: refreshData, 
  };
};
