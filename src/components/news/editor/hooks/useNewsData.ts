
import { useFetchNewsPost } from './useFetchNewsPost';
import { useSaveNewsPost } from './useSaveNewsPost';
import { extractTextFromHtml } from '../utils/textUtils';
import type { Post } from '../types/newsTypes';

/**
 * Main hook that combines fetching and saving news posts
 */
export const useNewsData = () => {
  const { fetchNewsPost } = useFetchNewsPost();
  const { saveNewsPost } = useSaveNewsPost();

  return {
    fetchNewsPost,
    saveNewsPost,
    extractTextFromHtml
  };
};

// Re-export the Post type for convenience
export type { Post };
