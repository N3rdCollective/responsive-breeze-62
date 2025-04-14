
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
  const { data: categories = [] } = useQuery({
    queryKey: ["news-categories"],
    queryFn: async () => {
      console.log("Fetching news categories...");
      const { data, error } = await supabase
        .from("posts")
        .select("category")
        .not("category", "is", null)
        .eq("status", "published")
        .order("category");
      
      if (error) {
        console.error("Error fetching categories:", error);
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
      
      console.log("Fetched categories:", uniqueCategories);
      return uniqueCategories;
    },
  });

  // Fetch posts with filters
  const { data: posts = [], isLoading, error } = useQuery({
    queryKey: ["news-posts", selectedCategory, searchTerm],
    queryFn: async () => {
      console.log("Fetching news posts with filters:", { selectedCategory, searchTerm });
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
        console.error("Error fetching posts:", error);
        toast({
          title: "Error fetching posts",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
      
      console.log(`Fetched ${data.length} posts successfully`);
      
      // Filter by search term if provided
      let filteredData = data as Post[];
      if (searchTerm.trim() !== "") {
        const term = searchTerm.toLowerCase();
        filteredData = filteredData.filter(post => 
          (post.title?.toLowerCase().includes(term) || 
          post.content?.toLowerCase().includes(term) ||
          post.category?.toLowerCase().includes(term) ||
          (post.tags && post.tags.some(tag => tag.toLowerCase().includes(term))))
        );
        console.log(`After search filtering: ${filteredData.length} posts`);
      }
      
      return filteredData;
    },
  });

  const handleCategoryFilter = (category: string | null) => {
    console.log("Setting category filter:", category);
    setSelectedCategory(category === selectedCategory ? null : category);
  };

  const handleSearch = (term: string) => {
    console.log("Setting search term:", term);
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
