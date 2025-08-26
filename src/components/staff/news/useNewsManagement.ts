
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Post, PaginationMeta } from "./types/newsTypes";

export const useNewsManagement = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // Number of posts per page
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["staff-news-posts"],
    queryFn: async () => {
      console.log("Fetching posts from Supabase");
      
      // Debug authentication context
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Current session:", session?.user?.id);
      
      // Check if user is staff
      const { data: staffCheck, error: staffError } = await supabase
        .rpc('is_user_staff_member_secure', { user_id: session?.user?.id });
      console.log("Staff check result:", staffCheck, "Staff error:", staffError);
      
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching posts:", error);
        toast({
          title: "Error fetching posts",
          description: error.message,
          variant: "destructive",
        });
        return { posts: [], pagination: { currentPage: 1, totalPages: 1, pageSize, totalItems: 0 } };
      }
      
      console.log(`Fetched ${data.length} posts successfully`);
      return { 
        posts: data as Post[],
        pagination: { 
          currentPage: 1, 
          totalPages: Math.ceil(data.length / pageSize),
          pageSize,
          totalItems: data.length
        } 
      };
    },
    // Disable caching to ensure fresh data
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const posts = data?.posts || [];
  
  // Filter posts based on search term and status
  const filteredPosts = posts.filter(post => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (post.category && post.category.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = 
      statusFilter === "all" || 
      post.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate pagination metadata based on filtered posts
  const paginationMeta: PaginationMeta = {
    currentPage,
    totalPages: Math.ceil(filteredPosts.length / pageSize),
    pageSize,
    totalItems: filteredPosts.length
  };

  // Get paginated posts for current page
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Ensure we reset to page 1 when filters change
  const handleFilterChange = (status: "all" | "published" | "draft") => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  // Ensure we reset to page 1 when search term changes
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  // Define a robust refetch function that ensures the query is properly refetched
  const handleRefetch = async () => {
    console.log("Manual refetch triggered in useNewsManagement");
    try {
      // Force refetch with explicit await
      const result = await refetch();
      console.log("Refetch completed successfully", result);
      return result;
    } catch (error) {
      console.error("Error during refetch in useNewsManagement:", error);
      throw error; // Re-throw to allow error handling up the chain
    }
  };

  return {
    posts,
    filteredPosts,
    paginatedPosts,
    pagination: paginationMeta,
    isLoading,
    error,
    refetch: handleRefetch,
    searchTerm,
    setSearchTerm: handleSearchChange,
    statusFilter,
    setStatusFilter: handleFilterChange,
    currentPage,
    handlePageChange
  };
};
