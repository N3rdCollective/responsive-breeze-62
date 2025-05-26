import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useForumTopic } from "@/hooks/forum/useForumTopic";
import { useQuoteHandler } from "@/hooks/forum/topic/useQuoteHandler";
import TopicLoadingStates from "@/components/forum/TopicPage/TopicLoadingStates";
import TopicView from "@/components/forum/TopicPage/TopicView";
import TopicDialogs from "@/components/forum/TopicPage/TopicDialogs";
import { useForumPagination } from "@/hooks/forum/useForumPagination";
import { useConversations } from "@/hooks/useConversations";
import { useToast } from "@/hooks/use-toast";
import { usePollVoting } from "@/hooks/forum/topic/usePollVoting";

const ForumTopicPage = () => {
  const navigate = useNavigate();
  const replyFormRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
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

  const { startOrCreateConversation } = useConversations();

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

  // Instantiate the poll voting hook
  const { handlePollVote, isVoting: isSubmittingVote } = usePollVoting({
    pollId: topic?.poll?.id,
    userId: user?.id,
    onVoteSuccess: refreshTopicData,
  });

  const handleStartDirectMessage = async (targetUserId: string) => {
    if (!user) {
      toast({ title: "Authentication required", description: "Please log in to send messages.", variant: "destructive" });
      navigate('/auth');
      return;
    }
    if (user.id === targetUserId) {
      toast({ title: "Info", description: "You cannot start a conversation with yourself.", variant: "default" });
      return;
    }
    try {
      const conversationId = await startOrCreateConversation(targetUserId);
      if (conversationId) {
        navigate('/messages', { state: { selectConversationWithUser: targetUserId, conversationId: conversationId } });
      } else {
        toast({ title: "Error", description: "Could not start or find conversation.", variant: "destructive" });
      }
    } catch (error: any) {
      console.error("Failed to start direct message:", error);
      toast({ title: "Error", description: error.message || "Failed to start conversation.", variant: "destructive" });
    }
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
        </>
      )}
    </div>
  );
};

export default ForumTopicPage;
