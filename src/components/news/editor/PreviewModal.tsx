
import React from "react";
import { format } from "date-fns";
import { Calendar, User, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PreviewModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: string;
  excerpt?: string;
  featuredImageUrl?: string;
  authorName?: string;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onOpenChange,
  title,
  content,
  excerpt,
  featuredImageUrl,
  authorName = "Staff Author",
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post Preview</DialogTitle>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        
        <div className="mt-4">
          <article className="bg-background rounded-lg overflow-hidden">
            {featuredImageUrl && (
              <div className="w-full h-[300px] overflow-hidden">
                <img
                  src={featuredImageUrl}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
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
          </article>
          
          <div className="flex justify-end mt-6">
            <Button onClick={() => onOpenChange(false)}>Close Preview</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewModal;
