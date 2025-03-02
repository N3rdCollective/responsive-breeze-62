
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { extractTextFromHtml } from "../utils/textUtils";

/**
 * Post data for saving
 */
export interface NewsPostData {
  id?: string;
  title: string;
  content: string;
  excerpt: string;
  status: string;
  featuredImage: File | null;
  currentFeaturedImageUrl: string;
  staffName: string;
}

/**
 * Callbacks for the save operation
 */
export interface SaveNewsPostCallbacks {
  uploadImage: (file: File) => Promise<string | null>;
  setIsSaving: (isSaving: boolean) => void;
  setIsUploading: (isUploading: boolean) => void;
  onSuccess: () => void;
}

/**
 * Hook for saving news post data
 * @returns Function to save news post
 */
export const useSaveNewsPost = () => {
  const { toast } = useToast();

  /**
   * Saves a news post (create or update)
   * @param postData Post data to save
   * @param callbacks Object containing callback functions
   */
  const saveNewsPost = async (
    postData: NewsPostData,
    callbacks: SaveNewsPostCallbacks
  ) => {
    const { id, title, content, excerpt, status, featuredImage, currentFeaturedImageUrl, staffName } = postData;
    const { uploadImage, setIsSaving, setIsUploading, onSuccess } = callbacks;
    
    if (!title || !content) {
      toast({
        title: "Missing Information",
        description: "Title and content are required",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    setIsUploading(!!featuredImage);
    
    try {
      let featuredImageUrl = currentFeaturedImageUrl;
      
      // Upload the featured image if a new one was selected
      if (featuredImage) {
        console.log("Uploading new featured image");
        try {
          const uploadedUrl = await uploadImage(featuredImage);
          if (uploadedUrl) {
            featuredImageUrl = uploadedUrl;
            console.log("Image uploaded successfully:", featuredImageUrl);
          } else {
            console.error("Image upload failed, but continuing with save");
          }
        } catch (imageError) {
          console.error("Error uploading image:", imageError);
          toast({
            title: "Image Upload Failed",
            description: "Continuing to save post without the new image",
            variant: "destructive",
          });
        }
        setIsUploading(false);
      }
      
      // Generate an excerpt from content if none is provided
      const finalExcerpt = excerpt || extractTextFromHtml(content);
      console.log("Generated excerpt:", finalExcerpt);
      
      // Prepare the data for the database
      // Important: Do not use staffName directly for the author field if it's a UUID column
      // Instead use a default string like "Staff" or NULL if you don't have a valid UUID
      const newsData = {
        title,
        content,
        status,
        featured_image: featuredImageUrl || null,
        author: null, // Set to null since we don't have a valid UUID
        updated_at: new Date().toISOString(),
        excerpt: finalExcerpt,
      };
      
      console.log("Saving post data:", newsData);
      
      let result;
      
      if (id) {
        // Update existing post
        console.log("Updating existing post with ID:", id);
        result = await supabase
          .from("posts")
          .update(newsData)
          .eq("id", id)
          .select();
          
        console.log("Update result:", result);
        
        if (result.error) {
          throw new Error(`Database error: ${result.error.message} (${result.error.code})`);
        }
      } else {
        // Create new post
        console.log("Creating new post");
        const newPost = {
          ...newsData,
          created_at: new Date().toISOString(),
          post_date: new Date().toISOString(),
        };
        
        result = await supabase
          .from("posts")
          .insert([newPost])
          .select();
          
        console.log("Insert result:", result);
        
        if (result.error) {
          throw new Error(`Database error: ${result.error.message} (${result.error.code})`);
        }
      }
      
      console.log("Supabase operation result:", result);
      
      toast({
        title: "Success",
        description: id ? "News post updated" : "News post created",
      });
      
      // Short delay before navigation to ensure state updates are complete
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (error) {
      console.error("Error saving news post:", error);
      toast({
        title: "Error",
        description: `Failed to save news post: ${(error as Error)?.message || "Unknown error"}`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  };

  return { saveNewsPost };
};
