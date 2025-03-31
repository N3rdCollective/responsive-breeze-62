
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { NewsStatus } from "./NewsForm";
import { useNewsState } from "./hooks/useNewsState";
import { useNewsData } from "./hooks/useNewsData";
import { useImageHandler } from "./hooks/useImageHandler";
import { useCallback, useEffect, useRef } from "react";
import { useNewsPermissions } from "./hooks/useNewsPermissions";
import { useSaveNewsWorkflow } from "./hooks/useSaveNewsWorkflow";

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
  const { executeSaveWorkflow } = useSaveNewsWorkflow({ staffName });
  const fetchedRef = useRef(false);
  
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

  // Fetch the news post data
  const fetchNewsPostData = useCallback(() => {
    if (!id) {
      // Set default state for new post
      setIsLoading(false);
      return;
    }
    
    if (fetchedRef.current) {
      return;
    }

    console.log("[useNewsEditor] Fetching post data for ID:", id);
    console.log("[useNewsEditor] Current user role:", userRole);
    
    setIsLoading(true);
    fetchedRef.current = true;
    
    fetchNewsPost(id, {
      setTitle,
      setContent,
      setExcerpt,
      setStatus,
      setCategory,
      setTags,
      setCurrentFeaturedImageUrl,
      setIsLoading
    });
  }, [
    id, fetchNewsPost, setTitle, setContent, setExcerpt, 
    setStatus, setCategory, setTags, setCurrentFeaturedImageUrl, 
    setIsLoading, userRole
  ]);

  // Initialize data on component mount
  useEffect(() => {
    fetchNewsPostData();
  }, [fetchNewsPostData]);

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
      // Save the post with error handling
      const saveResult = await saveNewsPost(
        {
          id,
          title,
          content,
          excerpt,
          status: finalStatus,
          category: category || 'Uncategorized', // Ensure category is never empty
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
      
      // Handle activity logging through our workflow helper
      await executeSaveWorkflow(
        () => Promise.resolve(saveResult), // Pass the already-completed save result
        {
          id,
          title,
          status: finalStatus,
          category,
          hasImage: !!featuredImage || !!currentFeaturedImageUrl
        }
      );
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
