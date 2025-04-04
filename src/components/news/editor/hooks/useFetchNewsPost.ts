
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
      setIsLoading(false);
      return;
    }
    
    try {
      console.log("Fetching news post with ID:", postId);
      
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", postId)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching news post:", error);
        toast({
          title: "Error",
          description: `Failed to load news post: ${error.message}`,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      if (!data) {
        console.error("News post not found with ID:", postId);
        toast({
          title: "Error",
          description: "News post not found",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      console.log("Post data fetched successfully:", data);
      
      // Properly set all the form data from the fetched post
      setTitle(data.title || "");
      setContent(data.content || "");
      setExcerpt(data.excerpt || "");
      
      // Make sure we explicitly check for valid status values
      if (data.status === "published" || data.status === "draft") {
        console.log("Setting status to:", data.status);
        setStatus(data.status);
      } else {
        console.log("Invalid status value, defaulting to draft:", data.status);
        setStatus("draft");
      }
      
      setCategory(data.category || "");
      
      // Handle tags from the database
      if (data.tags && Array.isArray(data.tags)) {
        setTags(data.tags);
      } else {
        setTags([]);
      }
      
      setCurrentFeaturedImageUrl(data.featured_image || "");
      setIsLoading(false);
    } catch (error) {
      console.error("Error in fetchNewsPost:", error);
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
