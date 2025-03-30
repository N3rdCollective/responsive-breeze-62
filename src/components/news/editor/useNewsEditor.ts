
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { NewsStatus } from "./NewsForm";
import { useNewsState } from "./hooks/useNewsState";
import { useNewsData } from "./hooks/useNewsData";
import { useImageHandler } from "./hooks/useImageHandler";
import { useCallback, useEffect } from "react";

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
  
  // Use the state hook to manage all form state
  const {
    title, setTitle,
    content, setContent,
    excerpt, setExcerpt,
    status, setStatus,
    statusChanged, setStatusChanged,
    category, setCategory,
    tags, setTags,
    featuredImage, setFeaturedImage,
    currentFeaturedImageUrl, setCurrentFeaturedImageUrl,
    isLoading, setIsLoading,
    isSaving, setIsSaving,
    isUploading, setIsUploading,
    isPreviewModalOpen, setIsPreviewModalOpen
  } = useNewsState();

  // Check if user has permission to publish
  const canPublish = userRole === 'admin' || userRole === 'super_admin' || 
                     userRole === 'moderator' || userRole === 'content_manager';
  
  // Set appropriate status based on permissions if attempting to publish
  useEffect(() => {
    if (status === 'published' && !canPublish) {
      setStatus('draft');
      toast({
        title: "Permission Required",
        description: "You don't have permission to publish posts. Saved as draft instead.",
        variant: "destructive",
      });
    }
  }, [status, canPublish, toast, setStatus]);

  // Fetch the news post data
  const fetchNewsPostData = useCallback(async () => {
    if (!id) {
      // Set default state for new post
      setIsLoading(false);
      return;
    }
    
    console.log("Fetching post data for ID:", id);
    console.log("Current user role:", userRole);
    
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
    
    // Reset status changed flag after fetching
    setStatusChanged(false);
  }, [id, fetchNewsPost, setTitle, setContent, setExcerpt, setStatus, setCategory, setTags, setCurrentFeaturedImageUrl, setIsLoading, userRole, setStatusChanged]);

  // Handle image selection
  const handleImageSelected = (file: File) => {
    console.log("Image selected:", file.name, file.size);
    setFeaturedImage(file);
    
    toast({
      title: "Image Selected",
      description: "Image will be uploaded when you save the post",
    });
  };
  
  // Save the news post
  const handleSave = async () => {
    console.log("Save requested with status:", status);
    console.log("Status changed flag:", statusChanged);
    console.log("User role:", userRole, "Can publish:", canPublish);
    console.log("Current ID:", id);
    console.log("Current category:", category);
    console.log("Current title:", title);
    console.log("Current content length:", content?.length || 0);
    
    // If trying to publish but doesn't have permission, save as draft
    const finalStatus = (status === 'published' && !canPublish) ? 'draft' : status;
    
    if (finalStatus !== status) {
      toast({
        title: "Permission Required",
        description: "You don't have permission to publish posts. Saving as draft instead.",
        variant: "destructive",
      });
    }
    
    console.log("Saving post with final data:", {
      id,
      title,
      content: content ? `${content.substring(0, 30)}...` : 'empty',
      excerpt: excerpt ? `${excerpt.substring(0, 30)}...` : 'empty',
      status: finalStatus,
      category,
      tags,
      featuredImage: featuredImage ? 'Selected' : 'None',
      currentFeaturedImageUrl: currentFeaturedImageUrl ? 'Has URL' : 'None',
      staffName
    });
    
    await saveNewsPost(
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
