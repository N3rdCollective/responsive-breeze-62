
import { useSaveNewsPost } from "./useSaveNewsPost";
import { useFetchNewsPost } from "./useFetchNewsPost";
import { NewsPostData } from "./useSaveNewsPost";

interface SaveCallbacks {
  uploadImage: (file: File) => Promise<string | null>;
  setIsSaving: (isSaving: boolean) => void;
  setIsUploading: (isUploading: boolean) => void;
  onSuccess: () => void;
}

export const useNewsData = () => {
  const { saveNewsPost } = useSaveNewsPost();
  const { fetchNewsPost } = useFetchNewsPost();

  /**
   * Save news post wrapper function
   */
  const savePost = async (
    postData: NewsPostData,
    callbacks: SaveCallbacks
  ) => {
    console.log("[useNewsData] savePost called with data:", {
      id: postData.id,
      title: postData.title,
      status: postData.status,
      category: postData.category,
      userRole: "admin", // For debugging
      currentFeaturedImageUrl: postData.currentFeaturedImageUrl,
    });
    
    // Explicitly ensure status is passed through correctly
    const dataToSave: NewsPostData = {
      ...postData,
      status: postData.status, // Explicitly include status
      category: postData.category || 'Uncategorized'
    };
    
    console.log("[useNewsData] final data being sent to saveNewsPost:", {
      status: dataToSave.status,
      category: dataToSave.category
    });
    
    try {
      const result = await saveNewsPost(dataToSave, callbacks);
      console.log("[useNewsData] saveNewsPost result:", result);
      return result;
    } catch (error) {
      console.error("[useNewsData] Error in savePost:", error);
      throw error;
    }
  };

  return {
    fetchNewsPost,
    saveNewsPost: savePost
  };
};
