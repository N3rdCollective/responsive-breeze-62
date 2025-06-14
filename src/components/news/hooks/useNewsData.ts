
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Post } from "../types/newsTypes";

export const useNewsData = () => {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  console.log('🗞️ useNewsData: Starting news data fetch...');
  
  const { data: categories } = useQuery({
    queryKey: ["news-categories"],
    queryFn: async () => {
      console.log('🗞️ Fetching news categories...');
      const { data, error } = await supabase
        .from("posts")
        .select("category")
        .not("category", "is", null)
        .eq("status", "published")
        .order("category");
      
      if (error) {
        console.error('🗞️ Error fetching categories:', error);
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
      
      console.log('🗞️ Categories fetched:', uniqueCategories);
      return uniqueCategories;
    },
  });

  const { data: posts, isLoading, error } = useQuery({
    queryKey: ["news-posts", selectedCategory, searchTerm],
    queryFn: async () => {
      console.log('🗞️ Fetching news posts with filters:', { selectedCategory, searchTerm });
      
      let query = supabase
        .from("posts")
        .select("*")
        .eq("status", "published")
        .order("post_date", { ascending: false });
        
      if (selectedCategory) {
        query = query.eq("category", selectedCategory);
      }
      
      const { data, error } = await query;
      
      console.log('🗞️ Raw database response:', { data, error, count: data?.length });
      
      if (error) {
        console.error('🗞️ Error fetching posts:', error);
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
        console.log('🗞️ Posts after search filter:', filteredData.length);
      }
      
      console.log('🗞️ Final posts data:', {
        totalPosts: filteredData.length,
        firstPost: filteredData[0],
        postTitles: filteredData.map(p => p.title)
      });
      
      return filteredData;
    },
  });

  const handleCategoryFilter = (category: string | null) => {
    console.log('🗞️ Category filter changed:', category);
    setSelectedCategory(category === selectedCategory ? null : category);
  };

  const handleSearch = (term: string) => {
    console.log('🗞️ Search term changed:', term);
    setSearchTerm(term);
  };

  console.log('🗞️ useNewsData returning:', {
    categories,
    posts,
    postsCount: posts?.length,
    isLoading,
    error,
    selectedCategory,
    searchTerm
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
