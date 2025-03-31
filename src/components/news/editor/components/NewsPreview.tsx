
import React from "react";
import { Calendar, User, Tag } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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
  authorName,
  category,
  tags,
}) => {
  return (
    <article className="max-w-4xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">{title || "Untitled Post"}</h1>
      
      <div className="flex flex-wrap gap-x-4 gap-y-2 mb-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <time dateTime={new Date().toISOString()}>
            {formatDate(new Date().toISOString())}
          </time>
        </div>
        
        {authorName && (
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>{authorName}</span>
          </div>
        )}
        
        {category && (
          <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full">
            {category}
          </span>
        )}
      </div>
      
      {/* Display tags if available */}
      {tags && tags.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="h-4 w-4 text-muted-foreground" />
            {tags.map(tag => (
              <Badge key={tag} variant="outline" className="mr-1">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {currentFeaturedImageUrl && (
        <div className="mb-8">
          <img
            src={currentFeaturedImageUrl}
            alt={title}
            className="w-full h-auto rounded-lg object-cover max-h-[500px]"
          />
        </div>
      )}
      
      {excerpt && (
        <p className="text-lg text-muted-foreground mb-6">
          {excerpt}
        </p>
      )}
      
      {content ? (
        <div 
          className="prose prose-lg max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : (
        <p className="text-muted-foreground">No content yet. Start writing to see a preview.</p>
      )}

      <style jsx global>{`
        .video-embed {
          position: relative;
          margin: 1em 0;
        }
        .video-embed iframe {
          border-radius: 0.375rem;
          aspect-ratio: 16/9;
          width: 100%;
        }
      `}</style>
    </article>
  );
};

export default NewsPreview;
