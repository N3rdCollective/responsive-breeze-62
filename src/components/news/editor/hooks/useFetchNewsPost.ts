
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

  const fetchNewsPost = async (postId: string | undefined, callbacks: FetchNewsPostCallbacks) => {
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
    
    console.log("[useFetchNewsPost] Starting fetch with postId:", postId);
    
    if (!postId) {
      console.log("[useFetchNewsPost] No postId provided, setting up for new post");
      setIsLoading(false);
      return;
    }
    
    if (typeof postId !== 'string' || postId.trim() === '') {
      console.log("[useFetchNewsPost] Invalid postId:", postId);
      setIsLoading(false);
      return;
    }
    
    try {
      console.log("[useFetchNewsPost] Fetching news post with ID:", postId);
      setIsLoading(true);
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 10000);
      });
      
      const fetchPromise = supabase
        .from("posts")
        .select("*")
        .eq("id", postId)
        .maybeSingle();
      
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;
      
      console.log("[useFetchNewsPost] Supabase response:", { data, error });
      
      if (error) {
        console.error("[useFetchNewsPost] Error fetching news post:", error);
        toast({
          title: "Error",
          description: `Failed to load news post. Please try refreshing the page.`,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      if (!data) {
        console.error("[useFetchNewsPost] News post not found with ID:", postId);
        toast({
          title: "Post Not Found",
          description: `No news post found with ID: ${postId}. Redirecting to create new post.`,
          variant: "destructive",
        });
        // Reset form for new post instead of staying in loading state
        setTitle("");
        setContent("");
        setExcerpt("");
        setStatus("draft");
        setCategory("");
        setTags([]);
        setCurrentFeaturedImageUrl("");
        setIsLoading(false);
        return;
      }
      
      console.log("[useFetchNewsPost] Post data fetched successfully:", {
        id: data.id,
        title: data.title,
        status: data.status,
        category: data.category,
        tags: data.tags,
        featured_image: data.featured_image
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
        description: "Failed to load news post. Please refresh the page and try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return { fetchNewsPost };
};
