
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RichTextEditor from "../RichTextEditor";
import NewsFormBasicFields from "./NewsFormBasicFields";
import ImageUploader from "../ImageUploader";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
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
  currentFeaturedImageUrl: string;
  onImageSelected: (file: File) => void;
  onOpenPreview: () => void;
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
  currentFeaturedImageUrl,
  onImageSelected,
  onOpenPreview,
}) => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="content" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="content" className="flex-1">Content</TabsTrigger>
          <TabsTrigger value="settings" className="flex-1">Settings</TabsTrigger>
          <TabsTrigger value="featured-image" className="flex-1">Featured Image</TabsTrigger>
        </TabsList>
        
        <TabsContent value="content" className="mt-6">
          <RichTextEditor
            id="news-content"
            value={content}
            onChange={setContent}
            label="Content"
          />
          
          <div className="mt-4 flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={onOpenPreview}
            >
              <Eye className="h-4 w-4" />
              Preview
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="mt-6">
          <NewsFormBasicFields
            title={title}
            setTitle={setTitle}
            excerpt={excerpt}
            setExcerpt={setExcerpt}
            status={status}
            setStatus={setStatus}
            category={category}
            setCategory={setCategory}
          />
        </TabsContent>
        
        <TabsContent value="featured-image" className="mt-6">
          <ImageUploader
            onImageSelected={onImageSelected}
            currentImageUrl={currentFeaturedImageUrl}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EditorTabContent;
