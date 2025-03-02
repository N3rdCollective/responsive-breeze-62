
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface PreviewModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: string;
  excerpt: string;
  featuredImageUrl: string;
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
  category = "Uncategorized",
  tags = []
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Preview: {title}</DialogTitle>
        </DialogHeader>

        <div className="preview-container mt-4">
          {featuredImageUrl && (
            <div className="w-full h-[300px] overflow-hidden rounded-md mb-6">
              <img
                src={featuredImageUrl}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            {category && (
              <Badge variant="outline" className="bg-primary/10 text-primary">
                {category}
              </Badge>
            )}
            {tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          <h1 className="text-2xl font-bold mb-2">{title}</h1>

          <div className="text-sm text-muted-foreground mb-6">
            By {authorName} • {format(new Date(), "MMMM d, yyyy")}
          </div>

          {excerpt && (
            <div className="text-muted-foreground text-sm italic mb-6">
              {excerpt}
            </div>
          )}

          <div
            className="prose max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewModal;
