
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
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .single();
        
      if (error) throw error;
      
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
        const uploadedUrl = await handleImageUpload(featuredImage);
        if (uploadedUrl) {
          featuredImageUrl = uploadedUrl;
        }
        setIsUploading(false);
      }
      
      // Generate an excerpt from content if none is provided
      const finalExcerpt = excerpt || extractTextFromHtml(content).substring(0, 150) + "...";
      
      const newsData = {
        title,
        content,
        excerpt: finalExcerpt,
        status,
        featured_image: featuredImageUrl,
        author: staffName || "Staff Member",
        updated_at: new Date().toISOString(),
      };
      
      let result;
      
      if (id) {
        // Update existing post
        result = await supabase
          .from("posts")
          .update(newsData)
          .eq("id", id);
      } else {
        // Create new post
        result = await supabase
          .from("posts")
          .insert([{
            ...newsData,
            created_at: new Date().toISOString(),
            post_date: new Date().toISOString(),
          }]);
      }
      
      if (result.error) {
        console.error("Database error:", result.error);
        throw result.error;
      }
      
      toast({
        title: "Success",
        description: id ? "News post updated" : "News post created",
      });
      
      navigate("/staff/news");
    } catch (error) {
      console.error("Error saving news post:", error);
      toast({
        title: "Error",
        description: "Failed to save news post",
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
