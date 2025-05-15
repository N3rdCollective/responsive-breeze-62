
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface LatestPost {
  id: string;
  topic_id: string;
  content: string;
  created_at: string;
  topic: {
    title: string;
    slug: string;
    category_id: string;
    category: {
      name: string;
      slug: string;
    }
  };
  profile: {
    username?: string;
    display_name?: string;
    avatar_url?: string;
  };
}

const ForumLatestPosts = () => {
  const [posts, setPosts] = useState<LatestPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('forum_posts')
          .select(`
            id,
            topic_id,
            content,
            created_at,
            topic:forum_topics(
              title, 
              slug,
              category_id,
              category:forum_categories(name, slug)
            ),
            profile:profiles(username, display_name, avatar_url)
          `)
          .order('created_at', { ascending: false })
          .limit(20);
          
        if (error) throw error;
        
        setPosts(data as LatestPost[]);
      } catch (error: any) {
        console.error('Error fetching latest posts:', error.message);
        toast({
          title: "Error loading latest posts",
          description: "We couldn't load the latest posts. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLatestPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-lg font-medium mb-2">No posts yet</p>
          <p className="text-muted-foreground">
            Be the first one to start a discussion!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.profile?.avatar_url || ''} alt={post.profile?.display_name || 'User'} />
                <AvatarFallback>
                  {(post.profile?.display_name?.[0] || post.profile?.username?.[0] || 'U').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between">
                  <Link 
                    to={`/members/forum/${post.topic?.category.slug}/${post.topic_id}`} 
                    className="font-medium hover:text-primary transition-colors"
                  >
                    {post.topic?.title}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground flex gap-2">
                  <span>by {post.profile?.display_name || post.profile?.username || 'Anonymous'}</span>
                  <span>•</span>
                  <Link 
                    to={`/members/forum/${post.topic?.category.slug}`}
                    className="text-sm hover:text-primary transition-colors"
                  >
                    {post.topic?.category.name}
                  </Link>
                </div>
                <div className="pt-2 text-sm">
                  {post.content.length > 200
                    ? `${post.content.substring(0, 200)}...`
                    : post.content
                  }
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ForumLatestPosts;
