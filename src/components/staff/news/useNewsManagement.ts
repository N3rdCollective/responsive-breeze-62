
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Post, PaginationMeta } from "./types/newsTypes";

export const useNewsManagement = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // Number of posts per page
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["staff-news-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        toast({
          title: "Error fetching posts",
          description: error.message,
          variant: "destructive",
        });
        return { posts: [], pagination: { currentPage: 1, totalPages: 1, pageSize, totalItems: 0 } };
      }
      
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
  });

  const posts = data?.posts || [];
  
  // Filter posts based on search term
  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (post.category && post.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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

  return {
    posts,
    filteredPosts,
    paginatedPosts,
    pagination: paginationMeta,
    isLoading,
    error,
    refetch,
    searchTerm,
    setSearchTerm,
    currentPage,
    handlePageChange
  };
};
