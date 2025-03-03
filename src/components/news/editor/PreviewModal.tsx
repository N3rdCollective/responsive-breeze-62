
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { formatDate } from "@/lib/utils";

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
          <DialogTitle>Post Preview</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogClose>
        </DialogHeader>
        
        <div className="overflow-y-auto p-6 flex-grow">
          <div className="max-w-3xl mx-auto">
            {featuredImageUrl && (
              <div className="w-full aspect-video bg-muted overflow-hidden mb-6 rounded-lg">
                <img
                  src={featuredImageUrl}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="inline-block bg-primary/20 text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                    {category}
                  </span>
                  <time className="text-sm text-muted-foreground">
                    {formatDate(new Date().toISOString())}
                  </time>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
                {excerpt && <p className="text-lg text-muted-foreground">{excerpt}</p>}
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  {authorName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{authorName}</p>
                  <p className="text-sm text-muted-foreground">Author</p>
                </div>
              </div>
              
              <div className="pt-6 border-t border-border">
                <div
                  className="prose dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-em:text-foreground prose-li:text-foreground max-w-none"
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewModal;
