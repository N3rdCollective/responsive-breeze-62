
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { NewsStatus } from "../NewsForm";

interface FetchNewsPostCallbacks {
  setTitle: (title: string) => void;
  setContent: (content: string) => void;
  setExcerpt: (excerpt: string) => void;
  setStatus: (status: NewsStatus) => void;
  setCategory: (category: string) => void;
  setTags: (tags: string[]) => void;
  setCurrentFeaturedImageUrl: (url: string) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export const useFetchNewsPost = () => {
  const { toast } = useToast();

  const fetchNewsPost = async (postId: string, callbacks: FetchNewsPostCallbacks) => {
    const {
      setTitle,
      setContent,
      setExcerpt,
      setStatus,
      setCategory,
      setTags,
      setCurrentFeaturedImageUrl,
      setIsLoading
    } = callbacks;
    
    if (!postId) {
      console.log("[useFetchNewsPost] No postId provided");
      setIsLoading(false);
      return;
    }
    
    try {
      console.log("[useFetchNewsPost] Fetching news post with ID:", postId);
      
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", postId)
        .maybeSingle();
      
      if (error) {
        console.error("[useFetchNewsPost] Error fetching news post:", error);
        toast({
          title: "Error",
          description: `Failed to load news post: ${error.message}`,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      if (!data) {
        console.error("[useFetchNewsPost] News post not found with ID:", postId);
        toast({
          title: "Error",
          description: "News post not found",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      console.log("[useFetchNewsPost] Post data fetched successfully:", {
        id: data.id,
        title: data.title,
        status: data.status,
        category: data.category
      });
      
      // Set all the form data from the fetched post
      setTitle(data.title || "");
      setContent(data.content || "");
      setExcerpt(data.excerpt || "");
      
      // Ensure valid status values
      if (data.status === "published" || data.status === "draft") {
        console.log("[useFetchNewsPost] Setting status to:", data.status);
        setStatus(data.status);
      } else {
        console.log("[useFetchNewsPost] Invalid status value, defaulting to draft:", data.status);
        setStatus("draft");
      }
      
      setCategory(data.category || "");
      
      // Handle tags from the database
      if (data.tags && Array.isArray(data.tags)) {
        console.log("[useFetchNewsPost] Setting tags:", data.tags);
        setTags(data.tags);
      } else {
        console.log("[useFetchNewsPost] No tags found, setting empty array");
        setTags([]);
      }
      
      setCurrentFeaturedImageUrl(data.featured_image || "");
      setIsLoading(false);
      
      console.log("[useFetchNewsPost] All data set successfully");
    } catch (error) {
      console.error("[useFetchNewsPost] Error in fetchNewsPost:", error);
      toast({
        title: "Error",
        description: "Failed to load news post",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return { fetchNewsPost };
};
