
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useStaffAuth } from "@/hooks/useStaffAuth";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import LoadingSpinner from "@/components/staff/LoadingSpinner";

// Type definitions for our news posts
type NewsStatus = "published" | "draft";

interface NewsPost {
  id: string;
  title: string;
  content: string;
  excerpt?: string; // Make excerpt optional since it may not exist in the database
  status: NewsStatus;
  featured_image?: string;
  created_at: string;
  updated_at: string;
  author: string;
}

const NewsEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { staffName, isAdmin, userRole } = useStaffAuth();
  
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
  
  // Check auth
  useEffect(() => {
    if (!staffName) {
      navigate("/staff-login");
    }
  }, [staffName, navigate]);
  
  // Fetch the news post if editing an existing one
  useEffect(() => {
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
          // Type assertion to avoid TypeScript error, since excerpt might not exist in the database
          const postData = data as any;
          // Use the excerpt if it exists, otherwise generate one from content
          setExcerpt(postData.excerpt || data.content?.substring(0, 150) + "..." || "");
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
    
    fetchNewsPost();
  }, [id, toast]);
  
  // Function to handle image uploads
  const handleImageUpload = async (file: File): Promise<string | null> => {
    if (!file) return null;
    
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `news/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from("media")
        .getPublicUrl(filePath);
        
      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your image",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
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
    
    try {
      let featuredImageUrl = currentFeaturedImageUrl;
      
      // Upload the featured image if a new one was selected
      if (featuredImage) {
        const uploadedUrl = await handleImageUpload(featuredImage);
        if (uploadedUrl) {
          featuredImageUrl = uploadedUrl;
        }
      }
      
      // Generate an excerpt from content if none is provided
      const finalExcerpt = excerpt || content.substring(0, 150) + "...";
      
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
            post_date: new Date().toISOString(), // Add post_date for new posts
          }]);
      }
      
      if (result.error) throw result.error;
      
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
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {id ? "Edit News Post" : "Create News Post"}
        </h1>
        <Button
          variant="outline"
          onClick={() => navigate("/staff/news")}
        >
          Cancel
        </Button>
      </div>
      
      <div className="space-y-6">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter post title"
          />
        </div>
        
        <div>
          <Label htmlFor="excerpt">Excerpt (optional)</Label>
          <Textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Brief summary of the post"
            className="h-20"
          />
        </div>
        
        <div>
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your post content here"
            className="h-64"
          />
        </div>
        
        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            value={status}
            onValueChange={(value: NewsStatus) => setStatus(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="featured-image">Featured Image</Label>
          <div className="mt-2">
            <Input
              id="featured-image"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const files = e.target.files;
                if (files && files.length > 0) {
                  setFeaturedImage(files[0]);
                }
              }}
            />
          </div>
          
          {currentFeaturedImageUrl && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">Current image:</p>
              <img
                src={currentFeaturedImageUrl}
                alt="Featured"
                className="w-full max-w-md rounded-md"
              />
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-4 pt-4">
          <Button
            variant="outline"
            onClick={() => navigate("/staff/news")}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || isUploading}
          >
            {isSaving ? (
              <>
                <LoadingSpinner />
                <span className="ml-2">Saving...</span>
              </>
            ) : (
              "Save Post"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NewsEditor;
