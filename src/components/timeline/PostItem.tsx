
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TimelinePost } from '@/types/timeline';
import { useAuth } from '@/hooks/useAuth';
import { Heart, MessageSquare, Share, MoreHorizontal, Trash } from 'lucide-react';

interface PostItemProps {
  post: TimelinePost;
  onDelete?: (postId: string) => Promise<void>;
}

const PostItem = ({ post, onDelete }: PostItemProps) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  
  const isAuthor = user && post.user_id === user.id;
  const displayName = post.profile?.display_name || post.profile?.username || 'Anonymous User';
  const firstLetter = (displayName[0] || 'A').toUpperCase();
  
  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    // In a future version, this would connect to a likes table in the database
  };
  
  const handleShare = () => {
    // Placeholder for future share functionality
    alert('Sharing will be available in a future update!');
  };
  
  const handleDelete = async () => {
    if (onDelete && window.confirm('Are you sure you want to delete this post?')) {
      await onDelete(post.id);
    }
  };
  
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });
  
  return (
    <Card className="mb-4 shadow-sm">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <Avatar>
          <AvatarImage 
            src={post.profile?.avatar_url || undefined} 
            alt={displayName} 
          />
          <AvatarFallback>{firstLetter}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <p className="font-medium text-sm">{displayName}</p>
          <p className="text-xs text-muted-foreground">{timeAgo}</p>
        </div>
        {isAuthor && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="ml-auto">
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={handleDelete}
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>
      <CardContent className="pt-2 pb-3">
        <p className="whitespace-pre-wrap break-words">{post.content}</p>
        {post.media_url && (
          <div className="mt-3">
            <img 
              src={post.media_url} 
              alt="Post media" 
              className="rounded-md max-h-96 w-auto" 
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="py-3 border-t flex justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          className={`gap-2 ${isLiked ? 'text-red-500' : ''}`}
          onClick={handleLike}
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
          {likeCount > 0 && <span>{likeCount}</span>}
          Like
        </Button>
        <Button variant="ghost" size="sm" className="gap-2">
          <MessageSquare className="h-4 w-4" />
          Comment
        </Button>
        <Button variant="ghost" size="sm" className="gap-2" onClick={handleShare}>
          <Share className="h-4 w-4" />
          Share
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PostItem;
