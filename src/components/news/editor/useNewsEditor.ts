
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { NewsStatus } from "./NewsForm";
import { useNewsState } from "./hooks/useNewsState";
import { useNewsData } from "./hooks/useNewsData";
import { useImageHandler } from "./hooks/useImageHandler";
import { useCallback, useEffect, useRef } from "react";
import { useNewsPermissions } from "./hooks/useNewsPermissions";

interface UseNewsEditorProps {
  id?: string;
  staffName: string;
  userRole?: string;
}

export const useNewsEditor = ({ id, staffName, userRole }: UseNewsEditorProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { handleImageUpload } = useImageHandler();
  const { fetchNewsPost, saveNewsPost } = useNewsData();
  const { canPublish, getFinalStatus } = useNewsPermissions({ userRole });
  const fetchInProgressRef = useRef(false);
  
  console.log("[useNewsEditor] Hook initialized with:", { id, staffName, userRole });
  
  // Use the state hook to manage all form state
  const {
    title, setTitle,
    content, setContent,
    excerpt, setExcerpt,
    status, setStatus,
    category, setCategory,
    tags, setTags,
    featuredImage, setFeaturedImage,
    currentFeaturedImageUrl, setCurrentFeaturedImageUrl,
    isLoading, setIsLoading,
    isSaving, setIsSaving,
    isUploading, setIsUploading,
    isPreviewModalOpen, setIsPreviewModalOpen
  } = useNewsState();

  // Fetch the news post data when editing
  const fetchNewsPostData = useCallback(async () => {
    console.log("[useNewsEditor] fetchNewsPostData called with ID:", id);
    
    if (!id) {
      console.log("[useNewsEditor] No ID provided, setting up for new post");
      setIsLoading(false);
      return;
    }

    // Prevent multiple simultaneous fetch attempts
    if (fetchInProgressRef.current) {
      console.log("[useNewsEditor] Fetch already in progress, skipping");
      return;
    }

    console.log("[useNewsEditor] Starting to fetch post data for ID:", id);
    fetchInProgressRef.current = true;
    
    try {
      await fetchNewsPost(id, {
        setTitle,
        setContent,
        setExcerpt,
        setStatus,
        setCategory,
        setTags,
        setCurrentFeaturedImageUrl,
        setIsLoading
      });
      console.log("[useNewsEditor] Post data fetched successfully for ID:", id);
    } catch (error) {
      console.error("[useNewsEditor] Error fetching post data:", error);
      toast({
        title: "Error",
        description: "Failed to load post data. Please refresh the page.",
        variant: "destructive",
      });
      setIsLoading(false);
    } finally {
      fetchInProgressRef.current = false;
    }
  }, [
    id, fetchNewsPost, setTitle, setContent, setExcerpt, 
    setStatus, setCategory, setTags, setCurrentFeaturedImageUrl, 
    setIsLoading, toast
  ]);

  // Initialize data on component mount or when ID changes
  useEffect(() => {
    console.log("[useNewsEditor] Effect triggered - ID changed to:", id);
    fetchNewsPostData();
  }, [id]); // Only depend on ID to prevent multiple calls

  // Handle image selection
  const handleImageSelected = (file: File) => {
    console.log("[useNewsEditor] Image selected:", file.name, file.size);
    setFeaturedImage(file);
    
    toast({
      title: "Image Selected",
      description: "Image will be uploaded when you save the post",
    });
  };
  
  // Save the news post
  const handleSave = async () => {
    console.log("[useNewsEditor] Save requested with status:", status);
    console.log("[useNewsEditor] User role:", userRole, "Can publish:", canPublish);
    
    // Determine final status based on permissions
    const finalStatus = getFinalStatus(status);
    
    setIsSaving(true);
    
    try {
      // Save the post with integrated workflow
      const saveResult = await saveNewsPost(
        {
          id,
          title,
          content,
          excerpt,
          status: finalStatus,
          category: category || 'Uncategorized',
          tags: tags || [],
          featuredImage,
          currentFeaturedImageUrl,
          staffName
        },
        {
          uploadImage: handleImageUpload,
          setIsSaving,
          setIsUploading,
          onSuccess: () => {
            toast({
              title: "Success",
              description: id ? "News post updated successfully" : "News post created successfully",
            });
            navigate("/staff/news");
          }
        }
      );
      
      console.log("[useNewsEditor] Save completed:", saveResult);
    } catch (error) {
      console.error("[useNewsEditor] Error saving post:", error);
      setIsSaving(false);
    }
  };

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
    category,
    setCategory,
    tags,
    setTags,
    currentFeaturedImageUrl,
    isLoading,
    isSaving,
    isUploading,
    isPreviewModalOpen,
    setIsPreviewModalOpen,
    canPublish,
    
    // Methods
    fetchNewsPost: fetchNewsPostData,
    handleImageSelected,
    handleSave
  };
};
