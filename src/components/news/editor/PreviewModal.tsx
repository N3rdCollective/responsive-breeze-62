
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Calendar, User, Tag, ArrowLeft } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface PreviewModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
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
  authorName = "Staff Author",
  category = "News",
  tags = [],
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full h-[90vh] overflow-hidden flex flex-col p-0 gap-0 bg-background text-foreground">
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0 flex items-center justify-between">
          <DialogTitle>Preview: How it will look on the site</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogClose>
        </DialogHeader>
        
        <div className="overflow-y-auto p-6 flex-grow">
          {/* This mirrors the actual NewsPost.tsx layout and styling */}
          <article className="max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-1"
                disabled
              >
                <ArrowLeft className="h-4 w-4" />
                Back to News
              </Button>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>
            
            <div className="flex flex-wrap gap-x-6 gap-y-2 mb-6 text-sm text-muted-foreground">
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
              <p className="text-lg text-muted-foreground mb-6">{excerpt}</p>
            )}
            
            <div 
              className="prose prose-lg max-w-none dark:prose-invert mb-8"
              dangerouslySetInnerHTML={{ __html: content }}
            />
            
            <div className="border-t pt-6 mt-6">
              <Button disabled>
                Back to News
              </Button>
            </div>
          </article>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewModal;
