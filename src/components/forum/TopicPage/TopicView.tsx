
import React from 'react';
import { ForumPost, ForumTopic } from '@/types/forum';
import type { User } from '@supabase/supabase-js';
import ForumPagination from '../ForumPagination';
import ForumPostCard from './ForumPostCard';
import ReplyFormCard from './ReplyFormCard';
import TopicHeaderDisplay from './TopicHeaderDisplay';

interface TopicViewProps {
  topic: ForumTopic;
  posts: ForumPost[];
  user: User | null;
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  categorySlug: string | undefined;
  replyContent: string;
  setReplyContent: (content: string) => void;
  handleSubmitReply: (e: React.FormEvent) => Promise<void>;
  isSubmittingReply: boolean;
  handleOpenEditDialog: (post: ForumPost) => void;
  handleOpenDeleteDialog: (postId: string) => void;
  handleQuotePost: (post: ForumPost) => void;
  handleToggleReaction: (postId: string, reactionType: 'like') => void;
  handleOpenPostHistoryDialog: (postId: string, postTitle?: string) => void;
  handleStartDirectMessage: (targetUserId: string) => void;
  isProcessingPostAction: boolean;
  replyFormRef: React.RefObject<HTMLDivElement>;
  loadingData: boolean;
}

const TopicView: React.FC<TopicViewProps> = ({
  topic,
  posts,
  user,
  page,
  totalPages,
  setPage,
  categorySlug,
  replyContent,
  setReplyContent,
  handleSubmitReply,
  isSubmittingReply,
  handleOpenEditDialog,
  handleOpenDeleteDialog,
  handleQuotePost,
  handleToggleReaction,
  handleOpenPostHistoryDialog,
  handleStartDirectMessage,
  isProcessingPostAction,
  replyFormRef,
  loadingData,
}) => {

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-4 lg:px-6 py-8">
      <TopicHeaderDisplay
        topic={topic}
        categorySlug={categorySlug}
        onReplyClick={() => replyFormRef.current?.scrollIntoView({ behavior: 'smooth' })}
      />

      {/* Posts List */}
      <div className="space-y-6 mt-6">
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
            onViewHistory={handleOpenPostHistoryDialog}
            onStartDirectMessage={handleStartDirectMessage}
            isTopicLocked={topic.is_locked}
            isProcessingAction={isProcessingPostAction || loadingData}
            topicTitle={topic.title}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8">
          <ForumPagination
            page={page} 
            totalPages={totalPages}
            setPage={setPage}
          />
        </div>
      )}

      {/* Reply Form */}
      {!topic.is_locked && (
        <div ref={replyFormRef} className="mt-8 scroll-m-20">
          <ReplyFormCard
            replyContent={replyContent}
            onReplyContentChange={setReplyContent}
            onSubmitReply={handleSubmitReply}
            isSubmitting={isSubmittingReply}
            isLocked={topic.is_locked}
            // currentUser prop removed as ReplyFormCard uses useAuth()
          />
        </div>
      )}
       {topic.is_locked && (
        <div className="mt-8 p-4 text-center bg-yellow-100 dark:bg-yellow-700/30 border border-yellow-300 dark:border-yellow-600 rounded-md">
            <p className="font-semibold text-yellow-700 dark:text-yellow-300">This topic is locked.</p>
            <p className="text-sm text-yellow-600 dark:text-yellow-400">Replies are not allowed.</p>
        </div>
      )}
    </div>
  );
};

export default TopicView;
