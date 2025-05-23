
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
  const { topicId: routeTopicIdFromParams } = useParams<{ topicId: string }>();

  const forumTopicData = useForumTopicData(page);

  const {
    topic,
    posts,
    setPosts,
    loadingData,
    totalPages,
    refreshData, // This is the full refresh: () => Promise<void>
    fetchData,    // This is for specific page: (pageToFetch?: number) => Promise<void>
    categorySlug,
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
    fetchTopicData: fetchData, // Use fetchData for paged refreshes
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
    fetchTopicData: fetchData, // Use fetchData for paged refreshes
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
    setPosts, // Exporting setPosts for optimistic updates
    loadingData,
    replyContent,
    setReplyContent,
    page,
    setPage,
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
    refreshTopicData: refreshData, // This is the full refresh for the page level
  };
};

