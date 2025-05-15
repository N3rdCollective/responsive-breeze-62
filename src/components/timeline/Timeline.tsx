
import { useTimeline } from '@/hooks/useTimeline';
import CreatePostForm from './CreatePostForm';
import PostItem from './PostItem';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const Timeline = () => {
  const { 
    posts, 
    loading, 
    error, 
    submitting, 
    createPost, 
    deletePost,
    refreshPosts
  } = useTimeline();
  
  const { user } = useAuth();
  
  if (loading && posts.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error && posts.length === 0) {
    return (
      <Card className="my-6">
        <CardContent className="py-8 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={refreshPosts}>Try Again</Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto">
      {user && (
        <CreatePostForm 
          onSubmit={createPost} 
          submitting={submitting} 
        />
      )}
      
      {posts.length === 0 ? (
        <Card className="my-6">
          <CardContent className="py-12 text-center">
            <p className="text-lg font-medium mb-2">No posts yet</p>
            <p className="text-muted-foreground">
              Be the first to post on the timeline!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div>
          {posts.map(post => (
            <PostItem 
              key={post.id} 
              post={post} 
              onDelete={deletePost}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Timeline;
