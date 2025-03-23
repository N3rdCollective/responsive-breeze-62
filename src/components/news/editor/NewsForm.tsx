
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EditorTabContent from "./components/EditorTabContent";
import NewsPreview from "./components/NewsPreview";
import FormActions from "./components/FormActions";
import PreviewModal from "./PreviewModal";

export type NewsStatus = "published" | "draft";

interface NewsFormProps {
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
  onSave: () => void;
  isSaving: boolean;
  isUploading: boolean;
  isPreviewModalOpen?: boolean;
  setIsPreviewModalOpen?: (isOpen: boolean) => void;
  authorName?: string;
  canPublish?: boolean;
}

const NewsForm: React.FC<NewsFormProps> = ({
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
  onSave,
  isSaving,
  isUploading,
  isPreviewModalOpen = false,
  setIsPreviewModalOpen = () => {},
  authorName = "Staff Author",
  canPublish = false
}) => {
  const [activeTab, setActiveTab] = useState<string>("edit");
  
  const handleOpenPreview = () => {
    setIsPreviewModalOpen(true);
  };
  
  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] pb-28">
      <div className="flex-grow">
        <Tabs defaultValue="edit" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="edit" className="space-y-6">
            <EditorTabContent
              title={title}
              setTitle={setTitle}
              content={content}
              setContent={setContent}
              excerpt={excerpt}
              setExcerpt={setExcerpt}
              status={status}
              setStatus={setStatus}
              category={category}
              setCategory={setCategory}
              tags={tags}
              setTags={setTags}
              currentFeaturedImageUrl={currentFeaturedImageUrl}
              onImageSelected={onImageSelected}
              onOpenPreview={handleOpenPreview}
              canPublish={canPublish}
            />
          </TabsContent>
          
          <TabsContent value="preview">
            <NewsPreview
              title={title}
              content={content}
              excerpt={excerpt}
              currentFeaturedImageUrl={currentFeaturedImageUrl}
              authorName={authorName}
              category={category}
              tags={tags}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Form actions as a sticky footer */}
      <FormActions
        onSave={onSave}
        isSaving={isSaving}
        isUploading={isUploading}
        onOpenPreview={handleOpenPreview}
      />
      
      <PreviewModal
        isOpen={isPreviewModalOpen}
        onOpenChange={setIsPreviewModalOpen}
        title={title}
        content={content}
        excerpt={excerpt}
        featuredImageUrl={currentFeaturedImageUrl}
        authorName={authorName}
        category={category}
        tags={tags}
      />
    </div>
  );
};

export default NewsForm;
