
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface PreviewModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: string;
  excerpt?: string;
  featuredImageUrl: string;
  authorName?: string;
  category?: string;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onOpenChange,
  title,
  content,
  excerpt,
  featuredImageUrl,
  authorName = "Staff Author",
  category,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Preview</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-2">
          {featuredImageUrl && (
            <div className="w-full h-64 overflow-hidden rounded-lg">
              <img
                src={featuredImageUrl}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">{title}</h1>
            
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
              className="prose prose-gray max-w-none pt-4"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewModal;
