
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface NewsPreviewProps {
  title: string;
  content: string;
  excerpt?: string;
  currentFeaturedImageUrl: string;
  authorName?: string;
  category?: string;
}

const NewsPreview: React.FC<NewsPreviewProps> = ({
  title,
  content,
  excerpt,
  currentFeaturedImageUrl,
  authorName = "Staff Author",
  category,
}) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-4">
        {currentFeaturedImageUrl && (
          <div className="w-full h-64 md:h-80 lg:h-96 overflow-hidden rounded-lg">
            <img
              src={currentFeaturedImageUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{title}</h1>
          
          <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
            <span>By {authorName}</span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(), { addSuffix: true })}</span>
            {category && (
              <>
                <span>•</span>
                <Badge variant="outline" className="font-normal">
                  {category}
                </Badge>
              </>
            )}
          </div>
          
          {excerpt && (
            <p className="text-lg text-muted-foreground leading-relaxed">
              {excerpt}
            </p>
          )}
          
          <div 
            className="prose prose-gray max-w-none pt-6"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>
    </div>
  );
};

export default NewsPreview;
