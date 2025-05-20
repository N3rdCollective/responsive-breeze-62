
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from 'date-fns';
import { ForumPost } from '@/types/forum';

interface ForumPostCardProps {
  post: ForumPost;
  isFirstPost: boolean;
}

const ForumPostCard: React.FC<ForumPostCardProps> = ({ post, isFirstPost }) => {
  return (
    <Card id={`post-${post.id}`} className={`${isFirstPost ? "border-primary" : "border-primary/20"} overflow-hidden`}>
      <CardHeader className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-800/80 dark:to-gray-900/80 py-3 px-4 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 ring-2 ring-primary/10">
            <AvatarImage src={post.profile?.avatar_url || ''} alt={post.profile?.display_name || 'User'} />
            <AvatarFallback className="bg-primary/20 text-primary-foreground">
              {(post.profile?.display_name?.[0] || post.profile?.username?.[0] || 'U').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <span className="font-medium">
              {post.profile?.display_name || post.profile?.username || 'Anonymous'}
            </span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          {post.is_edited && ' (edited)'}
        </div>
      </CardHeader>
      <CardContent className="p-4 pb-6">
        <div className="prose dark:prose-invert max-w-none">
          {post.content.split("\n").map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ForumPostCard;
