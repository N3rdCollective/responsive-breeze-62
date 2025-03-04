
import { useFetchNewsPost } from "./useFetchNewsPost";
import { useSaveNewsPost, type NewsPostData, type SaveNewsPostCallbacks } from "./useSaveNewsPost";

export const useNewsData = () => {
  const { fetchNewsPost } = useFetchNewsPost();
  const { saveNewsPost } = useSaveNewsPost();

  return {
    fetchNewsPost,
    saveNewsPost
  };
};
