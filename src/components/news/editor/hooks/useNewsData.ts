
import { Database } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Type for the posts table from Supabase
export type Post = Database['public']['Tables']['posts']['Row'];

export const useNewsData = () => {
  const { toast } = useToast();

  // Function to extract plain text from HTML for excerpt generation
  const extractTextFromHtml = (html: string): string => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const textContent = tempDiv.textContent || tempDiv.innerText || "";
    return textContent.substring(0, 150) + (textContent.length > 150 ? "..." : "");
  };

  const fetchNewsPost = async (id: string, callbacks: {
    setTitle: (title: string) => void;
    setContent: (content: string) => void;
    setExcerpt: (excerpt: string) => void;
    setStatus: (status: any) => void;
    setCurrentFeaturedImageUrl: (url: string) => void;
    setIsLoading: (isLoading: boolean) => void;
  }) => {
    const { setTitle, setContent, setExcerpt, setStatus, setCurrentFeaturedImageUrl, setIsLoading } = callbacks;
    
    if (!id) return; // Exit early if no ID (creating a new post)
    
    setIsLoading(true);
    try {
      console.log("Fetching post with ID:", id);
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .single();
        
      if (error) throw error;
      
      console.log("Fetched post data:", data);
      if (data) {
        setTitle(data.title);
        setContent(data.content || "");
        setExcerpt(data.excerpt || "");
        setStatus(data.status || "draft");
        
        if (data.featured_image) {
          setCurrentFeaturedImageUrl(data.featured_image);
        }
      }
    } catch (error) {
      console.error("Error fetching news post:", error);
      toast({
        title: "Error",
        description: "Failed to load news post",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveNewsPost = async (
    postData: {
      id?: string;
      title: string;
      content: string;
      excerpt: string;
      status: string;
      featuredImage: File | null;
      currentFeaturedImageUrl: string;
      staffName: string;
    },
    callbacks: {
      uploadImage: (file: File) => Promise<string | null>;
      setIsSaving: (isSaving: boolean) => void;
      setIsUploading: (isUploading: boolean) => void;
      onSuccess: () => void;
    }
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
      const newsData = {
        title,
        content,
        status,
        featured_image: featuredImageUrl || null,
        author: staffName || "Staff Member",
        updated_at: new Date().toISOString(),
        excerpt: finalExcerpt, // Now this field exists in the database
      } as Partial<Post>;
      
      console.log("Saving post data:", newsData);
      
      let result;
      
      if (id) {
        // Update existing post
        console.log("Updating existing post with ID:", id);
        result = await supabase
          .from("posts")
          .update(newsData)
          .eq("id", id)
          .select();  // Add select() to get the updated data
          
        console.log("Update result:", result);
        
        if (result.error) {
          throw new Error(`Database error: ${result.error.message} (${result.error.code})`);
        }
        
        if (result.count === 0 || !result.data || result.data.length === 0) {
          console.warn("No rows were updated - this may indicate an issue with permissions or row not found");
          
          // Double-check if the post exists
          const checkResult = await supabase
            .from("posts")
            .select("id")
            .eq("id", id)
            .single();
            
          if (checkResult.error) {
            console.error("Error checking post existence:", checkResult.error);
            if (checkResult.error.code === "PGRST116") {
              throw new Error("Post not found. It may have been deleted.");
            }
          }
          
          if (!checkResult.data) {
            throw new Error("Post not found. It may have been deleted.");
          } else {
            throw new Error("Post exists but wasn't updated. This could be due to permission issues or no actual changes were made.");
          }
        }
      } else {
        // Create new post
        console.log("Creating new post");
        const newPost = {
          ...newsData,
          title, // Explicitly include title to satisfy TypeScript
          created_at: new Date().toISOString(),
          post_date: new Date().toISOString(),
        };
        
        result = await supabase
          .from("posts")
          .insert([newPost])
          .select();  // Add select() to get the inserted data
          
        console.log("Insert result:", result);
        
        if (result.error) {
          throw new Error(`Database error: ${result.error.message} (${result.error.code})`);
        }
        
        if (!result.data || result.data.length === 0) {
          throw new Error("Insert operation did not return data, which is unexpected");
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

  return {
    fetchNewsPost,
    saveNewsPost,
    extractTextFromHtml
  };
};
