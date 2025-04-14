
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Post } from "../types/newsTypes";

export const useNewsData = () => {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["news-categories"],
    queryFn: async () => {
      console.log("[useNewsData] Fetching categories");
      const { data, error } = await supabase
        .from("posts")
        .select("category")
        .not("category", "is", null)
        .order("category");
      
      if (error) {
        console.error("[useNewsData] Error fetching categories:", error);
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
      
      console.log("[useNewsData] Fetched categories:", uniqueCategories);
      return uniqueCategories;
    },
  });

  // Fetch posts with category and search filtering
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ["news-posts", selectedCategory, searchTerm],
    queryFn: async () => {
      console.log("[useNewsData] Fetching posts with filters:", { selectedCategory, searchTerm });
      let query = supabase
        .from("posts")
        .select("*")
        .eq("status", "published")
        .order("post_date", { ascending: false });
        
      if (selectedCategory) {
        query = query.eq("category", selectedCategory);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("[useNewsData] Error fetching posts:", error);
        toast({
          title: "Error fetching posts",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
      
      console.log("[useNewsData] Raw posts data:", data);
      
      // Filter by search term if provided
      let filteredData = data as Post[];
      if (searchTerm.trim() !== "") {
        const term = searchTerm.toLowerCase();
        filteredData = filteredData.filter(post => 
          post.title.toLowerCase().includes(term) || 
          (post.content && post.content.toLowerCase().includes(term))
        );
        console.log("[useNewsData] Posts after search filter:", filteredData.length);
      }
      
      return filteredData;
    },
  });

  const handleCategoryFilter = (category: string | null) => {
    console.log("[useNewsData] Setting category filter:", category);
    setSelectedCategory(category === selectedCategory ? null : category);
  };

  const handleSearch = (term: string) => {
    console.log("[useNewsData] Setting search term:", term);
    setSearchTerm(term);
  };

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
