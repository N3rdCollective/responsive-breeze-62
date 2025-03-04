
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Post } from "../types/newsTypes";

interface NewsCardProps {
  post: Post;
}

export const NewsCard = ({ post }: NewsCardProps) => {
  // Only use image URL if it's not a blob URL
  const imageUrl = post.featured_image && 
    !post.featured_image.startsWith('blob:') ? 
    post.featured_image : null;
    
  return (
    <Card key={post.id} className="overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow duration-300">
      {imageUrl && (
        <div className="h-48 overflow-hidden">
          <img 
            src={imageUrl} 
            alt={post.title} 
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold">{post.title}</h3>
            {post.category && (
              <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full mt-1 inline-block">
                {post.category}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(post.post_date), { addSuffix: true })}
          </p>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground line-clamp-3">
          {post.content.replace(/<[^>]*>/g, '')}
        </p>
        
        {/* Display tags if available */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {post.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <a href={`/news/${post.id}`}>Read More</a>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NewsCard;
