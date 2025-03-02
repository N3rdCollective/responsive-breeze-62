
import { useState } from "react";
import { NewsStatus } from "../NewsForm";

export const useNewsState = (initialData?: {
  title?: string;
  content?: string;
  excerpt?: string;
  status?: NewsStatus;
  featuredImageUrl?: string;
}) => {
  // State for the news post
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [status, setStatus] = useState<NewsStatus>(initialData?.status as NewsStatus || "draft");
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [currentFeaturedImageUrl, setCurrentFeaturedImageUrl] = useState(initialData?.featuredImageUrl || "");
  
  // Loading and error state
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Preview modal state
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  return {
    // State
    title,
    setTitle,
    content,
    setContent,
    excerpt,
    setExcerpt,
    status,
    setStatus,
    featuredImage,
    setFeaturedImage,
    currentFeaturedImageUrl,
    setCurrentFeaturedImageUrl,
    isLoading,
    setIsLoading,
    isSaving,
    setIsSaving,
    isUploading,
    setIsUploading,
    isPreviewModalOpen,
    setIsPreviewModalOpen,
  };
};
