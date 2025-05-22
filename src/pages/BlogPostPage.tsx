
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast'; // Assuming useToast is compatible or you have it
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Post {
  id: string;
  title: string;
  content: string;
  featured_image: string | null;
  post_date: string;
  category: string | null;
  author_name: string | null; // Changed from 'author' to 'author_name'
  status: string;
  tags?: string[];
}

const BlogPostPage: React.FC = () => {
  const { slug: id } = useParams<{ slug: string }>(); // Treat slug as id
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['blog-post', id],
    queryFn: async () => {
      if (!id) {
        throw new Error('Post ID is required');
      }
      const { data, error: dbError } = await supabase
        .from('posts')
        .select('*, author_name') // Ensure author_name is selected
        .eq('id', id)
        .eq('status', 'published')
        .maybeSingle();

      if (dbError) {
        console.error('Supabase error fetching post:', dbError);
        toast({
          title: 'Error fetching post',
          description: dbError.message,
          variant: 'destructive',
        });
        throw dbError;
      }
      if (!data) {
        throw new Error('Post not found or not published');
      }
      return data as Post;
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-hot97-white">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1 text-hot97-pink hover:bg-hot97-pink/10"
            onClick={() => navigate('/blog')}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Button>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4 bg-hot97-purple/30" />
          <div className="flex gap-4 items-center">
            <Skeleton className="h-4 w-32 bg-hot97-purple/30" />
            <Skeleton className="h-4 w-32 bg-hot97-purple/30" />
          </div>
          <Skeleton className="h-[300px] w-full bg-hot97-purple/30" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full bg-hot97-purple/30" />
            <Skeleton className="h-4 w-full bg-hot97-purple/30" />
            <Skeleton className="h-4 w-2/3 bg-hot97-purple/30" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-hot97-white">
        <h2 className="text-2xl font-bold text-hot97-pink mb-4">Post Not Found</h2>
        <p className="text-hot97-light-pink/80 mb-6">
          The blog post you're looking for doesn't exist or hasn't been published yet.
        </p>
        <Button onClick={() => navigate('/blog')} className="bg-hot97-pink hover:bg-hot97-magenta text-hot97-black">
          Back to Blog
        </Button>
      </div>
    );
  }

  const imageUrl = post.featured_image && !post.featured_image.startsWith('blob:') 
    ? post.featured_image 
    : null;

  return (
    <article className="max-w-4xl mx-auto px-4 py-8 text-hot97-white">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1 text-hot97-pink hover:text-hot97-pink hover:bg-hot97-pink/10"
          onClick={() => navigate('/blog')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Button>
      </div>
      
      <h1 className="text-3xl md:text-4xl font-bold mb-4 hot97-text-gradient">{post.title}</h1>
      
      <div className="flex flex-wrap gap-x-6 gap-y-2 mb-6 text-sm text-hot97-light-pink/80">
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <time dateTime={post.post_date}>
            {format(new Date(post.post_date), "MMMM dd, yyyy")}
          </time>
        </div>
        
        {post.author_name && (
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>{post.author_name}</span>
          </div>
        )}
        
        {post.category && (
          <Badge variant="outline" className="bg-hot97-pink/20 border-hot97-pink text-hot97-pink">
            {post.category}
          </Badge>
        )}
      </div>
      
      {post.tags && post.tags.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="h-4 w-4 text-hot97-light-pink" />
            {post.tags.map(tag => (
              <Badge key={tag} variant="outline" className="mr-1 border-hot97-light-pink/50 text-hot97-light-pink bg-hot97-purple/30">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {imageUrl && (
        <div className="mb-8 rounded-lg overflow-hidden shadow-lg shadow-hot97-purple/30">
          <img
            src={imageUrl}
            alt={post.title}
            className="w-full h-auto object-cover max-h-[500px]"
          />
        </div>
      )}
      
      <div 
        className="prose prose-lg max-w-none prose-p:text-hot97-white/90 prose-headings:text-hot97-pink prose-strong:text-hot97-white prose-a:text-hot97-pink hover:prose-a:text-hot97-magenta prose-blockquote:border-hot97-pink prose-blockquote:text-hot97-light-pink/90 prose-code:text-hot97-light-pink prose-code:bg-hot97-dark-purple/50 prose-code:p-1 prose-code:rounded prose-li:text-hot97-white/90 mb-8"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
      
      {/* Styles for embedded videos - consider moving to a global CSS file if used elsewhere */}
      <style>
        {`
        .prose .video-embed {
          position: relative;
          margin: 2em 0;
          display: flex;
          justify-content: center;
          width: 100%;
        }
        
        .prose .video-container {
          position: relative;
          width: 100%;
          max-width: 48rem; /* 768px */
          box-shadow: 0 4px 6px -1px rgba(255, 20, 147, 0.2), 0 2px 4px -1px rgba(255, 20, 147, 0.1);
          border-radius: 0.5rem;
          overflow: hidden;
          background-color: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--hot97-pink);
        }
        
        .prose .video-embed iframe {
          border-radius: 0.375rem;
          aspect-ratio: 16/9;
          width: 100%;
        }
        `}
      </style>
      
      <div className="border-t border-hot97-pink/30 pt-6 mt-6">
        <Button asChild className="bg-hot97-pink hover:bg-hot97-magenta text-hot97-black">
          <Link to="/blog">Back to Blog</Link>
        </Button>
      </div>
    </article>
  );
};

export default BlogPostPage;
