
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, User } from "lucide-react";
import { format } from "date-fns";

interface NewsPreviewProps {
  title: string;
  content: string;
  excerpt: string;
  currentFeaturedImageUrl: string;
  authorName?: string;
}

const NewsPreview: React.FC<NewsPreviewProps> = ({
  title,
  content,
  excerpt,
  currentFeaturedImageUrl,
  authorName = "Staff Author",
}) => {
  return (
    <div>
      <Card className="border rounded-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="relative">
            {currentFeaturedImageUrl && (
              <div className="w-full h-[300px] overflow-hidden">
                <img
                  src={currentFeaturedImageUrl}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
          
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">{title || "Post Title"}</h1>
            
            <div className="flex flex-wrap gap-x-6 gap-y-2 mb-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <time dateTime={new Date().toISOString()}>
                  {format(new Date(), "MMMM dd, yyyy")}
                </time>
              </div>
              
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{authorName}</span>
              </div>
            </div>
            
            {excerpt && (
              <div className="text-lg text-muted-foreground mb-6 italic">
                {excerpt}
              </div>
            )}
            
            <div 
              className="prose prose-lg max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-4 text-sm text-muted-foreground">
        <p>This is a preview of how your post will appear when published.</p>
      </div>
    </div>
  );
};

export default NewsPreview;
