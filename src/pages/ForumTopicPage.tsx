
import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import ForumPagination from "@/components/forum/ForumPagination"; // Using the existing component
import { useForumTopic } from "@/hooks/forum/useForumTopic";
import TopicHeaderDisplay from "@/components/forum/TopicPage/TopicHeaderDisplay";
import ForumPostCard from "@/components/forum/TopicPage/ForumPostCard";
import ReplyFormCard from "@/components/forum/TopicPage/ReplyFormCard";

const ForumTopicPage = () => {
  const navigate = useNavigate();
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
  } = useForumTopic();
  
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);
  
  if (authLoading || (loadingData && !topic)) { // Show loader if auth is loading OR data is loading and no topic yet
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
    // This case should ideally be handled by the redirect,
    // but as a fallback or if redirect hasn't happened yet.
    return null; 
  }
  
  if (!topic) {
    // This implies loadingData is false and topic is still null, meaning topic not found or error.
    // The hook useForumTopic handles navigation for "not found", so this state might be brief
    // or indicate an unhandled error case not leading to navigation.
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
          
          {loadingData && posts.length === 0 && ( // Show loader specifically for posts if topic is loaded but posts are still fetching
             <div className="py-10 flex justify-center items-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
             </div>
          )}

          <div className="space-y-6">
            {posts.map((post, index) => (
              <ForumPostCard key={post.id} post={post} isFirstPost={index === 0 && page === 1} />
            ))}

            {totalPages > 1 && (
               <div className="py-4"> {/* Ensure pagination has some spacing */}
                <ForumPagination
                    page={page}
                    totalPages={totalPages}
                    setPage={setPage}
                />
               </div>
            )}
            
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
  );
};

export default ForumTopicPage;
