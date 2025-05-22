
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
  const forumTopicData = useForumTopicData(); // Get the whole object first
  
  const {
    topic,
    posts,
    setPosts, // Now available
    loadingData,
    page,
    setPage,
    totalPages,
    fetchTopicData, // Now available
    categorySlug, // Now available
    routeTopicId, // Now available (actual topic ID/slug from data hook)
    ITEMS_PER_PAGE, // Now available
  } = forumTopicData;

  const {
    replyContent,
    setReplyContent,
    handleSubmitReply,
    isSubmittingReply,
  } = useForumReplyHandler({
    topic,
    user,
    // Pass the fetchTopicData from useForumTopicData to allow reply handler to refresh data
    fetchTopicData: () => fetchTopicData(page), // Or pass fetchTopicData directly if its signature matches
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
    fetchTopicData: () => fetchTopicData(page), // Similar to reply handler
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
    // Use routeTopicIdFromParams for this initial auth check, as 'routeTopicId' from hook might not be set yet.
    if (!authLoading && !user && routeTopicIdFromParams) {
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
    categorySlug, 
    topicId: routeTopicId, // Use the consistent topicId from useForumTopicData

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
    // Expose refreshTopicData if TopicPage needs it directly
    refreshTopicData: forumTopicData.refreshTopicData, 
  };
};
