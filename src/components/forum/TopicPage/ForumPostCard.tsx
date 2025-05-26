import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { MessageSquareText, ThumbsUp, Edit3, Trash2, Lock, QuoteIcon, History, Mail, Flag } from 'lucide-react';
import { ForumPost } from '@/types/forum';
import type { User } from '@supabase/supabase-js';
import ForumUserProfileInfo from '@/components/forum/ForumUserProfileInfo';

interface ForumPostCardProps {
  post: ForumPost;
  isFirstPost: boolean;
  currentUser: User | null;
  onEdit: (post: ForumPost) => void;
  onDelete: (postId: string) => void;
  onQuote: (post: ForumPost) => void;
  onToggleReaction: (postId: string, reactionType: 'like') => void;
  onViewHistory: (postId:string, postTitle?: string) => void;
  isTopicLocked: boolean;
  isProcessingAction: boolean;
  topicTitle?: string;
  onStartDirectMessage?: (targetUserId: string) => void;
  onReportPost: () => void;
}

const ForumPostCard: React.FC<ForumPostCardProps> = ({
  post,
  isFirstPost,
  currentUser,
  onEdit,
  onDelete,
  onQuote,
  onToggleReaction,
  onViewHistory,
  isTopicLocked,
  isProcessingAction,
  topicTitle,
  onStartDirectMessage,
  onReportPost,
}) => {
  const userIsAuthor = currentUser && post.user_id === currentUser.id;
  const userCanInteract = !!currentUser;
  const userCanReport = !!currentUser && currentUser.id !== post.user_id;

  const displayName = post.profile?.display_name || post.profile?.username || 'Anonymous User';
  const avatarFallback = displayName.charAt(0).toUpperCase();

  const hasUserLiked = post.forum_post_reactions?.some(
    (reaction) => reaction.user_id === currentUser?.id && reaction.reaction_type === 'like'
  );
  const likeCount = post.forum_post_reactions?.filter(r => r.reaction_type === 'like').length || 0;

  return (
    <Card id={`post-${post.id}`} className={`shadow-sm ${isFirstPost ? 'border-primary/30' : ''}`}>
      <CardHeader className="flex flex-row items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-t-lg">
        <Avatar className="mt-1 h-12 w-12 sm:h-16 sm:w-16">
          <AvatarImage src={post.profile?.profile_picture || undefined} alt={displayName} />
          <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {post.profile?.username ? (
              <Link to={`/u/${post.profile.username}`} className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-200 hover:text-primary dark:hover:text-primary-foreground transition-colors">
                {displayName}
              </Link>
            ) : (
              <p className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-200">{displayName}</p>
            )}
            {currentUser && post.profile && post.user_id !== currentUser.id && onStartDirectMessage && (
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-auto text-muted-foreground hover:text-primary"
                onClick={() => post.user_id && onStartDirectMessage(post.user_id)}
                title={`Message ${displayName}`}
                aria-label={`Message ${displayName}`}
              >
                <Mail className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            {post.is_edited && (
              <Button
                variant="link"
                size="sm"
                className="italic text-xs p-0 h-auto ml-1 text-muted-foreground hover:text-primary"
                onClick={() => onViewHistory(post.id, isFirstPost ? topicTitle : undefined)}
              >
                (edited - view history)
              </Button>
            )}
          </p>
          <div className="mt-2">
            <ForumUserProfileInfo profile={post.profile} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 prose prose-sm dark:prose-invert max-w-none break-words">
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
        {post.profile?.forum_signature && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <p className="text-sm italic text-muted-foreground whitespace-pre-wrap">{post.profile.forum_signature}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 border-t dark:border-gray-700/50 flex flex-wrap items-center justify-between gap-2">
        
        <div className="flex items-center gap-1 sm:gap-2"> {/* Interactions */}
          {userCanInteract && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleReaction(post.id, 'like')}
              disabled={isProcessingAction || isTopicLocked}
              className={`text-muted-foreground hover:text-primary ${hasUserLiked ? 'text-primary dark:text-primary-foreground' : ''}`}
            >
              <ThumbsUp className={`mr-1 h-4 w-4 ${hasUserLiked ? 'fill-current' : ''}`} />
              {likeCount > 0 ? likeCount : 'Like'}
            </Button>
          )}
           {userCanInteract && !isTopicLocked && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onQuote(post)}
              disabled={isProcessingAction}
              className="text-muted-foreground hover:text-primary"
            >
              <QuoteIcon className="mr-1 h-4 w-4" />
              Quote
            </Button>
          )}
           {post.is_edited && ( 
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewHistory(post.id, isFirstPost ? topicTitle : undefined)}
              disabled={isProcessingAction}
              className="text-muted-foreground hover:text-primary"
              title="View edit history"
            >
              <History className="mr-1 h-4 w-4" />
              History
            </Button>
          )}
          {userCanReport && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReportPost}
              disabled={isProcessingAction || isTopicLocked}
              className="text-muted-foreground hover:text-destructive dark:hover:text-destructive-foreground"
              title="Report this post"
            >
              <Flag className="mr-1 h-4 w-4" />
              Report
            </Button>
          )}
        </div>
        <div className="flex items-center gap-1 sm:gap-2"> {/* Author Actions */}
          {userIsAuthor && !isTopicLocked && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(post)}
                disabled={isProcessingAction}
                className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400"
              >
                <Edit3 className="mr-1 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(post.id)}
                disabled={isProcessingAction}
                className="text-muted-foreground hover:text-red-600 dark:hover:text-red-500"
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Delete
              </Button>
            </>
          )}
          {isTopicLocked && !userIsAuthor && (
            <div className="flex items-center text-sm text-amber-600 dark:text-amber-400">
              <Lock className="mr-1 h-4 w-4" />
              Topic Locked
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ForumPostCard;
