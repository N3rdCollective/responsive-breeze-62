
import { useToast } from "@/hooks/use-toast";
import { extractTextFromHtml } from "../utils/textUtils";
import { NewsPostData, SaveNewsPostCallbacks } from "./types/newsPostTypes";
import { createNewsPost, updateNewsPost, fetchUpdatedPost, preparePostData } from "./utils/newsPostUtils";
import { handlePostImage } from "./utils/imageUtils";

/**
 * Hook for saving news post
 * @returns Function to save news post
 */
export const useSaveNewsPost = () => {
  const { toast } = useToast();

  /**
   * Saves a news post (create or update)
   * @param postData Post data to save
   * @param callbacks Object containing callback functions
   * @returns Object containing the saved post id
   */
  const saveNewsPost = async (
    postData: NewsPostData,
    callbacks: SaveNewsPostCallbacks
  ): Promise<{ id: string } | undefined> => {
    const { id, title, content, status, category, tags, featuredImage, currentFeaturedImageUrl, staffName } = postData;
    const { uploadImage, setIsSaving, setIsUploading, onSuccess } = callbacks;
    
    console.log("SaveNewsPost - Starting save with ID:", id);
    console.log("SaveNewsPost - Post status:", status);
    console.log("SaveNewsPost - Post category:", category);
    console.log("SaveNewsPost - Post data:", JSON.stringify({
      title,
      excerpt: postData.excerpt ? `${postData.excerpt.substring(0, 30)}...` : 'none',
      status,
      category,
      tags,
      staffName,
      currentFeaturedImageUrl: currentFeaturedImageUrl ? 'Has image' : 'No image',
      featuredImage: featuredImage ? `${featuredImage.name} (${featuredImage.size} bytes)` : 'None'
    }));
    
    if (!title || !content) {
      toast({
        title: "Missing Information",
        description: "Title and content are required",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Handle image upload
      let featuredImageUrl = currentFeaturedImageUrl;
      try {
        featuredImageUrl = await handlePostImage(
          featuredImage, 
          currentFeaturedImageUrl, 
          uploadImage, 
          setIsUploading
        );
      } catch (imageError) {
        console.error("Error handling image:", imageError);
        toast({
          title: "Image Upload Failed",
          description: "Continuing to save post without the new image",
          variant: "destructive",
        });
      }
      
      // Generate an excerpt from content if none is provided
      const finalExcerpt = postData.excerpt || extractTextFromHtml(content);
      console.log("Generated excerpt:", finalExcerpt);
      
      // Prepare the data for the database
      const newsData = preparePostData(
        { ...postData, excerpt: finalExcerpt },
        featuredImageUrl
      );
      
      console.log("Saving post data with explicitly set status:", newsData.status);
      
      let result;
      let postId = id;
      
      if (id) {
        // Update existing post
        result = await updateNewsPost(id, newsData);
        
        if (result.error) {
          console.error("Database error details:", result.error);
          throw new Error(`Database error: ${result.error.message} (${result.error.code})`);
        }
        
        // Verify the update
        const verifiedResult = await fetchUpdatedPost(id);
        if (verifiedResult.error) {
          console.error("Error verifying post update:", verifiedResult.error);
        } else {
          console.log("Verified post update:", verifiedResult.data);
        }
      } else {
        // Create new post
        result = await createNewsPost(newsData);
        
        if (result.error) {
          throw new Error(`Database error: ${result.error.message} (${result.error.code})`);
        }
        
        // Get the new post ID - safely access data
        if (result.data && result.data.length > 0) {
          postId = result.data[0].id;
        }
      }
      
      toast({
        title: "Success",
        description: id ? "News post updated" : "News post created",
      });
      
      // Short delay before navigation to ensure state updates are complete
      setTimeout(() => {
        onSuccess();
      }, 500);
      
      return { id: postId as string };
    } catch (error) {
      console.error("Error saving news post:", error);
      toast({
        title: "Error",
        description: `Failed to save news post: ${(error as Error)?.message || "Unknown error"}`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return { saveNewsPost };
};

// Re-export the types for convenience
export type { NewsPostData, SaveNewsPostCallbacks } from './types/newsPostTypes';
