import React from 'react';
import { ForumPost, ForumTopic } from '@/types/forum';
import type { User } from '@supabase/supabase-js';
import ForumPagination from '../ForumPagination';
import ForumPostCard from './ForumPostCard';
import ReplyFormCard from './ReplyFormCard';
import TopicHeaderDisplay from './TopicHeaderDisplay';
import PollDisplay from './PollDisplay';
import TopicModerationToolbar from './TopicModerationToolbar';
import { useStaffPermissions } from '@/hooks/forum/useStaffPermissions';

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
  handlePollVote: (optionId: string) => Promise<void>;
  isSubmittingVote: boolean;
  onOpenReportDialog: ( // Add this prop
    contentType: 'post' | 'topic',
    contentId: string,
    reportedUserId: string,
    contentPreview?: string
  ) => void;
  onRefreshTopic: () => Promise<void>; // Add this new prop
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
  handlePollVote,
  isSubmittingVote,
  onOpenReportDialog, // Destructure prop
  onRefreshTopic, // Add this destructured prop
}) => {
  const { role, canModerate, loading: staffLoading } = useStaffPermissions();

  const handleReportTopic = () => {
    onOpenReportDialog('topic', topic.id, topic.user_id, topic.title);
  };

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-4 lg:px-6 py-8">
      <TopicHeaderDisplay
        topic={topic}
        categorySlug={categorySlug}
        onReplyClick={() => replyFormRef.current?.scrollIntoView({ behavior: 'smooth' })}
        onReportTopic={handleReportTopic} // Pass handler for topic reporting
        userCanReport={!!user} // Pass flag to enable/disable report button based on user login
      />

      {/* Add moderation toolbar for staff */}
      {!staffLoading && canModerate && (
        <TopicModerationToolbar
          topic={topic}
          onTopicUpdate={onRefreshTopic}
          userRole={role || ''}
        />
      )}

      {/* Render PollDisplay if poll data exists */}
      {topic.poll && (
        <PollDisplay
          poll={topic.poll}
          onVote={handlePollVote}
          currentUserId={user?.id}
          disabled={topic.is_locked || isSubmittingVote}
          isVoting={isSubmittingVote}
        />
      )}

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
            isProcessingAction={isProcessingPostAction || loadingData || isSubmittingVote}
            topicTitle={topic.title}
            onReportPost={() => onOpenReportDialog('post', post.id, post.user_id, post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''))} // Pass handler for post reporting
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
