
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import LoadingSpinner from "@/components/staff/LoadingSpinner";
import NewsForm from "@/components/news/editor/NewsForm";
import { useNewsEditor } from "@/components/news/editor/useNewsEditor";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

// Type definitions for our news posts
interface NewsPost {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  status: "published" | "draft";
  category?: string;
  tags?: string[];
  featured_image?: string;
  created_at: string;
  updated_at: string;
  author: string;
}

const NewsEditor = () => {
  const { id } = useParams<{ id: string }>();
  const { staffName, isLoading: authLoading, userRole } = useStaffAuth();
  const navigate = useNavigate();
  
  console.log("NewsEditor loaded with id:", id, "User role:", userRole);
  
  const {
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
    fetchNewsPost,
    handleImageSelected,
    handleSave
  } = useNewsEditor({ id, staffName, userRole });
  
  useEffect(() => {
    if (authLoading) return;
    if (!staffName) {
      navigate("/staff/login");
      return;
    }
    
    console.log("Calling fetchNewsPost with id:", id);
    // Call fetchNewsPost which now handles both new and existing posts
    fetchNewsPost();
  }, [id, staffName, authLoading, fetchNewsPost]);
  
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (!staffName) {
    return null;
  }
  
  // Only show loading spinner when editing an existing post and data is being fetched
  if (id && isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/staff/news')}
          className="gap-1 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to News Management
        </Button>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {id ? "Edit News Post" : "Create News Post"}
        </h1>
      </div>
      
      <NewsForm
        title={title}
        setTitle={setTitle}
        content={content}
        setContent={setContent}
        excerpt={excerpt}
        setExcerpt={setExcerpt}
        status={status}
        setStatus={setStatus}
        category={category}
        setCategory={setCategory}
        tags={tags || []}
        setTags={setTags}
        currentFeaturedImageUrl={currentFeaturedImageUrl}
        onImageSelected={handleImageSelected}
        onSave={handleSave}
        isSaving={isSaving}
        isUploading={isUploading}
        isPreviewModalOpen={isPreviewModalOpen}
        setIsPreviewModalOpen={setIsPreviewModalOpen}
        authorName={staffName}
        canPublish={canPublish}
      />
    </div>
  );
};

export default NewsEditor;
