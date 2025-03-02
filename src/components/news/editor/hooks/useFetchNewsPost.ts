
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { NewsStatus } from "../NewsForm";

interface FetchNewsPostCallbacks {
  setTitle: (title: string) => void;
  setContent: (content: string) => void;
  setExcerpt: (excerpt: string) => void;
  setStatus: (status: NewsStatus) => void;
  setCategory: (category: string) => void;
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
      setCurrentFeaturedImageUrl,
      setIsLoading
    } = callbacks;
    
    try {
      console.log("Fetching news post with ID:", postId);
      
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", postId)
        .single();
      
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
      
      console.log("Post data fetched:", data);
      
      if (data) {
        setTitle(data.title || "");
        setContent(data.content || "");
        setExcerpt(data.excerpt || "");
        
        if (data.status === "published" || data.status === "draft") {
          setStatus(data.status);
        } else {
          setStatus("draft");
        }
        
        setCategory(data.category || "");
        setCurrentFeaturedImageUrl(data.featured_image || "");
      }
    } catch (error) {
      console.error("Error in fetchNewsPost:", error);
      toast({
        title: "Error",
        description: "Failed to load news post",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { fetchNewsPost };
};
