
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import LoadingSpinner from "@/components/staff/LoadingSpinner";
import NewsForm from "@/components/news/editor/NewsForm";
import { useNewsEditor } from "@/components/news/editor/useNewsEditor";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import TitleUpdater from "@/components/TitleUpdater";

const NewsEditor = () => {
  const params = useParams<{ id?: string; postId?: string }>();
  // Check both 'id' and 'postId' params since routes might use either
  const id = params.id || params.postId;
  const { staffName, isLoading: authLoading, userRole } = useStaffAuth();
  const navigate = useNavigate();
  
  console.log("[NewsEditor] Component loaded with params:", { params, extractedId: id });
  console.log("[NewsEditor] URL pathname:", window.location.pathname);
  console.log("[NewsEditor] Auth state:", { staffName, isLoading: authLoading, userRole });
  
  // Check if user has appropriate permissions for news editing
  const canEditNews = userRole === "admin" || userRole === "moderator" || userRole === "staff" || userRole === "super_admin" || userRole === "blogger";
  
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
    handleImageSelected,
    handleSave
  } = useNewsEditor({ id, staffName, userRole });
  
  useEffect(() => {
    console.log("[NewsEditor] Auth state changed:", { authLoading, staffName, canEditNews });
    
    if (authLoading) return;
    if (!staffName || !canEditNews) {
      console.log("[NewsEditor] Redirecting to login - no auth or permissions");
      navigate("/staff/login");
      return;
    }
  }, [staffName, authLoading, canEditNews, navigate]);
  
  // Add effect to log when ID changes
  useEffect(() => {
    console.log("[NewsEditor] ID changed:", { id, isLoading });
    if (id) {
      console.log("[NewsEditor] Editing existing post with ID:", id);
    } else {
      console.log("[NewsEditor] Creating new post");
    }
  }, [id, isLoading]);
  
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (!staffName || !canEditNews) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-8 bg-card rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-destructive">Access Denied</h2>
          <p className="mb-6">You do not have permission to access the news editor.</p>
          <Button onClick={() => navigate('/staff/panel')}>Go to Staff Dashboard</Button>
        </div>
      </div>
    );
  }
  
  if (isLoading) {
    console.log("[NewsEditor] Still loading post data...");
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }
  
  console.log("[NewsEditor] Rendering editor with data:", { id, title, status, category });
  
  return (
    <>
      <TitleUpdater title={id ? `Edit Post: ${title || 'Loading...'}` : "Create New Post"} />
      <div className="container mx-auto p-4 max-w-6xl">
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
          <div>
            <h1 className="text-2xl font-bold">
              {id ? "Edit News Post" : "Create News Post"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {id ? `Editing "${title || 'Loading...'}" (ID: ${id})` : 'Create a new article with rich content, tags, and media'}
            </p>
          </div>
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
    </>
  );
};

export default NewsEditor;
