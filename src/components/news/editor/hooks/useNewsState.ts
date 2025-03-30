
import { useState, useCallback, useEffect } from "react";
import { NewsStatus } from "../NewsForm";

export const useNewsState = () => {
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [excerpt, setExcerpt] = useState<string>("");
  const [status, setStatusState] = useState<NewsStatus>("draft");
  const [category, setCategory] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [currentFeaturedImageUrl, setCurrentFeaturedImageUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);
  const [statusChanged, setStatusChanged] = useState<boolean>(false);

  // Direct status setter for internal use without logging or triggering change detection
  const setStatusInternal = useCallback((newStatus: NewsStatus) => {
    console.log("[useNewsState] Using internal status setter:", newStatus);
    setStatusState(newStatus);
  }, []);

  // Add debugging effect to log status changes
  useEffect(() => {
    console.log("[useNewsState] Status state changed to:", status);
  }, [status]);

  // Public status updater with simplified logic - always update the state
  const setStatus = useCallback((newStatus: NewsStatus) => {
    console.log("[useNewsState] Status change requested to:", newStatus);
    
    // Always set the status to the new value
    setStatusState(newStatus);
    
    // If status is changing, set the change flag
    if (status !== newStatus) {
      console.log("[useNewsState] Status is changing, setting statusChanged flag to true");
      setStatusChanged(true);
    }
    
    // Log after update for debugging
    setTimeout(() => {
      console.log("[useNewsState] Status after update:", newStatus);
    }, 0);
  }, [status]);

  return {
    title, setTitle,
    content, setContent,
    excerpt, setExcerpt,
    status, 
    setStatus,
    setStatusInternal,
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
