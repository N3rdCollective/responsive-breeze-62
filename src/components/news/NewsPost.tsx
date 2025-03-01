
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, User } from "lucide-react";

interface Post {
  id: string;
  title: string;
  content: string;
  featured_image: string | null;
  post_date: string;
  category: string | null;
  author: string | null;
  status: string;
}

const NewsPost = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["news-post", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .eq("status", "published")
        .single();
      
      if (error) {
        toast({
          title: "Error fetching post",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      return data as Post;
    },
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
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-destructive mb-4">Post Not Found</h2>
        <p className="text-muted-foreground mb-6">The post you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/news')}>
          Back to News
        </Button>
      </div>
    );
  }

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
      
      {post.featured_image && (
        <div className="mb-8">
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-auto rounded-lg object-cover max-h-[500px]"
          />
        </div>
      )}
      
      <div 
        className="prose prose-lg max-w-none dark:prose-invert mb-8"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
      
      <div className="border-t pt-6 mt-6">
        <Button onClick={() => navigate('/news')}>
          Back to News
        </Button>
      </div>
    </article>
  );
};

export default NewsPost;
