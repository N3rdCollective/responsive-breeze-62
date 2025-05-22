
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
    setPosts,
    loadingData,
    // page is no longer from forumTopicData
    // setPage is no longer from forumTopicData
    totalPages,
    fetchTopicData, 
    categorySlug, 
    routeTopicId, 
    ITEMS_PER_PAGE,
  } = forumTopicData;

  const {
    replyContent,
    setReplyContent,
    handleSubmitReply,
    isSubmittingReply,
  } = useForumReplyHandler({
    topic,
    user,
    fetchTopicData: () => fetchTopicData(page), // Pass current page from prop
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
    setPosts,
    currentPage: page, // Pass current page from prop
    fetchTopicData: () => fetchTopicData(page), // Pass current page from prop
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
    topicId: routeTopicId, 

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
    refreshTopicData: forumTopicData.refreshTopicData, 
  };
};
