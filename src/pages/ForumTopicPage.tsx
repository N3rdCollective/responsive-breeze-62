import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useForumTopic } from "@/hooks/forum/useForumTopic";
import { useQuoteHandler } from "@/hooks/forum/topic/useQuoteHandler";
import TopicLoadingStates from "@/components/forum/TopicPage/TopicLoadingStates";
import TopicView from "@/components/forum/TopicPage/TopicView";
import TopicDialogs from "@/components/forum/TopicPage/TopicDialogs";
import ReportContentDialog from "@/components/moderation/ReportContentDialog";
import { useForumPagination } from "@/hooks/forum/useForumPagination";
import { usePollVoting } from "@/hooks/forum/topic/usePollVoting";
import { usePostHistoryDialog } from "@/hooks/forum/topic/usePostHistoryDialog";
import { useDirectMessagingHandler } from "@/hooks/forum/topic/useDirectMessagingHandler";
import { ForumPost } from "@/types/forum";

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

  // State for ReportContentDialog
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportDialogData, setReportDialogData] = useState<{
    contentType: 'post' | 'topic';
    contentId: string;
    reportedUserId: string;
    contentPreview?: string;
    topicId?: string;
  } | null>(null);

  const handleOpenReportDialog = (
    contentType: 'post' | 'topic',
    contentId: string,
    reportedUserId: string,
    contentPreview?: string
  ) => {
    if (!user) {
      // Optionally, prompt user to log in or show a toast
      console.warn("User must be logged in to report content.");
      return;
    }
    setReportDialogData({
      contentType,
      contentId,
      reportedUserId,
      contentPreview,
      topicId: topic?.id, // Always pass current topic ID
    });
    setShowReportDialog(true);
  };
  
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
      <main className="pt-24">
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
              handleOpenPostHistoryDialog={handleOpenPostHistoryDialog}
              handleStartDirectMessage={handleStartDirectMessage}
              isProcessingPostAction={isProcessingPostAction}
              replyFormRef={replyFormRef}
              handlePollVote={handlePollVote}
              isSubmittingVote={isSubmittingVote}
              onOpenReportDialog={handleOpenReportDialog}
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
              showPostHistoryDialog={showPostHistoryDialog}
              postHistoryPostId={postHistoryPostId}
              postHistoryTitle={postHistoryTitle}
              handleClosePostHistoryDialog={handleClosePostHistoryDialog}
            />
            {reportDialogData && (
              <ReportContentDialog
                isOpen={showReportDialog}
                onOpenChange={setShowReportDialog}
                contentType={reportDialogData.contentType}
                contentId={reportDialogData.contentId}
                reportedUserId={reportDialogData.reportedUserId}
                contentPreview={reportDialogData.contentPreview}
                topicId={reportDialogData.topicId}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default ForumTopicPage;
