
import React from 'react';
import { Loader2 } from "lucide-react";
import TopicHeaderDisplay from "@/components/forum/TopicPage/TopicHeaderDisplay";
import ForumPostCard from "@/components/forum/TopicPage/ForumPostCard";
import ForumPagination from "@/components/forum/ForumPagination";
import ReplyFormCard from "@/components/forum/TopicPage/ReplyFormCard";
import { ForumPost, ForumTopic } from '@/types/forum';
import type { User } from '@supabase/supabase-js';

interface TopicViewProps {
  topic: ForumTopic;
  posts: ForumPost[];
  user: User | null; // currentUser for ForumPostCard
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  categorySlug?: string;
  loadingData: boolean; // To show loader when posts are empty but still loading
  
  replyContent: string;
  setReplyContent: (content: string) => void;
  handleSubmitReply: (e: React.FormEvent) => Promise<void>;
  isSubmittingReply: boolean;
  
  handleOpenEditDialog: (post: ForumPost) => void;
  handleOpenDeleteDialog: (postId: string) => void;
  handleQuotePost: (post: ForumPost) => Promise<void>;
  handleToggleReaction: (postId: string, reactionType: 'like') => void;
  isProcessingPostAction: boolean;
  replyFormRef: React.RefObject<HTMLDivElement>;
}

const TopicView: React.FC<TopicViewProps> = ({
  topic,
  posts,
  user,
  page,
  totalPages,
  setPage,
  categorySlug,
  loadingData,
  replyContent,
  setReplyContent,
  handleSubmitReply,
  isSubmittingReply,
  handleOpenEditDialog,
  handleOpenDeleteDialog,
  handleQuotePost,
  handleToggleReaction,
  isProcessingPostAction,
  replyFormRef,
}) => {
  return (
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
              isProcessingAction={isProcessingPostAction || (isSubmittingReply && post.id === 'temp-replying-post-id')} // Example temp ID logic
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
  );
};

export default TopicView;
