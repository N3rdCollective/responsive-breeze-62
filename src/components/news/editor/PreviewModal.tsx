
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, User, Tag } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { createSafeHtml } from "@/utils/htmlSanitizer";

interface PreviewModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: string;
  content: string;
  excerpt?: string;
  featuredImageUrl?: string;
  authorName?: string;
  category?: string;
  tags?: string[];
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onOpenChange,
  title,
  content,
  excerpt,
  featuredImageUrl,
  authorName,
  category,
  tags,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post Preview</DialogTitle>
        </DialogHeader>
        
        <article className="mt-4">
          <h1 className="text-3xl font-bold mb-4">{title || "Untitled Post"}</h1>
          
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
          
          {featuredImageUrl && (
            <div className="mb-8">
              <img
                src={featuredImageUrl}
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
              dangerouslySetInnerHTML={createSafeHtml(content)}
            />
          ) : (
            <p className="text-muted-foreground">No content yet. Start writing to see a preview.</p>
          )}
        </article>
      
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
      </DialogContent>
    </Dialog>
  );
};

export default PreviewModal;
