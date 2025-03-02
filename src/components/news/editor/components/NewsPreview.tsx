
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface NewsPreviewProps {
  title: string;
  content: string;
  excerpt: string;
  currentFeaturedImageUrl: string;
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
  category = "Uncategorized",
  tags = []
}) => {
  return (
    <Card className="border rounded-lg overflow-hidden">
      {currentFeaturedImageUrl && (
        <div className="w-full h-[300px] overflow-hidden">
          <img
            src={currentFeaturedImageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <CardHeader className="pb-0">
        <div className="flex flex-wrap gap-2 mb-2">
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
        <CardTitle className="text-xl md:text-2xl">{title}</CardTitle>
        <div className="text-sm text-muted-foreground mt-2">
          By {authorName} • {format(new Date(), "MMMM d, yyyy")}
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="text-muted-foreground text-sm italic mb-6">
          {excerpt}
        </div>

        <div
          className="prose max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </CardContent>
    </Card>
  );
};

export default NewsPreview;
