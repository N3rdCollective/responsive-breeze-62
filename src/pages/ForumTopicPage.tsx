
import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useForumTopic } from "@/hooks/forum/useForumTopic";
import { useQuoteHandler } from "@/hooks/forum/topic/useQuoteHandler";
import TopicLoadingStates from "@/components/forum/TopicPage/TopicLoadingStates";
import TopicView from "@/components/forum/TopicPage/TopicView";
import TopicDialogs from "@/components/forum/TopicPage/TopicDialogs";
import { useForumPagination } from "@/hooks/forum/useForumPagination";
import { usePollVoting } from "@/hooks/forum/topic/usePollVoting";
import { usePostHistoryDialog } from "@/hooks/forum/topic/usePostHistoryDialog";
import { useDirectMessagingHandler } from "@/hooks/forum/topic/useDirectMessagingHandler";

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

  const {
    showPostHistoryDialog,
    postHistoryPostId,
    postHistoryTitle,
    handleOpenPostHistoryDialog,
    handleClosePostHistoryDialog,
  } = usePostHistoryDialog();

  const { handleStartDirectMessage } = useDirectMessagingHandler({ currentUser: user });

  const { handlePollVote, isVoting: isSubmittingVote } = usePollVoting({
    pollId: topic?.poll?.id,
    userId: user?.id,
    onVoteSuccess: refreshTopicData,
  });
  
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);
  
  if (!user && !authLoading) {
    return null;
  }

  // Log the topic data to inspect its contents, especially topic.poll
  if (topic) {
    console.log("ForumTopicPage: Topic data being passed to TopicView:", JSON.stringify(topic, null, 2));
    if (topic.poll) {
      console.log("ForumTopicPage: Poll specific data:", JSON.stringify(topic.poll, null, 2));
    }
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
            handleOpenPostHistoryDialog={handleOpenPostHistoryDialog} // This comes from the new hook
            handleStartDirectMessage={handleStartDirectMessage} // This comes from the new hook
            isProcessingPostAction={isProcessingPostAction}
            replyFormRef={replyFormRef}
            handlePollVote={handlePollVote}
            isSubmittingVote={isSubmittingVote}
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
            showPostHistoryDialog={showPostHistoryDialog} // From new hook
            postHistoryPostId={postHistoryPostId} // From new hook
            postHistoryTitle={postHistoryTitle} // From new hook
            handleClosePostHistoryDialog={handleClosePostHistoryDialog} // From new hook
          />
        </>
      )}
    </div>
  );
};

export default ForumTopicPage;
