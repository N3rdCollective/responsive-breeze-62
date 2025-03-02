
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
  featured_image?: string;
  created_at: string;
  updated_at: string;
  author: string;
}

const NewsEditor = () => {
  const { id } = useParams<{ id: string }>();
  const { staffName, isLoading: authLoading } = useStaffAuth();
  const navigate = useNavigate();
  
  const {
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
    fetchNewsPost,
    handleImageSelected,
    handleSave
  } = useNewsEditor({ id, staffName });
  
  useEffect(() => {
    if (authLoading) return;
    if (!staffName) {
      navigate("/staff-login");
      return;
    }
    
    fetchNewsPost();
  }, [id, staffName, authLoading]);
  
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
  
  if (isLoading) {
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
          onClick={() => navigate('/staff-panel')}
          className="gap-1 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Staff Panel
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
        currentFeaturedImageUrl={currentFeaturedImageUrl}
        onImageSelected={handleImageSelected}
        onSave={handleSave}
        isSaving={isSaving}
        isUploading={isUploading}
      />
    </div>
  );
};

export default NewsEditor;
