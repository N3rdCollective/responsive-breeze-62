import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useForumTopic } from "@/hooks/forum/useForumTopic";
import { useQuoteHandler } from "@/hooks/forum/topic/useQuoteHandler";
import TopicLoadingStates from "@/components/forum/TopicPage/TopicLoadingStates";
import TopicView from "@/components/forum/TopicPage/TopicView";
import TopicDialogs from "@/components/forum/TopicPage/TopicDialogs";
import { useForumPagination } from "@/hooks/forum/useForumPagination";

const ForumTopicPage = () => {
  const navigate = useNavigate();
  const replyFormRef = useRef<HTMLDivElement>(null);
  
  const { page, setPage: setPageViaPaginationHook } = useForumPagination();
  
  const forumTopicHookData = useForumTopic({ page, setPage: setPageViaPaginationHook });
  const {
    user,
    authLoading,
    topic,
    posts,
    loadingData,
    replyContent,
    setReplyContent,
    totalPages,
    isSubmittingReply,
    handleSubmitReply,
    categorySlug,
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
    refreshTopicData,
  } = forumTopicHookData;

  const { handleQuotePost } = useQuoteHandler({
    user,
    topic,
    setReplyContent,
    replyFormRef,
  });
  
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);
  
  if (!user && !authLoading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <TopicLoadingStates 
        authLoading={authLoading}
        loadingData={loadingData}
        user={user}
        topic={topic}
      />
      
      {user && topic && (
        <>
          <TopicView
            topic={topic}
            posts={posts}
            user={user}
            page={page}
            totalPages={totalPages}
            setPage={setPageViaPaginationHook}
            categorySlug={categorySlug}
            loadingData={loadingData} 
            replyContent={replyContent}
            setReplyContent={setReplyContent}
            handleSubmitReply={handleSubmitReply}
            isSubmittingReply={isSubmittingReply}
            handleOpenEditDialog={handleOpenEditDialog}
            handleOpenDeleteDialog={handleOpenDeleteDialog}
            handleQuotePost={handleQuotePost}
            handleToggleReaction={handleToggleReaction}
            isProcessingPostAction={isProcessingPostAction}
            replyFormRef={replyFormRef}
          />
          <TopicDialogs
            editingPost={editingPost}
            showEditDialog={showEditDialog}
            deletingPostId={deletingPostId}
            showDeleteConfirmDialog={showDeleteConfirmDialog}
            isProcessingPostAction={isProcessingPostAction}
            topicIsLocked={topic.is_locked}
            handleCloseEditDialog={handleCloseEditDialog}
            handleSaveEditedPost={handleSaveEditedPost}
            handleCloseDeleteDialog={handleCloseDeleteDialog}
            handleConfirmDeletePost={handleConfirmDeletePost}
          />
        </>
      )}
    </div>
  );
};

export default ForumTopicPage;
