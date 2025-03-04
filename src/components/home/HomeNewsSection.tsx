
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Newspaper } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface NewsPost {
  id: string;
  title: string;
  content: string;
  featured_image: string | null;
  post_date: string;
  category: string | null;
}

const HomeNewsSection = () => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["home-news-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("id, title, content, featured_image, post_date, category")
        .eq("status", "published")
        .order("post_date", { ascending: false })
        .limit(3);
      
      if (error) {
        console.error("Error fetching news posts:", error);
        return [];
      }
      
      return data as NewsPost[];
    },
  });
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Latest News</h2>
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Latest News</h2>
        <Button variant="outline" asChild>
          <a href="/news">View All News</a>
        </Button>
      </div>
      
      {posts && posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-md transition-shadow duration-300">
              {post.featured_image ? (
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={post.featured_image} 
                    alt={post.title} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-muted flex items-center justify-center">
                  <Newspaper className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
              
              <CardHeader className="space-y-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold line-clamp-2">{post.title}</h3>
                    {post.category && (
                      <Badge variant="outline" className="text-xs">
                        {post.category}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(post.post_date), { addSuffix: true })}
                  </span>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {post.content.replace(/<[^>]*>/g, '')}
                </p>
                <Button variant="link" asChild className="p-0 h-auto mt-2">
                  <a href={`/news/${post.id}`}>Read More</a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-muted/30 rounded-lg">
          <Newspaper className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
          <h3 className="text-lg font-medium">No news articles available</h3>
          <p className="text-muted-foreground">Check back later for updates</p>
        </div>
      )}
    </div>
  );
};

export default HomeNewsSection;
