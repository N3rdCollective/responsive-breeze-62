
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Post } from "../types/newsTypes";
import { useAuth } from "@/hooks/useAuth";

export const useNewsData = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  // Clear cached queries and browser storage on mount to fix cached empty results
  useEffect(() => {
    console.log('🗞️ [CACHE_CLEAR] Clearing React Query cache and browser storage...');
    
    // Clear React Query cache
    queryClient.invalidateQueries({ queryKey: ["news-posts"] });
    queryClient.invalidateQueries({ queryKey: ["news-categories"] });
    
    // Clear browser storage to remove any cached states
    try {
      localStorage.removeItem('react-query-offline-cache');
      sessionStorage.clear();
      console.log('🗞️ [CACHE_CLEAR] Browser storage cleared successfully');
    } catch (e) {
      console.warn('🗞️ [CACHE_CLEAR] Could not clear browser storage:', e);
    }
  }, [queryClient]);
  
  console.log('🗞️ [FIXED] useNewsData: Starting news data fetch after RLS fix...', { 
    userId: user?.id,
    isAuthenticated: !!user 
  });
  
  const { data: categories } = useQuery({
    queryKey: ["news-categories"],
    queryFn: async () => {
      console.log('🗞️ [FIXED] Fetching news categories after RLS fix...');
      const { data, error } = await supabase
        .from("posts")
        .select("category")
        .not("category", "is", null)
        .eq("status", "published")
        .order("category");
      
      if (error) {
        console.error('🗞️ [ERROR] Error fetching categories:', error);
        toast({
          title: "Error fetching categories",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
      
      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(data.map((item) => item.category))
      ).filter(Boolean) as string[];
      
      console.log('🗞️ [SUCCESS] Categories fetched after RLS fix:', uniqueCategories);
      return uniqueCategories;
    },
  });

  const { data: posts, isLoading, error } = useQuery({
    queryKey: ["news-posts", selectedCategory, searchTerm],
    queryFn: async () => {
      console.log('🗞️ [NETWORK] Making fresh database request with filters:', { 
        selectedCategory, 
        searchTerm,
        isAuthenticated: !!user,
        userId: user?.id,
        timestamp: new Date().toISOString()
      });
      
      let query = supabase
        .from("posts")
        .select(`
          id,
          title,
          content,
          featured_image,
          post_date,
          category,
          author,
          author_name,
          status,
          created_at,
          updated_at,
          tags,
          excerpt
        `)
        .eq("status", "published")
        .order("post_date", { ascending: false });
        
      if (selectedCategory) {
        query = query.eq("category", selectedCategory);
      }
      
      console.log('🗞️ [NETWORK] Executing database query...');
      const { data, error } = await query;
      console.log('🗞️ [NETWORK] Database response received:', {
        success: !error,
        dataReceived: !!data,
        recordCount: data?.length || 0,
        errorMessage: error?.message
      });
      
      console.log('🗞️ [FIXED] Raw database response after RLS fix:', { 
        data: data?.length ? `${data.length} posts` : 'No posts',
        error: error?.message || 'No error',
        count: data?.length,
        isAuthenticated: !!user,
        firstPostTitle: data?.[0]?.title
      });
      
      if (error) {
        console.error('🗞️ [ERROR] Error fetching posts:', error);
        toast({
          title: "Error fetching posts",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
      
      // Filter by search term if provided
      let filteredData = data as Post[];
      if (searchTerm.trim() !== "") {
        const term = searchTerm.toLowerCase();
        filteredData = filteredData.filter(post => 
          post.title.toLowerCase().includes(term) || 
          post.content.toLowerCase().includes(term)
        );
        console.log('🗞️ [FIXED] Posts after search filter:', filteredData.length);
      }
      
      console.log('🗞️ [SUCCESS] Final posts data after RLS fix:', {
        totalPosts: filteredData.length,
        firstPost: filteredData[0]?.title || 'No posts',
        postTitles: filteredData.slice(0, 3).map(p => p.title)
      });
      
      return filteredData;
    },
  });

  const handleCategoryFilter = (category: string | null) => {
    console.log('🗞️ [FIXED] Category filter changed:', category);
    setSelectedCategory(category === selectedCategory ? null : category);
  };

  const handleSearch = (term: string) => {
    console.log('🗞️ [FIXED] Search term changed:', term);
    setSearchTerm(term);
  };

  console.log('🗞️ [FIXED] useNewsData returning after RLS fix:', {
    categories: categories?.length || 0,
    posts: posts?.length || 0,
    isLoading,
    error: error?.message || 'No error',
    selectedCategory,
    searchTerm,
    isAuthenticated: !!user
  });

  return {
    categories,
    posts,
    isLoading,
    error,
    selectedCategory,
    searchTerm,
    handleCategoryFilter,
    handleSearch,
  };
};

export default useNewsData;
