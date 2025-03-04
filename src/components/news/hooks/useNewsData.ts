
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Post } from "../types/newsTypes";

export const useNewsData = () => {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const { data: categories } = useQuery({
    queryKey: ["news-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("category")
        .not("category", "is", null)
        .order("category");
      
      if (error) {
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
      
      return uniqueCategories;
    },
  });

  const { data: posts, isLoading, error } = useQuery({
    queryKey: ["news-posts", selectedCategory],
    queryFn: async () => {
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
        toast({
          title: "Error fetching posts",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
      
      return data as Post[];
    },
  });

  const handleCategoryFilter = (category: string | null) => {
    setSelectedCategory(category === selectedCategory ? null : category);
  };

  return {
    categories,
    posts,
    isLoading,
    error,
    selectedCategory,
    handleCategoryFilter,
  };
};

export default useNewsData;
