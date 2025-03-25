
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
  category: string;
  tags: string[];
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
    const { id, title, content, excerpt, status, category, tags, featuredImage, currentFeaturedImageUrl, staffName } = postData;
    const { uploadImage, setIsSaving, setIsUploading, onSuccess } = callbacks;
    
    console.log("SaveNewsPost - Starting save with ID:", id);
    console.log("SaveNewsPost - Post status:", status);
    
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
      let featuredImageUrl = currentFeaturedImageUrl;
      
      // Upload the featured image if a new one was selected
      if (featuredImage) {
        console.log("Uploading new featured image");
        setIsUploading(true);
        
        try {
          const uploadedUrl = await uploadImage(featuredImage);
          if (uploadedUrl) {
            featuredImageUrl = uploadedUrl;
            console.log("Image uploaded successfully, updating featured_image to:", featuredImageUrl);
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
        } finally {
          setIsUploading(false);
        }
      }
      
      // Generate an excerpt from content if none is provided
      const finalExcerpt = excerpt || extractTextFromHtml(content);
      console.log("Generated excerpt:", finalExcerpt);
      
      // Prepare the data for the database
      const newsData: any = {
        title,
        content,
        status,
        excerpt: finalExcerpt,
        featured_image: featuredImageUrl || null,
        tags: tags || [],
        updated_at: new Date().toISOString(),
        author_name: staffName || 'Staff Author'
      };
      
      // For category updates
      if (category) {
        newsData['category'] = category || 'Uncategorized';
      }
      
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
          console.error("Database error details:", result.error);
          throw new Error(`Database error: ${result.error.message} (${result.error.code})`);
        }
        
        if (result.data && result.data.length === 0) {
          console.warn("Update query succeeded but no rows were affected");
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
    }
  };

  return { saveNewsPost };
};
