
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { NewsStatus } from "./NewsForm";
import { useNewsState } from "./hooks/useNewsState";
import { useNewsData } from "./hooks/useNewsData";
import { useImageHandler } from "./hooks/useImageHandler";

interface UseNewsEditorProps {
  id?: string;
  staffName: string;
}

export const useNewsEditor = ({ id, staffName }: UseNewsEditorProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { handleImageUpload } = useImageHandler();
  const { fetchNewsPost, saveNewsPost } = useNewsData();
  
  // Use the state hook to manage all form state
  const {
    title, setTitle,
    content, setContent,
    excerpt, setExcerpt,
    status, setStatus,
    category, setCategory,
    tags, setTags,
    featuredImage, setFeaturedImage,
    currentFeaturedImageUrl, setCurrentFeaturedImageUrl,
    isLoading, setIsLoading,
    isSaving, setIsSaving,
    isUploading, setIsUploading,
    isPreviewModalOpen, setIsPreviewModalOpen
  } = useNewsState();

  // Fetch the news post data
  const fetchNewsPostData = async () => {
    if (!id) {
      // Set default state for new post
      setIsLoading(false);
      return;
    }
    
    console.log("Fetching post data for ID:", id);
    await fetchNewsPost(id, {
      setTitle,
      setContent,
      setExcerpt,
      setStatus,
      setCategory,
      setTags,
      setCurrentFeaturedImageUrl,
      setIsLoading
    });
  };

  // Handle image selection
  const handleImageSelected = (file: File) => {
    console.log("Image selected:", file.name, file.size);
    setFeaturedImage(file);
    
    toast({
      title: "Image Selected",
      description: "Image will be uploaded when you save the post",
    });
  };
  
  // Save the news post
  const handleSave = async () => {
    console.log("Save requested with featured image:", featuredImage?.name);
    console.log("Current featured image URL:", currentFeaturedImageUrl);
    
    await saveNewsPost(
      {
        id,
        title,
        content,
        excerpt,
        status,
        category,
        tags,
        featuredImage,
        currentFeaturedImageUrl,
        staffName
      },
      {
        uploadImage: handleImageUpload,
        setIsSaving,
        setIsUploading,
        onSuccess: () => {
          toast({
            title: "Success",
            description: id ? "News post updated successfully" : "News post created successfully",
          });
          navigate("/staff/news");
        }
      }
    );
  };

  return {
    // State
    title,
    setTitle,
    content,
    setContent,
    excerpt,
    setExcerpt,
    status,
    setStatus,
    category,
    setCategory,
    tags,
    setTags,
    currentFeaturedImageUrl,
    isLoading,
    isSaving,
    isUploading,
    isPreviewModalOpen,
    setIsPreviewModalOpen,
    
    // Methods
    fetchNewsPost: fetchNewsPostData,
    handleImageSelected,
    handleSave
  };
};
