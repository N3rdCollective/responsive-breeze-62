
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

import { useForumTopicData } from "./topic/useForumTopicData";
import { useForumReplyHandler } from "./topic/useForumReplyHandler";
import { useForumPostManagement } from "./topic/useForumPostManagement";
import { useForumReactionHandler } from "./topic/useForumReactionHandler";
import { ForumPost } from "@/types/forum"; // Import ForumPost for setPosts type

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
    setPosts, // Destructure setPosts
    loadingData,
    totalPages,
    refreshData,
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
    fetchTopicData: refreshData, // Use refreshData directly
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
    setPosts: setPosts as React.Dispatch<React.SetStateAction<ForumPost[]>>, // Pass the actual setPosts
    currentPage: page, 
    fetchTopicData: refreshData, // Use refreshData directly
  });

  const {
    handleToggleReaction,
    submittingReaction,
  } = useForumReactionHandler({
    topic,
    user,
    posts,
    setPosts: setPosts as React.Dispatch<React.SetStateAction<ForumPost[]>>, // Pass the actual setPosts
  });

  useEffect(() => {
    if (!authLoading && !user && routeTopicIdFromParams) {
      navigate("/auth", { replace: true });
    }
  }, [user, authLoading, navigate, routeTopicIdFromParams]);

  const isProcessingPostAction = submittingUpdatePost || submittingDeletePost || submittingReaction;

  // Make sure all returned values are correct
  return {
    user,
    authLoading,
    topic,
    posts,
    // setPosts, // No need to return setPosts from here unless ForumTopicPage needs it directly
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
    refreshTopicData: refreshData, 
  };
};

