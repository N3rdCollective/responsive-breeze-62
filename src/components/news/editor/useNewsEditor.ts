
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { handleImageUpload } from "./ImageUploader";
import { NewsStatus } from "./NewsForm";
import { Database } from "@/integrations/supabase/types";

// Type for the posts table from Supabase
type Post = Database['public']['Tables']['posts']['Row'];

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
        // Since excerpt might not be directly typed in the Post type,
        // we use a type assertion and optional chaining
        setExcerpt((data as any).excerpt || "");
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
    return tempDiv.textContent || tempDiv.innerText || "";
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
        const uploadedUrl = await handleImageUpload(featuredImage);
        if (uploadedUrl) {
          featuredImageUrl = uploadedUrl;
          console.log("Image uploaded successfully:", featuredImageUrl);
        } else {
          console.error("Image upload failed, but continuing with save");
        }
        setIsUploading(false);
      }
      
      // Generate an excerpt from content if none is provided
      const finalExcerpt = excerpt || extractTextFromHtml(content).substring(0, 150) + "...";
      console.log("Generated excerpt:", finalExcerpt);
      
      // Prepare the data for the database
      // Note: We're not directly including 'excerpt' in the database update/insert
      // since it's not in the posts table schema
      const newsData: Partial<Post> = {
        title,
        content,
        status,
        featured_image: featuredImageUrl,
        author: staffName || "Staff Member",
        updated_at: new Date().toISOString(),
      };
      
      console.log("Saving post data:", newsData);
      
      let result;
      
      if (id) {
        // Update existing post
        console.log("Updating existing post with ID:", id);
        result = await supabase
          .from("posts")
          .update(newsData)
          .eq("id", id);
      } else {
        // Create new post - ensure title is included and use a properly typed object
        console.log("Creating new post");
        const newPost = {
          ...newsData,
          title, // Explicitly include title to satisfy TypeScript
          created_at: new Date().toISOString(),
          post_date: new Date().toISOString(),
        };
        
        result = await supabase
          .from("posts")
          .insert([newPost]);
      }
      
      if (result.error) {
        console.error("Database error:", result.error);
        throw result.error;
      }
      
      console.log("Supabase operation result:", result);
      
      if (id) {
        // For updates, check if any rows were affected
        if (result.count === 0) {
          console.warn("No rows were updated - check if anything actually changed");
        }
      } else {
        // For inserts, check if data was returned
        if (!result.data || result.data.length === 0) {
          console.warn("Insert succeeded but no data was returned");
        }
      }
      
      toast({
        title: "Success",
        description: id ? "News post updated" : "News post created",
      });
      
      // Short delay before navigation to ensure state updates are complete
      setTimeout(() => {
        navigate("/staff/news");
      }, 500);
    } catch (error) {
      console.error("Error saving news post:", error);
      toast({
        title: "Error",
        description: "Failed to save news post. " + (error as Error)?.message || "",
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
