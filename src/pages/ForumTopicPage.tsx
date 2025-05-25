
import React, { useEffect, useRef, useState } from "react"; // Added useState
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

  // State for Post Edit History Dialog
  const [showPostHistoryDialog, setShowPostHistoryDialog] = useState(false);
  const [postHistoryPostId, setPostHistoryPostId] = useState<string | null>(null);
  const [postHistoryTitle, setPostHistoryTitle] = useState<string | undefined>(undefined);

  const handleOpenPostHistoryDialog = (postId: string, postTitle?: string) => {
    setPostHistoryPostId(postId);
    setPostHistoryTitle(postTitle);
    setShowPostHistoryDialog(true);
  };

  const handleClosePostHistoryDialog = () => {
    setShowPostHistoryDialog(false);
    setPostHistoryPostId(null);
    setPostHistoryTitle(undefined);
  };
  
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
            handleOpenPostHistoryDialog={handleOpenPostHistoryDialog} // Pass new handler
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
            // Pass props for PostEditHistoryDialog
            showPostHistoryDialog={showPostHistoryDialog}
            postHistoryPostId={postHistoryPostId}
            postHistoryTitle={postHistoryTitle}
            handleClosePostHistoryDialog={handleClosePostHistoryDialog}
          />
        </>
      )}
    </div>
  );
};

export default ForumTopicPage;
