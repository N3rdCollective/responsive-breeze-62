
import React from "react";
import NewsFormBasicFields from "./NewsFormBasicFields";
import RichTextEditor from "../RichTextEditor";
import ImageUploader from "../ImageUploader";
import { Card, CardContent } from "@/components/ui/card";
import { NewsStatus } from "../NewsForm";

interface EditorTabContentProps {
  title: string;
  setTitle: (title: string) => void;
  content: string;
  setContent: (content: string) => void;
  excerpt: string;
  setExcerpt: (excerpt: string) => void;
  status: NewsStatus;
  setStatus: (status: NewsStatus) => void;
  category: string;
  setCategory: (category: string) => void;
  tags: string[];
  setTags: (tags: string[]) => void;
  currentFeaturedImageUrl: string;
  onImageSelected: (file: File) => void;
  onOpenPreview: () => void;
  canPublish?: boolean;
}

const EditorTabContent: React.FC<EditorTabContentProps> = ({
  title,
  setTitle,
  content,
  setContent,
  excerpt,
  setExcerpt,
  status,
  setStatus,
  category,
  setCategory,
  tags,
  setTags,
  currentFeaturedImageUrl,
  onImageSelected,
  onOpenPreview,
  canPublish = false
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              <RichTextEditor
                id="content-editor"
                value={content}
                onChange={(newContent) => setContent(newContent)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <NewsFormBasicFields
              title={title}
              setTitle={setTitle}
              excerpt={excerpt}
              setExcerpt={setExcerpt}
              status={status}
              setStatus={setStatus}
              category={category}
              setCategory={setCategory}
              tags={tags}
              setTags={setTags}
              canPublish={canPublish}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <ImageUploader
              currentImageUrl={currentFeaturedImageUrl}
              onImageSelected={onImageSelected}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditorTabContent;
