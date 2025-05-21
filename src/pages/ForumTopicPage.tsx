
import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useForumTopic } from "@/hooks/forum/useForumTopic";
import { useQuoteHandler } from "@/hooks/forum/topic/useQuoteHandler"; // New hook
import TopicLoadingStates from "@/components/forum/TopicPage/TopicLoadingStates"; // New component
import TopicView from "@/components/forum/TopicPage/TopicView"; // New component
import TopicDialogs from "@/components/forum/TopicPage/TopicDialogs"; // New component
// Removed unused imports like Link, Button, Card, CardContent, Loader2, ForumPagination,
// TopicHeaderDisplay, ForumPostCard, ReplyFormCard, EditPostDialog, DeletePostConfirmDialog,
// ForumPost type (if not needed elsewhere in this file), supabase, useToast.

const ForumTopicPage = () => {
  const navigate = useNavigate();
  const replyFormRef = useRef<HTMLDivElement>(null);
  
  const forumTopicHookData = useForumTopic();
  const {
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
  
  // This guard is important: if user is null and not authLoading, useEffect will redirect.
  // We don't want to render TopicLoadingStates if redirection is about to happen.
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
      
      {/* Render main content and dialogs only if user and topic exist and data is not in initial full load state */}
      {user && topic && ( // loadingData check removed here, TopicView handles its own internal post loading state
        <>
          <TopicView
            topic={topic}
            posts={posts}
            user={user}
            page={page}
            totalPages={totalPages}
            setPage={setPage}
            categorySlug={categorySlug}
            loadingData={loadingData} // Pass loadingData for initial post loading indicator
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
