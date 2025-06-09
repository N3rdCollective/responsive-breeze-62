import React, { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useForumCategoryData } from "@/hooks/forum/useForumCategoryData";
import { useForumPagination } from "@/hooks/forum/useForumPagination";

import ForumCategoryHeader from "@/components/forum/ForumCategoryHeader";
import TopicList from "@/components/forum/TopicList";
import ForumPagination from "@/components/forum/ForumPagination";

const ForumCategoryPage = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  // Use the new pagination hook
  const { page, setPage } = useForumPagination();
  
  const { 
    category, 
    topics, 
    loadingData: categoryDataLoading, 
    totalPages, 
    error: categoryDataError 
  } = useForumCategoryData({ categorySlug, page });

  console.log('[ForumCategoryPage] Rendering with category:', category?.name, 'topics:', topics.length, 'loading:', categoryDataLoading);

  // useEffect for auth redirection remains the same
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);
  
  if (authLoading || categoryDataLoading) {
    console.log('[ForumCategoryPage] Showing loading state - auth loading:', authLoading, 'data loading:', categoryDataLoading);
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-20 px-4 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
       <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-20 px-4 flex justify-center items-center">
          <p>Redirecting to login...</p>
        </div>
      </div>
    );
  }
  
  // Enhanced error handling with logging
  if (!category && !categoryDataLoading) { 
    console.log('[ForumCategoryPage] Category not found, showing error state. Error:', categoryDataError);
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-20 px-4 max-w-6xl mx-auto">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-lg font-medium mb-2">
                {categoryDataError ? "Error Loading Category" : "Category not found"}
              </p>
              <p className="text-muted-foreground mb-4">
                {categoryDataError || "The forum category you're looking for doesn't exist or you were redirected."}
              </p>
              <Button asChild>
                <Link to="/members">Back to Forum</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // If category is still null after loading and no error, it implies it was handled by redirect in hook.
  if (!category) {
     console.log('[ForumCategoryPage] Category still null after loading, showing loading fallback');
     return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-20 px-4 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Loading category information...</p>
        </div>
      </div>
    );
  }
  
  console.log('[ForumCategoryPage] Rendering main content for category:', category.name);
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="pt-20 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <ForumCategoryHeader category={category} categorySlug={categorySlug} />
          
          <div className="mb-6">
            <Link to="/members" className="text-sm text-primary hover:underline">
              &larr; Back to Forum
            </Link>
          </div>
          
          <TopicList topics={topics} categorySlug={categorySlug} categoryId={category?.id} />
          
          {topics.length > 0 && totalPages > 1 && (
             <ForumPagination page={page} totalPages={totalPages} setPage={setPage} />
          )}
          
          <div className="mt-8 text-center text-muted-foreground text-sm">
            <p>Showing topics in {category.name}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumCategoryPage;
