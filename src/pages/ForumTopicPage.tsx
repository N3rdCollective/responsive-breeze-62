import React, { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import ForumPagination from "@/components/forum/ForumPagination";
import { useForumTopic } from "@/hooks/forum/useForumTopic";
import TopicHeaderDisplay from "@/components/forum/TopicPage/TopicHeaderDisplay";
import ForumPostCard from "@/components/forum/TopicPage/ForumPostCard";
import ReplyFormCard from "@/components/forum/TopicPage/ReplyFormCard";
import EditPostDialog from "@/components/forum/TopicPage/EditPostDialog";
import DeletePostConfirmDialog from "@/components/forum/TopicPage/DeletePostConfirmDialog";
import { ForumPost } from "@/types/forum";

const ForumTopicPage = () => {
  const navigate = useNavigate();
  const replyFormRef = useRef<HTMLDivElement>(null);
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
  } = useForumTopic();
  
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);
  
  const handleQuotePost = (postToQuote: ForumPost) => {
    const authorName = postToQuote.profile?.display_name || postToQuote.profile?.username || 'A user';
    setReplyContent(`<blockquote><p><strong>${authorName} wrote:</strong></p>${postToQuote.content}</blockquote><p>&nbsp;</p>`);
    replyFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  
  if (authLoading || (loadingData && !topic)) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-20 px-4 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }
  
  if (!user) {
    return null; 
  }
  
  if (!topic) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-20 px-4 max-w-6xl mx-auto">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-lg font-medium mb-2">Topic not found</p>
              <p className="text-muted-foreground mb-4">
                The forum topic you're looking for might not exist or there was an issue loading it.
              </p>
              <Button asChild>
                <Link to="/members/forum">Back to Forum</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="pt-20 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <TopicHeaderDisplay topic={topic} categorySlug={categorySlug} />
          
          {loadingData && posts.length === 0 && (
             <div className="py-10 flex justify-center items-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
             </div>
          )}

          <div className="space-y-6">
            {posts.map((post, index) => (
              <ForumPostCard 
                key={post.id} 
                post={post} 
                isFirstPost={index === 0 && page === 1}
                currentUser={user}
                onEdit={handleOpenEditDialog}
                onDelete={handleOpenDeleteDialog}
                onQuote={handleQuotePost}
                onToggleReaction={handleToggleReaction}
                isTopicLocked={topic.is_locked}
                isProcessingAction={isProcessingPostAction || (isSubmittingReply && post.id === 'temp-replying-post-id')}
              />
            ))}

            {totalPages > 1 && (
               <div className="py-4">
                <ForumPagination
                    page={page}
                    totalPages={totalPages}
                    setPage={setPage}
                />
               </div>
            )}
            
            <div ref={replyFormRef}>
              <ReplyFormCard
                replyContent={replyContent}
                onReplyContentChange={setReplyContent}
                onSubmitReply={handleSubmitReply}
                isSubmitting={isSubmittingReply}
                isLocked={topic.is_locked}
              />
            </div>
          </div>
        </div>
      </div>

      {editingPost && (
        <EditPostDialog
          open={showEditDialog}
          onOpenChange={handleCloseEditDialog}
          postContent={editingPost.content}
          onSave={handleSaveEditedPost}
          isSaving={isProcessingPostAction}
          topicIsLocked={topic.is_locked}
        />
      )}

      {deletingPostId && (
        <DeletePostConfirmDialog
          open={showDeleteConfirmDialog}
          onOpenChange={handleCloseDeleteDialog}
          onConfirm={handleConfirmDeletePost}
          isDeleting={isProcessingPostAction}
          topicIsLocked={topic.is_locked}
        />
      )}
    </div>
  );
};

export default ForumTopicPage;
