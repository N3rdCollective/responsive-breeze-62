
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

/**
 * Callbacks for updating post data state
 */
export interface FetchNewsPostCallbacks {
  setTitle: (title: string) => void;
  setContent: (content: string) => void;
  setExcerpt: (excerpt: string) => void;
  setStatus: (status: any) => void;
  setCurrentFeaturedImageUrl: (url: string) => void;
  setIsLoading: (isLoading: boolean) => void;
}

/**
 * Hook for fetching news post data
 * @returns Function to fetch news post by ID
 */
export const useFetchNewsPost = () => {
  const { toast } = useToast();

  /**
   * Fetches a news post by ID and updates state via callbacks
   * @param id Post ID to fetch
   * @param callbacks Object containing state setter functions
   */
  const fetchNewsPost = async (id: string, callbacks: FetchNewsPostCallbacks) => {
    const { setTitle, setContent, setExcerpt, setStatus, setCurrentFeaturedImageUrl, setIsLoading } = callbacks;
    
    if (!id) return; // Exit early if no ID (creating a new post)
    
    setIsLoading(true);
    try {
      console.log("Fetching post with ID:", id);
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .single();
        
      if (error) throw error;
      
      console.log("Fetched post data:", data);
      if (data) {
        setTitle(data.title);
        setContent(data.content || "");
        setExcerpt(data.excerpt || "");
        setStatus(data.status || "draft");
        
        if (data.featured_image) {
          setCurrentFeaturedImageUrl(data.featured_image);
        }
      }
    } catch (error) {
      console.error("Error fetching news post:", error);
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
