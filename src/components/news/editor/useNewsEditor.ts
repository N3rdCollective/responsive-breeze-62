import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { handleImageUpload } from "./ImageUploader";
import { NewsStatus } from "./NewsForm";
import { Database } from "@/integrations/supabase/types";

// Type for the posts table from Supabase
type Post = Database['public']['Tables']['posts']['Row'];

// Create an extended type that includes the excerpt field
interface ExtendedPost extends Post {
  excerpt?: string;
}

interface UseNewsEditorProps {
  id?: string;
  staffName: string;
}

export const useNewsEditor = ({ id, staffName }: UseNewsEditorProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // State for the news post
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [status, setStatus] = useState<NewsStatus>("draft");
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [currentFeaturedImageUrl, setCurrentFeaturedImageUrl] = useState("");
  
  // Loading and error state
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Fetch the news post data
  const fetchNewsPost = async () => {
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
        // Cast data to ExtendedPost to safely access the excerpt field
        const extendedData = data as ExtendedPost;
        setExcerpt(extendedData.excerpt || "");
        setStatus((data.status as NewsStatus) || "draft");
        
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

  // Handle image selection
  const handleImageSelected = (file: File) => {
    setFeaturedImage(file);
  };
  
  // Function to extract plain text from HTML for excerpt generation
  const extractTextFromHtml = (html: string): string => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const textContent = tempDiv.textContent || tempDiv.innerText || "";
    return textContent.substring(0, 150) + (textContent.length > 150 ? "..." : "");
  };
  
  // Save the news post
  const handleSave = async () => {
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
          const uploadedUrl = await handleImageUpload(featuredImage);
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
      // Use type assertion to add the excerpt field to the Post type
      const newsData: Partial<Post> & { excerpt?: string } = {
        title,
        content,
        status,
        featured_image: featuredImageUrl || null,
        author: staffName || "Staff Member",
        updated_at: new Date().toISOString(),
        excerpt: finalExcerpt, // Add excerpt to the database fields
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
        navigate("/staff/news");
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
    // State
    title,
    setTitle,
    content,
    setContent,
    excerpt,
    setExcerpt,
    status,
    setStatus,
    currentFeaturedImageUrl,
    isLoading,
    isSaving,
    isUploading,
    
    // Methods
    fetchNewsPost,
    handleImageSelected,
    handleSave
  };
};
