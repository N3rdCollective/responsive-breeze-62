import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, User, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface Post {
  id: string;
  title: string;
  content: string;
  featured_image: string | null;
  post_date: string;
  category: string | null;
  author: string | null;
  status: string;
  tags?: string[];
}

const NewsPost = () => {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["news-post", id],
    queryFn: async () => {
      console.log("Fetching post with ID:", id);
      
      if (!id) {
        throw new Error("Post ID is required");
      }
      
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .eq("status", "published")
        .maybeSingle();
      
      if (error) {
        console.error("Supabase error fetching post:", error);
        toast({
          title: "Error fetching post",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      if (!data) {
        console.error("Post not found with ID:", id);
        throw new Error("Post not found");
      }
      
      console.log("Post data loaded:", data);
      return data as Post;
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1"
            onClick={() => navigate('/news')}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to News
          </Button>
        </div>
        
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <div className="flex gap-4 items-center">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-[300px] w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    console.error("Error displaying post:", error);
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-destructive mb-4">Post Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The post you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => navigate('/news')}>
          Back to News
        </Button>
      </div>
    );
  }

  const imageUrl = post.featured_image && 
    !post.featured_image.startsWith('blob:') ? 
    post.featured_image : null;

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1"
          onClick={() => navigate('/news')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to News
        </Button>
      </div>
      
      <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
      
      <div className="flex flex-wrap gap-x-6 gap-y-2 mb-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <time dateTime={post.post_date}>
            {format(new Date(post.post_date), "MMMM dd, yyyy")}
          </time>
        </div>
        
        {post.author && (
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>{post.author}</span>
          </div>
        )}
        
        {post.category && (
          <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full">
            {post.category}
          </span>
        )}
      </div>
      
      {post.tags && post.tags.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="h-4 w-4 text-muted-foreground" />
            {post.tags.map(tag => (
              <Badge key={tag} variant="outline" className="mr-1">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {imageUrl && (
        <div className="mb-8">
          <img
            src={imageUrl}
            alt={post.title}
            className="w-full h-auto rounded-lg object-cover max-h-[500px]"
          />
        </div>
      )}
      
      <div 
        className="prose prose-lg max-w-none dark:prose-invert mb-8"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
      
      <style>
        {`
        .video-embed {
          position: relative;
          margin: 2em 0;
          display: flex;
          justify-content: center;
          width: 100%;
        }
        
        .video-container {
          position: relative;
          width: 100%;
          max-width: 48rem; /* 768px */
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          border-radius: 0.5rem;
          overflow: hidden;
          background-color: rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(0, 0, 0, 0.1);
        }
        
        .video-embed iframe {
          border-radius: 0.375rem;
          aspect-ratio: 16/9;
          width: 100%;
        }
        
        .dark .video-container {
          background-color: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.1);
        }
        `}
      </style>
      
      <div className="border-t pt-6 mt-6">
        <Button asChild>
          <Link to="/news">Back to News</Link>
        </Button>
      </div>
    </article>
  );
};

export default NewsPost;
