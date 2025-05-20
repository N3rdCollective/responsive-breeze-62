
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ForumPost } from '@/types/forum';
import { formatDistanceToNow } from 'date-fns';
import { UserCircle2 } from 'lucide-react';

interface ForumPostCardProps {
  post: ForumPost;
  isFirstPost?: boolean;
}

const ForumPostCard: React.FC<ForumPostCardProps> = ({ post, isFirstPost }) => {
  const timeAgo = post.created_at ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true }) : 'some time ago';
  const userDisplayName = post.profile?.display_name || post.profile?.username || 'User';
  const userAvatarUrl = post.profile?.profile_picture; // Changed from avatar_url

  return (
    <Card className={`border-primary/10 ${isFirstPost ? 'border-primary/30 shadow-md' : 'shadow-sm'}`}>
      <CardHeader className={`flex flex-row items-center justify-between p-4 ${isFirstPost ? 'bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={userAvatarUrl || undefined} alt={userDisplayName} /> {/* Ensure src can handle null/undefined */}
            <AvatarFallback>
              <UserCircle2 className="h-6 w-6 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-primary">{userDisplayName}</p>
            <p className="text-xs text-muted-foreground">{timeAgo}</p>
          </div>
        </div>
        {isFirstPost && (
          <span className="text-xs font-semibold uppercase text-primary tracking-wider">
            Original Post
          </span>
        )}
      </CardHeader>
      <CardContent className="p-4">
        {/* Render HTML content using dangerouslySetInnerHTML */}
        {/* Added prose styling for Tiptap content */}
        <div
          className="prose prose-sm sm:prose max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-em:text-foreground prose-li:text-foreground"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </CardContent>
      {post.is_edited && (
        <CardFooter className="p-4 pt-0 text-xs text-muted-foreground">
          Edited {post.updated_at ? formatDistanceToNow(new Date(post.updated_at), { addSuffix: true }) : ''}
        </CardFooter>
      )}
    </Card>
  );
};

export default ForumPostCard;
