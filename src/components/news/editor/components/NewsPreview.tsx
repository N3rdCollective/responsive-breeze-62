
import React from "react";
import { formatDate } from "@/lib/utils";

interface NewsPreviewProps {
  title: string;
  content: string;
  excerpt?: string;
  currentFeaturedImageUrl?: string;
  authorName?: string;
  category?: string;
  tags?: string[];
}

const NewsPreview: React.FC<NewsPreviewProps> = ({
  title,
  content,
  excerpt,
  currentFeaturedImageUrl,
  authorName = "Staff Author",
  category = "News",
  tags = [],
}) => {
  return (
    <div className="max-w-3xl mx-auto rounded-lg overflow-hidden shadow-md bg-card text-card-foreground">
      {currentFeaturedImageUrl && (
        <div className="w-full aspect-video bg-muted overflow-hidden">
          <img
            src={currentFeaturedImageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="inline-block bg-primary/20 text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
              {category}
            </span>
            <time className="text-sm text-muted-foreground">
              {formatDate(new Date().toISOString())}
            </time>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-card-foreground">{title}</h1>
          {excerpt && (
            <p className="text-lg text-muted-foreground">{excerpt}</p>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
            {authorName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-card-foreground">{authorName}</p>
            <p className="text-sm text-muted-foreground">Author</p>
          </div>
        </div>
        
        <div className="border-t border-border pt-6">
          <div
            className="prose dark:prose-invert prose-headings:text-card-foreground prose-p:text-card-foreground prose-strong:text-card-foreground prose-em:text-card-foreground prose-li:text-card-foreground max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
        
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-muted text-muted-foreground rounded-md text-sm"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsPreview;
