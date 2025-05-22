import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  post_date: string;
  category: string | null;
}

const generateExcerpt = (htmlContent: string, length = 100) => {
  const textContent = htmlContent.replace(/<[^>]*>/g, '');
  if (textContent.length <= length) return textContent;
  return textContent.substring(0, length) + '...';
};

const FeaturedBlogPost: React.FC = () => {
  const { data: post, isLoading, error } = useQuery<BlogPost | null>({
    queryKey: ['featured-blog-post'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, excerpt, content, featured_image, post_date, category')
        .eq('status', 'published')
        .order('post_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching featured blog post:', error);
        throw new Error('Failed to fetch featured blog post');
      }
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="my-12">
        <h2 className="text-3xl font-bold mb-6 text-center hot97-text-gradient">From The Blog</h2>
        <Card className="hot97-dark-bg border-hot97-pink/50">
          <Skeleton className="h-56 w-full" />
          <CardHeader>
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-5/6 mb-4" />
            <Skeleton className="h-8 w-28" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !post) {
    // Don't render anything if there's an error or no post, to keep the home page clean.
    // Alternatively, a small message could be shown.
    return null; 
  }

  return (
    <div className="my-12">
      <h2 className="text-3xl font-bold mb-8 text-center hot97-text-gradient">From The Blog</h2>
      <Card className="flex flex-col md:flex-row overflow-hidden hot97-dark-bg border-hot97-pink/50 hover:shadow-lg hover:shadow-hot97-pink/30 transition-all duration-300">
        <Link to={`/blog/${post.id}`} className="group md:w-2/5 block">
          {post.featured_image ? (
            <div className="aspect-video md:aspect-auto md:h-full overflow-hidden">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          ) : (
            <div className="aspect-video md:aspect-auto md:h-full bg-hot97-purple/30 flex items-center justify-center">
              <BookOpen className="h-16 w-16 text-hot97-pink opacity-70" />
            </div>
          )}
        </Link>
        <div className="flex flex-col p-6 md:w-3/5">
          <CardHeader className="p-0 pb-2">
            {post.category && (
              <Badge variant="outline" className="mb-2 bg-hot97-pink/20 border-hot97-pink text-hot97-pink self-start text-xs">
                {post.category}
              </Badge>
            )}
            <CardTitle className="text-2xl">
              <Link to={`/blog/${post.id}`} className="hover:text-hot97-pink transition-colors line-clamp-2">
                {post.title}
              </Link>
            </CardTitle>
            <p className="text-xs text-hot97-light-pink pt-1">
              {formatDistanceToNow(new Date(post.post_date), { addSuffix: true })}
            </p>
          </CardHeader>
          <CardContent className="p-0 flex-grow flex flex-col">
            <p className="text-sm text-hot97-white/80 line-clamp-3 mb-4 flex-grow">
              {post.excerpt || generateExcerpt(post.content)}
            </p>
            <Button variant="link" asChild className="p-0 h-auto mt-auto self-start text-hot97-pink hover:text-hot97-magenta">
              <Link to={`/blog/${post.id}`}>Read More &rarr;</Link>
            </Button>
          </CardContent>
        </div>
      </Card>
    </div>
  );
};

export default FeaturedBlogPost;
