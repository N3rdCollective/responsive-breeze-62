
import React from "react";
import NewsFormBasicFields from "./NewsFormBasicFields";
import RichTextEditor from "../RichTextEditor";
import ImageUploader from "../ImageUploader";
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
  currentFeaturedImageUrl,
  onImageSelected,
  onOpenPreview,
}) => {
  return (
    <div className="space-y-6">
      <NewsFormBasicFields
        title={title}
        setTitle={setTitle}
        excerpt={excerpt}
        setExcerpt={setExcerpt}
        status={status}
        setStatus={setStatus}
      />
      
      <RichTextEditor
        id="content"
        label="Content"
        value={content}
        onChange={setContent}
      />
      
      <ImageUploader 
        currentImageUrl={currentFeaturedImageUrl}
        onImageSelected={onImageSelected}
      />
    </div>
  );
};

export default EditorTabContent;
