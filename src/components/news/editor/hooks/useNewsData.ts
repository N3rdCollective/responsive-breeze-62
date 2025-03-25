
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
    console.log("useNewsData - savePost called with data:", {
      id: postData.id,
      title: postData.title,
      status: postData.status,
      userRole: "admin" // For debugging
    });
    
    return await saveNewsPost(postData, callbacks);
  };

  return {
    fetchNewsPost,
    saveNewsPost: savePost
  };
};
