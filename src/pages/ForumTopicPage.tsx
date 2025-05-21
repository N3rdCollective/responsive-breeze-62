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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ForumTopicPage = () => {
  const navigate = useNavigate();
  const replyFormRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
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
  
  const handleQuotePost = async (postToQuote: ForumPost) => {
    if (!user || !topic) return;

    const authorName = postToQuote.profile?.display_name || postToQuote.profile?.username || 'A user';
    const quotedAuthorDisplayName = postToQuote.profile?.display_name || postToQuote.profile?.username || 'User';
    const currentUserDisplayName = user.user_metadata?.display_name || user.user_metadata?.username || 'Someone';

    setReplyContent(prevContent => 
      `${prevContent}<blockquote><p><strong>${authorName} wrote:</strong></p>${postToQuote.content}</blockquote><p>&nbsp;</p>`
    );
    replyFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Send notification if the quoter is not the author of the quoted post
    if (postToQuote.user_id !== user.id) {
      const notificationData = {
        recipient_id: postToQuote.user_id,
        actor_id: user.id,
        type: 'generic' as const, // Using 'generic' due to read-only constraints
        topic_id: topic.id,
        post_id: postToQuote.id, // ID of the post being quoted
        content_summary: `${currentUserDisplayName} quoted your post in "${topic.title}"`,
        details: { 
          true_type: "quote_post", // For potential future specific handling
          quoted_post_id: postToQuote.id,
          topic_slug: topic.slug,
          topic_id: topic.id,
          topic_title: topic.title,
          actor_display_name: currentUserDisplayName,
          actor_username: user.user_metadata?.username,
          actor_id: user.id,
          quoted_author_id: postToQuote.user_id,
          quoted_author_display_name: quotedAuthorDisplayName,
        },
        // Link to the topic page, ideally it would link to the new post containing the quote once created
        // For now, linking to the quoted post or the topic.
        link_url: `/members/forum/topic/${topic.slug}/${postToQuote.id}` 
      };

      const { error } = await supabase.from('forum_notifications').insert(notificationData);

      if (error) {
        console.error("Error creating quote notification:", error);
        toast({
          title: "Error",
          description: "Could not send quote notification.",
          variant: "destructive",
        });
      }
    }
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
