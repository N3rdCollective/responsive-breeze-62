
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

// Import the new specialized hooks
import { useForumTopicData } from "./topic/useForumTopicData";
import { useForumReplyHandler } from "./topic/useForumReplyHandler";
import { useForumPostManagement } from "./topic/useForumPostManagement";
import { useForumReactionHandler } from "./topic/useForumReactionHandler";

export const useForumTopic = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { topicId: routeTopicIdFromParams } = useParams<{ topicId: string }>(); // Get topicId for auth check

  // Initialize the specialized hooks
  const {
    topic,
    posts,
    setPosts, // Pass setPosts for optimistic updates
    loadingData,
    page,
    setPage,
    totalPages,
    fetchTopicData,
    categorySlug,
    routeTopicId, // Use this from useForumTopicData
    ITEMS_PER_PAGE,
  } = useForumTopicData(); // Uses initial page 1 by default

  const {
    replyContent,
    setReplyContent,
    handleSubmitReply,
    isSubmittingReply,
  } = useForumReplyHandler({
    topic,
    user,
    fetchTopicData,
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
    setPosts,
    currentPage: page,
    fetchTopicData,
  });

  const {
    handleToggleReaction,
    submittingReaction,
  } = useForumReactionHandler({
    topic,
    user,
    posts,
    setPosts,
  });

  // Effect for redirecting if not authenticated
  useEffect(() => {
    if (!authLoading && !user && routeTopicIdFromParams) { // Check if topicId is present to only run on topic page
      navigate("/auth", { replace: true });
    }
  }, [user, authLoading, navigate, routeTopicIdFromParams]);

  // Combined loading state for any post-related actions
  const isProcessingPostAction = submittingUpdatePost || submittingDeletePost || submittingReaction;

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
    categorySlug, // from useForumTopicData
    topicId: routeTopicId, // from useForumTopicData

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
