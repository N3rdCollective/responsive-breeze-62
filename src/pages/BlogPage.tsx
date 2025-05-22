
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Newspaper, BookOpen } from 'lucide-react'; // Using BookOpen for blog
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string | null;
  content: string; // Keep content for excerpt generation if excerpt is null
  featured_image: string | null;
  post_date: string;
  category: string | null;
}

const BlogPage: React.FC = () => {
  const { data: posts, isLoading, error } = useQuery<BlogPost[]>({
    queryKey: ['blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, excerpt, content, featured_image, post_date, category')
        .eq('status', 'published')
        .order('post_date', { ascending: false });

      if (error) {
        console.error('Error fetching blog posts:', error);
        throw new Error('Failed to fetch blog posts');
      }
      return data || [];
    },
  });

  const generateExcerpt = (htmlContent: string, length = 150) => {
    const textContent = htmlContent.replace(/<[^>]*>/g, '');
    if (textContent.length <= length) return textContent;
    return textContent.substring(0, length) + '...';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-4xl font-bold mb-8 hot97-text-gradient">The Rappinlounge Blog</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-4xl font-bold mb-8 hot97-text-gradient">The Rappinlounge Blog</h1>
        <p className="text-destructive">Error loading blog posts. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-12 text-center hot97-text-gradient">Rappinlounge Blog</h1>
      
      {posts && posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Card key={post.id} className="flex flex-col overflow-hidden hot97-dark-bg border-hot97-pink/50 hover:shadow-lg hover:shadow-hot97-pink/30 transition-all duration-300">
              <Link to={`/blog/${post.id}`} className="group">
                {post.featured_image ? (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-hot97-purple/30 flex items-center justify-center">
                    <BookOpen className="h-16 w-16 text-hot97-pink opacity-70" />
                  </div>
                )}
              </Link>
              <CardHeader className="pt-4 pb-2">
                {post.category && (
                  <Badge variant="outline" className="mb-2 bg-hot97-pink/20 border-hot97-pink text-hot97-pink self-start text-xs">
                    {post.category}
                  </Badge>
                )}
                <CardTitle className="text-xl">
                  <Link to={`/blog/${post.id}`} className="hover:text-hot97-pink transition-colors line-clamp-2">
                    {post.title}
                  </Link>
                </CardTitle>
                <p className="text-xs text-hot97-light-pink pt-1">
                  {formatDistanceToNow(new Date(post.post_date), { addSuffix: true })}
                </p>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col">
                <p className="text-sm text-hot97-white/80 line-clamp-3 mb-4 flex-grow">
                  {post.excerpt || generateExcerpt(post.content)}
                </p>
                <Button variant="link" asChild className="p-0 h-auto mt-auto self-start text-hot97-pink hover:text-hot97-magenta">
                  <Link to={`/blog/${post.id}`}>Read More &rarr;</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="h-20 w-20 text-hot97-pink mx-auto mb-4 opacity-70" />
          <h3 className="text-xl font-semibold">No blog posts yet!</h3>
          <p className="text-hot97-light-pink/80">Check back soon for the latest updates.</p>
        </div>
      )}
    </div>
  );
};

export default BlogPage;
