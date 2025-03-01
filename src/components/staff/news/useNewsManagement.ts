
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Post {
  id: string;
  title: string;
  content: string;
  featured_image: string | null;
  post_date: string;
  category: string | null;
  author: string | null;
  status: string;
  created_at: string;
}

export const useNewsManagement = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: posts, isLoading, error, refetch } = useQuery({
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
        return [];
      }
      
      return data as Post[];
    },
  });

  const filteredPosts = posts?.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (post.category && post.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return {
    posts,
    filteredPosts,
    isLoading,
    error,
    refetch,
    searchTerm,
    setSearchTerm
  };
};
