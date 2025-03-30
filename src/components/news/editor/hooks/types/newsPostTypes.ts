
/**
 * Post data for saving
 */
export interface NewsPostData {
  id?: string;
  title: string;
  content: string;
  excerpt: string;
  status: "published" | "draft";
  category: string;
  tags: string[];
  featuredImage: File | null;
  currentFeaturedImageUrl: string;
  staffName: string;
}

/**
 * Callbacks for the save operation
 */
export interface SaveNewsPostCallbacks {
  uploadImage: (file: File) => Promise<string | null>;
  setIsSaving: (isSaving: boolean) => void;
  setIsUploading: (isUploading: boolean) => void;
  onSuccess: () => void;
}
