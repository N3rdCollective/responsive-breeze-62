
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ForumPost, ForumPostReaction } from '@/types/forum'; // Added ForumPostReaction
import { formatDistanceToNow, format } from 'date-fns';
import { UserCircle2, MessageCircle, MoreVertical, Edit3, Trash2, Heart } from 'lucide-react'; // Added icons
import { User } from '@supabase/supabase-js'; // For current user prop

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ForumPostCardProps {
  post: ForumPost;
  isFirstPost?: boolean;
  currentUser: User | null; // To check ownership
  onEdit: (post: ForumPost) => void;
  onDelete: (postId: string) => void;
  onToggleReaction: (postId: string, reactionType: 'like') => void;
  isTopicLocked?: boolean;
  isProcessingAction?: boolean; // For disabling buttons during action
}

const ForumPostCard: React.FC<ForumPostCardProps> = ({
  post,
  isFirstPost,
  currentUser,
  onEdit,
  onDelete,
  onToggleReaction,
  isTopicLocked,
  isProcessingAction
}) => {
  const timeAgo = post.created_at ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true }) : 'some time ago';
  const userDisplayName = post.profile?.display_name || post.profile?.username || 'User';
  const userAvatarUrl = post.profile?.profile_picture;

  const canModify = currentUser?.id === post.user_id && !isTopicLocked;

  const userHasLiked = post.forum_post_reactions?.some(reaction => reaction.user_id === currentUser?.id && reaction.reaction_type === 'like');
  const likeCount = post.forum_post_reactions?.filter(reaction => reaction.reaction_type === 'like').length || 0;

  return (
    <Card className={`border-primary/10 ${isFirstPost ? 'border-primary/30 shadow-md' : 'shadow-sm'}`}>
      <CardHeader className={`flex flex-row items-start justify-between p-4 ${isFirstPost ? 'bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={userAvatarUrl || undefined} alt={userDisplayName} />
            <AvatarFallback>
              <UserCircle2 className="h-6 w-6 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-primary">{userDisplayName}</p>
            <p className="text-xs text-muted-foreground">{timeAgo}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isFirstPost && (
            <span className="text-xs font-semibold uppercase text-primary tracking-wider mr-2">
              Original Post
            </span>
          )}
          {canModify && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isProcessingAction}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(post)} disabled={isProcessingAction}>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(post.id)} className="text-destructive" disabled={isProcessingAction}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 prose prose-sm sm:prose max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-em:text-foreground prose-li:text-foreground">
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </CardContent>
      <CardFooter className="p-4 pt-2 flex justify-between items-center">
        <div>
          {post.is_edited && (
            <span className="text-xs text-muted-foreground italic">
              Edited {post.updated_at ? formatDistanceToNow(new Date(post.updated_at), { addSuffix: true }) : ''} 
              (at {post.updated_at ? format(new Date(post.updated_at), "p, MMM dd, yyyy") : ''})
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant={userHasLiked ? "default" : "outline"} 
            size="sm" 
            onClick={() => onToggleReaction(post.id, 'like')}
            disabled={isTopicLocked || isProcessingAction || !currentUser}
            className={`transition-colors ${userHasLiked ? 'bg-red-500 hover:bg-red-600 text-white' : ''}`}
          >
            <Heart className={`mr-2 h-4 w-4 ${userHasLiked ? 'fill-current' : ''}`} />
            {likeCount > 0 ? likeCount : 'Like'}
          </Button>
          {/* Placeholder for reply button if needed directly on card */}
          {/* <Button variant="outline" size="sm"><MessageCircle className="mr-2 h-4 w-4" /> Reply</Button> */}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ForumPostCard;
