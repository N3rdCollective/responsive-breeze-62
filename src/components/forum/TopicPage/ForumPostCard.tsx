
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { MessageSquareText, ThumbsUp, Edit3, Trash2, Lock, QuoteIcon } from 'lucide-react';
import { ForumPost } from '@/types/forum';
import type { User } from '@supabase/supabase-js';
import ForumRichTextEditor from '@/components/forum/ForumRichTextEditor'; // For rendering content safely

interface ForumPostCardProps {
  post: ForumPost;
  isFirstPost: boolean;
  currentUser: User | null;
  onEdit: (post: ForumPost) => void;
  onDelete: (postId: string) => void;
  onQuote: (post: ForumPost) => void; // New prop for quoting
  onToggleReaction: (postId: string, reactionType: 'like') => void;
  isTopicLocked: boolean;
  isProcessingAction: boolean;
}

const ForumPostCard: React.FC<ForumPostCardProps> = ({
  post,
  isFirstPost,
  currentUser,
  onEdit,
  onDelete,
  onQuote, // Destructure new prop
  onToggleReaction,
  isTopicLocked,
  isProcessingAction,
}) => {
  const userIsAuthor = currentUser && post.user_id === currentUser.id;
  const userCanInteract = !!currentUser;

  const displayName = post.profile?.display_name || post.profile?.username || 'Anonymous User';
  const avatarFallback = displayName.charAt(0).toUpperCase();

  const hasUserLiked = post.forum_post_reactions?.some(
    (reaction) => reaction.user_id === currentUser?.id && reaction.reaction_type === 'like'
  );
  const likeCount = post.forum_post_reactions?.filter(r => r.reaction_type === 'like').length || 0;

  return (
    <Card id={`post-${post.id}`} className={`shadow-sm ${isFirstPost ? 'border-primary/30' : ''}`}>
      <CardHeader className="flex flex-row items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-t-lg">
        <Avatar className="mt-1">
          <AvatarImage src={post.profile?.profile_picture || undefined} alt={displayName} />
          <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{displayName}</p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            {post.is_edited && <span className="italic"> (edited)</span>}
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-4 prose prose-sm dark:prose-invert max-w-none break-words">
        {/* Use a read-only editor or dangerouslySetInnerHTML if content is trusted HTML */}
        {/* For safety and consistency, if post.content is HTML from your rich text editor: */}
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </CardContent>
      <CardFooter className="p-4 border-t dark:border-gray-700/50 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
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
              onClick={() => onQuote(post)} // Call onQuote handler
              disabled={isProcessingAction}
              className="text-muted-foreground hover:text-primary"
            >
              <QuoteIcon className="mr-1 h-4 w-4" />
              Quote
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
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
          {isTopicLocked && (
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
