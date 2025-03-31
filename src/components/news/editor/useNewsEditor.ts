
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { NewsStatus } from "./NewsForm";
import { useNewsState } from "./hooks/useNewsState";
import { useNewsData } from "./hooks/useNewsData";
import { useImageHandler } from "./hooks/useImageHandler";
import { useCallback, useEffect, useRef } from "react";
import { useStaffActivityLogger } from "@/hooks/useStaffActivityLogger";

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
  const fetchedRef = useRef(false);
  const { logActivity } = useStaffActivityLogger();
  
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

  // Check if user has permission to publish
  const canPublish = userRole === 'admin' || userRole === 'super_admin' || 
                     userRole === 'moderator' || userRole === 'content_manager';

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
    console.log("[useNewsEditor] Current ID:", id);
    console.log("[useNewsEditor] Current category:", category);
    console.log("[useNewsEditor] Current title:", title);
    console.log("[useNewsEditor] Current content length:", content?.length || 0);
    
    // If trying to publish but doesn't have permission, save as draft
    const finalStatus = (status === 'published' && !canPublish) ? 'draft' : status;
    
    if (finalStatus !== status) {
      toast({
        title: "Permission Required",
        description: "You don't have permission to publish posts. Saving as draft instead.",
        variant: "destructive",
      });
    }
    
    console.log("[useNewsEditor] Saving post with final data:", {
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
    
    try {
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
      
      // Extract the returned ID from the saveResult
      // Use optional chaining and nullish coalescing to safely handle undefined values
      const resultId = saveResult?.id || id;
      
      if (!resultId) {
        console.error("[useNewsEditor] No post ID found after save operation");
        return;
      }
      
      // Log the activity after successful save
      const actionType = id ? 'update_post' : 'create_post';
      const isPublishing = finalStatus === 'published';
      
      // If we're updating and publishing, log a publish action instead
      const finalActionType = id && isPublishing ? 'publish_post' : actionType;
      const description = id 
        ? `${isPublishing ? 'Published' : 'Updated'} post: ${title}`
        : `Created new post: ${title}`;
      
      await logActivity(
        finalActionType,
        description,
        'post',
        resultId,
        {
          title,
          category,
          status: finalStatus,
          hasImage: !!featuredImage || !!currentFeaturedImageUrl
        }
      );
      
      console.log("[useNewsEditor] Activity logged:", {
        action: finalActionType,
        description,
        entityType: 'post',
        entityId: resultId
      });
      
    } catch (error) {
      console.error("[useNewsEditor] Error saving post:", error);
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
