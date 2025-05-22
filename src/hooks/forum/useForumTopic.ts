
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

import { useForumTopicData } from "./topic/useForumTopicData";
import { useForumReplyHandler } from "./topic/useForumReplyHandler";
import { useForumPostManagement } from "./topic/useForumPostManagement";
import { useForumReactionHandler } from "./topic/useForumReactionHandler";

// The hook now accepts page and setPage from its consumer (ForumTopicPage)
interface UseForumTopicProps {
  page: number;
  setPage: (page: number) => void;
}

export const useForumTopic = ({ page, setPage }: UseForumTopicProps) => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { topicId: routeTopicIdFromParams } = useParams<{ topicId: string }>();

  // Pass the current page to useForumTopicData
  const forumTopicData = useForumTopicData(page); 
  
  const {
    topic,
    posts,
    loadingData,
    // page is no longer from forumTopicData
    // setPage is no longer from forumTopicData
    totalPages,
    refreshData,
    categorySlug,
  } = forumTopicData;

  // Set up a constant for the ITEMS_PER_PAGE value
  const ITEMS_PER_PAGE = 10;

  const {
    replyContent,
    setReplyContent,
    handleSubmitReply,
    isSubmittingReply,
  } = useForumReplyHandler({
    topic,
    user,
    fetchTopicData: () => Promise.resolve(true), // Simplified as we're now using refreshData
    currentPage: page, // Pass current page from prop
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
    setPosts: () => {}, // This is now handled by useForumTopicData's refresh
    currentPage: page, // Pass current page from prop
    fetchTopicData: () => Promise.resolve(true), // Simplified as we're now using refreshData
  });

  const {
    handleToggleReaction,
    submittingReaction,
  } = useForumReactionHandler({
    topic,
    user,
    posts,
    setPosts: () => {}, // This is now handled by refreshData
  });

  useEffect(() => {
    if (!authLoading && !user && routeTopicIdFromParams) {
      navigate("/auth", { replace: true });
    }
  }, [user, authLoading, navigate, routeTopicIdFromParams]);

  const isProcessingPostAction = submittingUpdatePost || submittingDeletePost || submittingReaction;

  return {
    user,
    authLoading,
    topic,
    posts,
    loadingData,
    replyContent,
    setReplyContent,
    page, // Return page prop
    setPage, // Return setPage prop
    totalPages,
    isSubmittingReply,
    handleSubmitReply,
    categorySlug, 
    topicId: topic?.id || null,

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
