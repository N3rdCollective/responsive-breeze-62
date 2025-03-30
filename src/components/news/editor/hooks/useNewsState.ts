
import { useState } from "react";
import { NewsStatus } from "../NewsForm";

export const useNewsState = () => {
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [excerpt, setExcerpt] = useState<string>("");
  const [status, setStatus] = useState<NewsStatus>("draft");
  const [category, setCategory] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [currentFeaturedImageUrl, setCurrentFeaturedImageUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);
  const [statusChanged, setStatusChanged] = useState<boolean>(false);

  // Direct status setter for internal use
  const setStatusInternal = (newStatus: NewsStatus) => {
    setStatus(newStatus);
  };

  // Public status updater with logging and flag setting
  const updateStatus = (newStatus: NewsStatus) => {
    console.log("Status change requested from", status, "to", newStatus);
    // Only set the flag if status is actually changing
    if (status !== newStatus) {
      setStatusChanged(true);
    }
    setStatusInternal(newStatus);
  };

  return {
    title, setTitle,
    content, setContent,
    excerpt, setExcerpt,
    status, 
    setStatus: updateStatus,
    setStatusInternal, // Expose internal setter for direct use when loading
    statusChanged, 
    setStatusChanged,
    category, setCategory,
    tags, setTags,
    featuredImage, setFeaturedImage,
    currentFeaturedImageUrl, setCurrentFeaturedImageUrl,
    isLoading, setIsLoading,
    isSaving, setIsSaving,
    isUploading, setIsUploading,
    isPreviewModalOpen, setIsPreviewModalOpen
  };
};
